export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { EnquetesManager } from '@/components/admin/enquetes-manager'

export const metadata = {
  title: 'Gestão de Enquetes | Painel Admin',
}

export default async function EnquetesAdminPage() {
  const supabase = createAdminClient()
  
  // 1. Busca Enquetes com Opções e Votos sem depender de FK inferida pelo PostgREST
  const { data: enquetes, error } = await supabase
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

  // 2. Busca Configuração da Pesquisa de Satisfação
  const { data: config } = await supabase
    .from('plataforma_config')
    .select('valor')
    .eq('chave', 'funcionalidade.pesquisa_satisfacao_ativa')
    .maybeSingle()

  const { data: newsletterConfig } = await supabase
    .from('plataforma_config')
    .select('valor')
    .eq('chave', 'funcionalidade.newsletter_ativa')
    .maybeSingle()

  // 3. Busca Estatísticas da Pesquisa de Satisfação Global
  const { data: feedbackData } = await supabase
    .from('pesquisas_satisfacao')
    .select('voto')

  // Agrupar votos por tipo
  const feedbackStats = (feedbackData || []).reduce((acc: any, cur: any) => {
    acc[cur.voto] = (acc[cur.voto] || 0) + 1
    return acc
  }, { ruim: 0, regular: 0, bom: 0, excelente: 0 })
  feedbackStats.total = (feedbackData || []).length

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar enquetes: {error.message}</div>
  }

  // Processar dados para o componente
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

  const satisfacaoAtiva = config?.valor === true || config?.valor === 'true'
  const newsletterAtiva = newsletterConfig?.valor === true || newsletterConfig?.valor === 'true'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tighter uppercase italic">
            Gestão de <span className="text-primary underline decoration-secondary decoration-4 underline-offset-4">Engajamento</span>
          </h1>
          <p className="text-muted text-sm font-medium">Configure enquetes e pesquisas de satisfação para o público.</p>
        </div>
      </div>

      <EnquetesManager 
        initialEnquetes={processedEnquetes} 
        satisfacaoAtiva={satisfacaoAtiva} 
        newsletterAtiva={newsletterAtiva}
        feedbackStats={feedbackStats}
      />
    </div>
  )
}
