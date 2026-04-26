import { createAdminClient } from '@/lib/supabase-admin'

export async function getSystemHealthStats() {
  const supabase = createAdminClient()
  
  try {
    // 1. Data Health (Storage Cleanup Logs)
    const { data: lastCleanup } = await supabase
      .from('logs_manutencao')
      .select('*')
      .eq('tipo', 'cleanup_storage')
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 2. Integration Health (Failed Despachos)
    const { count: failedIntegrations } = await supabase
      .from('despacho_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'erro')

    // 3. Security Pulse (Blocked Users & PII Access)
    const { count: blockedUsers } = await supabase
      .from('blacklist_usuarios')
      .select('*', { count: 'exact', head: true })

    const { count: recentPiiAccess } = await supabase
      .from('audit_identidade')
      .select('*', { count: 'exact', head: true })
      .gte('acessado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // 4. Detalhamento de Integrações por Categoria (STATUS DAS ENTREGAS)
    const { data: catIntegrations } = await supabase
      .from('categorias')
      .select(`
        id,
        slug,
        label,
        integracoes_destino (
          id,
          tipo,
          ativo
        )
      `)
      .order('ordem', { ascending: true })

    // Busca logs das últimas 24h para contar sucessos/falhas
    const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: logsRecent } = await supabase
      .from('log_integracoes')
      .select('integracao_id, status, disparado_em')
      .gte('disparado_em', umDiaAtras)

    const detailedIntegrations = (catIntegrations || []).map(cat => {
      const integrations = cat.integracoes_destino || []
      const intIds = integrations.map((i: any) => i.id)
      
      const catLogs = (logsRecent || []).filter(l => intIds.includes(l.integracao_id))
      const sucessos = catLogs.filter(l => l.status === 'sucesso').length
      const falhas = catLogs.filter(l => l.status === 'falha').length
      const ultimoDisparo = catLogs.length > 0 
        ? catLogs.sort((a, b) => new Date(b.disparado_em).getTime() - new Date(a.disparado_em).getTime())[0].disparado_em 
        : null

      return {
        id: cat.id,
        categoria_id: cat.id,
        categoria_nome: cat.label,
        categoria_slug: cat.slug,
        tem_email: integrations.some((i: any) => i.tipo === 'email' || i.tipo === 'ambos'),
        tem_webhook: integrations.some((i: any) => i.tipo === 'webhook' || i.tipo === 'ambos'),
        saudavel: falhas === 0,
        sucessos,
        falhas,
        ultimo_disparo: ultimoDisparo
      }
    })

    // 5. Denuncias por Status
    const { data: denunciasStatus } = await supabase
      .from('denuncias')
      .select('status')

    const statusCounts = denunciasStatus?.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1
      return acc
    }, {})

    return {
      success: true,
      dataHealth: {
        lastCleanup: lastCleanup || null,
      },
      integrationHealth: {
        failedCount: failedIntegrations || 0,
        detailed: detailedIntegrations
      },
      securityPulse: {
        blockedCount: blockedUsers || 0,
        recentPiiAccess: recentPiiAccess || 0,
      },
      denunciasStats: statusCounts || {}
    }

  } catch (err: any) {
    console.error('[health] Erro ao buscar estatísticas:', err)
    return { success: false, error: err.message }
  }
}

export async function retryFailedIntegrations() {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('despacho_queue')
      .update({ status: 'pendente', tentativas: 0 })
      .eq('status', 'erro')

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
