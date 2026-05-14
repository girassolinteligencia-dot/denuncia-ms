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

  // 3. Busca Enquetes
  const { data: enquetes } = await supabase.from('enquetes').select('*, opcoes:enquete_opcoes(*), votos:enquete_votos(opcao_id)')

  // 4. Busca Configurações de Funcionalidades
  const { data: configs } = await supabase.from('plataforma_config').select('chave, valor').in('chave', ['funcionalidade.pesquisa_satisfacao_ativa', 'funcionalidade.boletim_ativo'])
  const configMap = (configs || []).reduce((acc: any, cur: any) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const satisfacaoAtiva = configMap['funcionalidade.pesquisa_satisfacao_ativa'] === 'true' || configMap['funcionalidade.pesquisa_satisfacao_ativa'] === true
  const boletimAtivo = configMap['funcionalidade.boletim_ativo'] === 'true' || configMap['funcionalidade.boletim_ativo'] === true


  // 5. Busca Estatísticas da Pesquisa de Satisfação Global
  const { data: feedbackData } = await supabase.from('pesquisas_satisfacao').select('voto')
  const feedbackStats = (feedbackData || []).reduce((acc: any, cur: any) => {
    acc[cur.voto] = (acc[cur.voto] || 0) + 1
    return acc
  }, { ruim: 0, regular: 0, bom: 0, excelente: 0 })
  feedbackStats.total = (feedbackData || []).length

  const processedEnquetes = (enquetes || []).map(e => ({
    ...e,
    total_votos: e.votos?.length || 0,
    opcoes: e.opcoes.map((o: any) => ({
      ...o,
      votos: e.votos?.filter((v: any) => v.opcao_id === o.id).length || 0
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
        feedbackStats={feedbackStats}
      />
    </div>
  )
}
