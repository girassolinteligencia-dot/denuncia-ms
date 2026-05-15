'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function getPublicIntelligenceData() {
  const supabase = createAdminClient()

  try {
    // 1. Live Feed (Últimas 15 movimentações para o ticker)
    const { data: feedData } = await supabase
      .from('denuncias')
      .select(`
        id, 
        cidade, 
        status, 
        criado_em, 
        categoria_id,
        categorias ( label )
      `)
      .order('atualizado_em', { ascending: false })
      .limit(15)

    const liveFeed = (feedData || []).map(d => {
      const tempo = formatDistanceToNow(new Date(d.criado_em), { addSuffix: true, locale: ptBR })
      let actionText = 'Nova denúncia recebida'
      if (d.status === 'em_analise') actionText = 'Denúncia em análise pela equipe'
      if (d.status === 'encaminhada') actionText = 'Denúncia encaminhada ao órgão'
      if (d.status === 'resolvida') actionText = 'Denúncia resolvida/arquivada'

      return {
        id: d.id,
        tempo,
        texto: `${actionText} em ${d.cidade || 'MS'} - ${(d.categorias as any)?.label || 'Geral'}`
      }
    })

    // 2. Ranking de Assuntos / Categorias (Top 5)
    // Contagem simplificada (numa aplicação enorme usaríamos uma View ou RPC)
    const { data: catData } = await supabase
      .from('denuncias')
      .select('categorias ( label, slug, integracoes_destino ( tipo, orgao ) )')
      .gte('criado_em', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias

    const categoryCount: Record<string, number> = {}
    const organCount: Record<string, number> = {}

    ;(catData || []).forEach(item => {
      const label = (item.categorias as any)?.label || 'Geral'
      categoryCount[label] = (categoryCount[label] || 0) + 1
      
      // Tentar inferir o órgão a partir das integrações (se existir, ou usar o nome da categoria)
      // Como o design do banco não tem 'orgao' explícito na denúncia, mapeamos o destino:
      const orgao = label // Fallback simplificado: a categoria vira o órgão (ex: Saúde -> Sec. Saúde)
      organCount[orgao] = (organCount[orgao] || 0) + 1
    })

    const topTrends = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const topOrgans = Object.entries(organCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // 3. Medidor de Privacidade (Total de PIIs salvas)
    const { count: privacyCount } = await supabase
      .from('denuncias')
      .select('*', { count: 'exact', head: true })
      .not('telefone_enc', 'is', null)

    return {
      success: true,
      data: {
        liveFeed,
        topTrends,
        topOrgans,
        privacyShield: privacyCount || 0
      }
    }
  } catch (error) {
    console.error('Erro getPublicIntelligenceData:', error)
    return { success: false, data: null }
  }
}
