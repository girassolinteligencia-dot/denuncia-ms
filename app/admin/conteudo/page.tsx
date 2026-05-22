export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { UnifiedConteudoTabs } from '@/components/admin/unified-conteudo-tabs'

export const metadata = {
  title: 'Gestão de Conteúdo | Painel Admin',
}

export default async function ConteudoAdminPage() {
  const supabase = createAdminClient()
  
  // 1. Busca Notícias
  const { data: news } = await supabase.from('noticias').select('*').order('criado_em', { ascending: false })
  
  // 2. Busca Banners
  const { data: banners } = await supabase.from('banners').select('*').order('ordem', { ascending: true })

  // 3. Busca Enquetes sem depender de relacionamentos no schema cache do PostgREST
  const { data: enquetes } = await supabase
    .from('enquetes')
    .select('*')
    .order('criado_em', { ascending: false })

  const enqueteIds = (enquetes || []).map((enquete) => enquete.id)
  const [{ data: opcoes }, { data: votos }] = enqueteIds.length > 0
    ? await Promise.all([
        supabase
          .from('enquete_opcoes')
          .select('*')
          .in('enquete_id', enqueteIds)
          .order('ordem', { ascending: true }),
        supabase
          .from('enquete_votos')
          .select('enquete_id, opcao_id')
          .in('enquete_id', enqueteIds),
      ])
    : [{ data: [] }, { data: [] }]

  // 4. Busca Configurações de Funcionalidades
  const { data: configs } = await supabase.from('plataforma_config').select('chave, valor').in('chave', ['funcionalidade.pesquisa_satisfacao_ativa', 'funcionalidade.boletim_ativo', 'funcionalidade.newsletter_ativa'])
  const configMap = (configs || []).reduce((acc: any, cur: any) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const satisfacaoAtiva = configMap['funcionalidade.pesquisa_satisfacao_ativa'] === 'true' || configMap['funcionalidade.pesquisa_satisfacao_ativa'] === true
  const boletimAtivo = configMap['funcionalidade.boletim_ativo'] === 'true' || configMap['funcionalidade.boletim_ativo'] === true
  const newsletterAtiva = configMap['funcionalidade.newsletter_ativa'] === 'true' || configMap['funcionalidade.newsletter_ativa'] === true


  // 5. Busca Estatísticas da Pesquisa de Satisfação Global
  const { data: feedbackData } = await supabase.from('pesquisas_satisfacao').select('voto')
  const feedbackStats = (feedbackData || []).reduce((acc: any, cur: any) => {
    acc[cur.voto] = (acc[cur.voto] || 0) + 1
    return acc
  }, { ruim: 0, regular: 0, bom: 0, excelente: 0 })
  feedbackStats.total = (feedbackData || []).length

  const processedEnquetes = (enquetes || []).map(e => ({
    ...e,
    titulo: e.titulo || e.pergunta || 'Enquete',
    local_exibicao: e.local_exibicao || 'landing',
    data_expiracao: e.data_expiracao || null,
    limite_votos: e.limite_votos || null,
    encerrada_manualmente: e.encerrada_manualmente || false,
    total_votos: (votos || []).filter((v: any) => v.enquete_id === e.id).length,
    opcoes: ((opcoes || []).filter((o: any) => o.enquete_id === e.id).length > 0
      ? (opcoes || []).filter((o: any) => o.enquete_id === e.id)
      : (Array.isArray(e.opcoes) ? e.opcoes.map((opcao: any, index: number) => ({
          id: opcao?.id || `${e.id}-${index}`,
          texto: typeof opcao === 'string' ? opcao : opcao?.texto || opcao?.label || `Opção ${index + 1}`,
          ordem: typeof opcao?.ordem === 'number' ? opcao.ordem : index,
        })) : [])
    ).map((o: any) => ({
        ...o,
        votos: (votos || []).filter((v: any) => v.opcao_id === o.id).length || 0
      }))
  }))

  return (
    <div className="space-y-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 italic">
            Módulo de Comunicação Digital
          </div>
          <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">
            Central de <span className="text-secondary underline decoration-primary decoration-8 underline-offset-4">Conteúdo</span>
          </h1>
        </div>
      </div>

      <UnifiedConteudoTabs 
        initialNews={news || []} 
        initialBanners={banners || []} 
        initialEnquetes={processedEnquetes}
        satisfacaoAtiva={satisfacaoAtiva}
        boletimAtivo={boletimAtivo}
        newsletterAtiva={newsletterAtiva}
        feedbackStats={feedbackStats}
      />
    </div>
  )
}
