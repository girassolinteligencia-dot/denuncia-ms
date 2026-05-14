export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { UnifiedSegurancaTabs } from '@/components/admin/unified-seguranca-tabs'
import { getSystemHealthStats } from '@/lib/actions/admin-health'

export const metadata = {
  title: 'Segurança e Diagnóstico | Painel Admin',
}

export default async function SegurancaAdminPage() {
  const supabase = createAdminClient()
  
  // 1. Busca Logs de Auditoria
  const { data: logs } = await supabase
    .from('logs_auditoria')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(100)

  // 2. Health Data Real
  const statsRes = await getSystemHealthStats()
  const stats = statsRes.success ? (statsRes as any) : null

  const health = {
    database: stats ? 'connected' : 'error',
    api: 'stable',
    email_service: stats?.integrationHealth?.failedCount > 0 ? 'warning' : 'active',
    last_check: new Date().toISOString()
  }

  return (
    <div className="space-y-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-warning uppercase tracking-[0.2em] mb-1 italic">
            Módulo de Proteção de Dados
          </div>
          <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">
            Segurança & <span className="text-warning underline decoration-dark decoration-8 underline-offset-4">Diagnóstico</span>
          </h1>
        </div>
      </div>

      <UnifiedSegurancaTabs initialLogs={logs || []} initialHealth={health} />
    </div>
  )
}
