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

    // 4. Denúncias por Status
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
