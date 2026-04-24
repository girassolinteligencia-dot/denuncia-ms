import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { IntegrationsHealthTable } from '@/components/admin/integrations-health-table'
import { Zap, Mail, ShieldCheck, AlertOctagon } from 'lucide-react'

export const metadata = {
  title: 'Monitor de Integrações',
}

export default async function IntegracoesPage() {
  const supabase = createAdminClient()
  
  // Mocking data for the health table for now
  // Real implementation will query log_integracoes aggregated by categoria
  const healthData = [
    {
      id: '1',
      categoria_id: 'cat-1',
      categoria_nome: 'Saúde Pública',
      categoria_slug: 'saude',
      tem_email: true,
      tem_webhook: true,
      saudavel: true,
      sucessos: 142,
      falhas: 0,
      ultimo_disparo: new Date().toISOString()
    },
    {
      id: '2',
      categoria_id: 'cat-2',
      categoria_nome: 'Corrupção',
      categoria_slug: 'corrupcao',
      tem_email: true,
      tem_webhook: false,
      saudavel: false,
      sucessos: 28,
      falhas: 3,
      ultimo_disparo: new Date().toISOString()
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark">Monitor de Integrações</h1>
        <p className="text-muted text-sm">
          Acompanhe o status de entrega das denuncias para os órgãos responsáveis por E-mail e Webhook.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <KPICard title="Webhooks Ativos" value="08" icon={Zap} color="text-secondary" bgColor="bg-secondary-50" />
         <KPICard title="E-mails Configurados" value="12" icon={Mail} color="text-primary" bgColor="bg-primary-50" />
         <KPICard title="Taxa de Sucesso" value="98.2%" icon={ShieldCheck} color="text-success" bgColor="bg-green-50" />
         <KPICard title="Falhas (24h)" value="03" icon={AlertOctagon} color="text-error" bgColor="bg-red-50" />
      </div>

      <IntegrationsHealthTable data={healthData} />
    </div>
  )
}

function KPICard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white rounded-card shadow-card border border-border p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-dark">{value}</p>
      </div>
    </div>
  )
}
