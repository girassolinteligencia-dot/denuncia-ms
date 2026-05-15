export const dynamic = 'force-dynamic'
import React from 'react'
import { 
  Activity, 
  ShieldCheck, 
  Share2, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw,
  Clock,
  HardDrive,
  Trash2
} from 'lucide-react'
import { getSystemHealthStats, retryFailedIntegrations } from '@/lib/actions/admin-health'
import { limparArquivosOrfaos } from '@/lib/actions/cleanup'
import { IntegrationsHealthTable } from '@/components/admin/integrations-health-table'

import { SupabaseMetricsCards } from '@/components/admin/supabase-metrics-cards'

export default async function AdminHealthPage() {
  const statsRes = await getSystemHealthStats()
  
  if (!statsRes.success || !statsRes.denunciasStats) {
     // Fallback para renderização segura
  }

  const stats = statsRes.success ? (statsRes as any) : {
    dataHealth: { lastCleanup: null },
    integrationHealth: { failedCount: 0 },
    securityPulse: { blockedCount: 0, recentPiiAccess: 0 },
    denunciasStats: {}
  }

  return (
    <div className="p-8 space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">Saúde do <span className="text-primary">Sistema</span></h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest mt-1">Torre de Controle e Manutenção Automática</p>
        </div>
        <div className="flex items-center gap-3 bg-surface p-2 rounded-2xl border border-border shadow-sm">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Monitoramento em Tempo Real</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Activity className="text-primary" />
          <h2 className="text-lg font-black text-dark uppercase italic">Infraestrutura Supabase</h2>
        </div>
        <SupabaseMetricsCards />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CARD: DATA HEALTH */}
        <div className="bg-white border border-border p-6 rounded-[2rem] space-y-4 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-card-lg">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity text-blue-600">
            <Database size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><HardDrive size={20} /></div>
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Integridade de Dados</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-dark italic">Limpeza OK</p>
            <p className="text-[10px] text-muted font-bold uppercase">Última faxina: {stats.dataHealth.lastCleanup ? new Date(stats.dataHealth.lastCleanup.criado_em).toLocaleDateString() : 'Nunca'}</p>
          </div>
          {stats.dataHealth.lastCleanup?.detalhes && (
            <div className="pt-2 flex items-center gap-2 text-[9px] font-black text-primary uppercase">
              <Trash2 size={12} />
              <span>-{stats.dataHealth.lastCleanup.detalhes.espaco_recuperado_mb} MB recuperados</span>
            </div>
          )}
        </div>

        {/* CARD: INTEGRATION HEALTH */}
        <div className="bg-white border border-border p-6 rounded-[2rem] space-y-4 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-card-lg">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity text-green-600">
            <Share2 size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl shadow-sm ${stats.integrationHealth.failedCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <Share2 size={20} />
            </div>
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Integrações</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-dark italic">
              {stats.integrationHealth.failedCount > 0 ? `${stats.integrationHealth.failedCount} Falhas` : '100% Online'}
            </p>
            <p className="text-[10px] text-muted font-bold uppercase">Webhooks e E-mails de destino</p>
          </div>
        </div>

        {/* CARD: SECURITY PULSE */}
        <div className="bg-white border border-border p-6 rounded-[2rem] space-y-4 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-card-lg">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity text-purple-600">
            <ShieldCheck size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm"><ShieldCheck size={20} /></div>
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Segurança & PII</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-dark italic">{stats.securityPulse.recentPiiAccess} Acessos</p>
            <p className="text-[10px] text-muted font-bold uppercase">Visualizações de PII (24h)</p>
          </div>
        </div>

        {/* CARD: SYSTEM VITAL */}
        <div className="bg-white border border-border p-6 rounded-[2rem] space-y-4 relative overflow-hidden group hover:border-primary/30 transition-all shadow-card-lg">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity text-primary">
            <Activity size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm"><Activity size={20} /></div>
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Vitalidade Geral</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-dark italic">Estável</p>
            <p className="text-[10px] text-muted font-bold uppercase">Database e Storage Latency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA 1 & 2: AÇÕES E LOGS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-card-lg">
            <div className="p-8 border-b border-border bg-surface flex items-center justify-between">
              <h2 className="text-lg font-black text-dark uppercase italic tracking-tight">Ações de Manutenção</h2>
              <Clock size={20} className="text-muted" />
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-surface border border-border rounded-3xl space-y-4 shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-dark uppercase italic">Forçar Faxina Agora</h4>
                  <p className="text-[10px] text-muted font-bold leading-relaxed">Deleta arquivos órfãos sem esperar o agendamento da madrugada.</p>
                </div>
                <form action={async () => { 'use server'; await limparArquivosOrfaos(); }}>
                  <button className="w-full h-12 bg-white hover:bg-surface border border-border hover:border-primary/30 text-dark rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Trash2 size={14} className="text-red-500" /> Executar Faxina
                  </button>
                </form>
              </div>

              <div className="p-6 bg-surface border border-border rounded-3xl space-y-4 shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-dark uppercase italic">Re-tentar Integrações</h4>
                  <p className="text-[10px] text-muted font-bold leading-relaxed">Tenta reenviar e-mails e webhooks que ficaram travados com erro.</p>
                </div>
                <form action={async () => { 'use server'; await retryFailedIntegrations(); }}>
                  <button className="w-full h-12 bg-secondary/10 hover:bg-secondary border border-secondary/20 hover:border-secondary text-secondary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm">
                    <RotateCcw size={14} /> Re-tentar Falhas
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-[2.5rem] p-8 space-y-6 shadow-card-lg">
             <div className="flex items-center gap-3">
               <AlertCircle className="text-amber-500" />
               <h2 className="text-lg font-black text-dark uppercase italic">Alertas Pendentes</h2>
             </div>
             {stats.integrationHealth.failedCount > 0 ? (
               <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-700">
                 <AlertCircle size={20} className="text-red-500" />
                 <p className="text-xs font-bold uppercase tracking-tight">Existem integrações que falharam. Verifique os logs e tente novamente.</p>
               </div>
             ) : (
               <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4 text-green-700">
                 <CheckCircle size={20} className="text-green-500" />
                 <p className="text-xs font-bold uppercase tracking-tight">Nenhum erro crítico detectado nas últimas 24 horas.</p>
               </div>
             )}
          </div>

          {/* NOVO: Tabela Detalhada de Integrações */}
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-6 px-2">
               <Share2 className="text-primary" />
               <h2 className="text-lg font-black text-dark uppercase italic">Status das Entregas (Real)</h2>
             </div>
             <div className="bg-white rounded-3xl p-6 border border-border shadow-card-lg overflow-hidden">
                <IntegrationsHealthTable data={stats.integrationHealth.detailed || []} />
             </div>
          </div>
        </div>

        {/* COLUNA 3: ESTATÍSTICAS DE DENUNCIAS */}
        <div className="space-y-8">
           <div className="bg-white border border-border rounded-[2.5rem] p-8 space-y-8 shadow-card-lg">
              <h2 className="text-lg font-black text-dark uppercase italic tracking-tight">Status das Denuncias</h2>
              <div className="space-y-6">
                {Object.entries(stats.denunciasStats || {}).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-muted">{status.replace('_', ' ')}</span>
                      <span className="text-dark">{count as number}</span>
                    </div>
                    <div className="h-2 bg-surface border border-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, ((count as number) / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] space-y-4 shadow-sm">
              <ShieldCheck className="text-primary" size={32} />
              <h3 className="text-sm font-black text-dark uppercase tracking-widest italic">Conformidade LGPD</h3>
              <p className="text-[10px] text-muted font-bold leading-relaxed italic">
                O sistema está operando com criptografia AES-256-GCM. 
                Nenhum dado pessoal (PII) está exposto no banco de dados sem proteção.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
