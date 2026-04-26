export const dynamic = 'force-dynamic'
import { getSystemHealthStats } from '@/lib/actions/admin-health'
import { IntegrationsHealthTable } from '@/components/admin/integrations-health-table'
import { Zap, Mail, ShieldCheck, AlertOctagon } from 'lucide-react'

export const metadata = {
  title: 'Monitor de Integrações',
}

export default async function IntegracoesPage() {
  const statsRes = await getSystemHealthStats()
  
  if (!statsRes.success) {
    return <div>Erro ao carregar dados de saúde.</div>
  }

  const healthData = statsRes.integrationHealth.detailed || []
  const failedCount = statsRes.integrationHealth.failedCount || 0
  const totalIntegrations = healthData.length
  const successRate = totalIntegrations > 0 
    ? (((totalIntegrations - healthData.filter(h => !h.saudavel).length) / totalIntegrations) * 100).toFixed(1) 
    : '100'

  const totalEmails = healthData.filter(h => h.tem_email).length
  const totalWebhooks = healthData.filter(h => h.tem_webhook).length


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark">Monitor de Integrações</h1>
        <p className="text-muted text-sm">
          Acompanhe o status de entrega das denuncias para os órgãos responsáveis por E-mail e Webhook.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <KPICard title="Webhooks Ativos" value={totalWebhooks.toString().padStart(2, '0')} icon={Zap} color="text-secondary" bgColor="bg-secondary-50" />
         <KPICard title="E-mails Configurados" value={totalEmails.toString().padStart(2, '0')} icon={Mail} color="text-primary" bgColor="bg-primary-50" />
         <KPICard title="Taxa de Sucesso" value={`${successRate}%`} icon={ShieldCheck} color="text-success" bgColor="bg-green-50" />
         <KPICard title="Falhas (24h)" value={failedCount.toString().padStart(2, '0')} icon={AlertOctagon} color="text-error" bgColor="bg-red-50" />
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
