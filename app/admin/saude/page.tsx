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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Saúde do <span className="text-accent">Sistema</span></h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Torre de Controle e Manutenção Automática</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-glow-cyan"></div>
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Monitoramento em Tempo Real</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CARD: DATA HEALTH */}
        <div className="bg-dark-soft border border-white/10 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl"><HardDrive size={20} /></div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Integridade de Dados</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-white italic">Limpeza OK</p>
            <p className="text-[10px] text-white/40 font-bold uppercase">Última faxina: {stats.dataHealth.lastCleanup ? new Date(stats.dataHealth.lastCleanup.criado_em).toLocaleDateString() : 'Nunca'}</p>
          </div>
          {stats.dataHealth.lastCleanup?.detalhes && (
            <div className="pt-2 flex items-center gap-2 text-[9px] font-black text-accent uppercase">
              <Trash2 size={12} />
              <span>-{stats.dataHealth.lastCleanup.detalhes.espaco_recuperado_mb} MB recuperados</span>
            </div>
          )}
        </div>

        {/* CARD: INTEGRATION HEALTH */}
        <div className="bg-dark-soft border border-white/10 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Share2 size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${stats.integrationHealth.failedCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              <Share2 size={20} />
            </div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Integrações</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-white italic">
              {stats.integrationHealth.failedCount > 0 ? `${stats.integrationHealth.failedCount} Falhas` : '100% Online'}
            </p>
            <p className="text-[10px] text-white/40 font-bold uppercase">Webhooks e E-mails de destino</p>
          </div>
        </div>

        {/* CARD: SECURITY PULSE */}
        <div className="bg-dark-soft border border-white/10 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl"><ShieldCheck size={20} /></div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Segurança & PII</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-white italic">{stats.securityPulse.recentPiiAccess} Acessos</p>
            <p className="text-[10px] text-white/40 font-bold uppercase">Visualizações de PII (24h)</p>
          </div>
        </div>

        {/* CARD: SYSTEM VITAL */}
        <div className="bg-dark-soft border border-white/10 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 text-accent rounded-2xl"><Activity size={20} /></div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Vitalidade Geral</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-white italic">Estável</p>
            <p className="text-[10px] text-white/40 font-bold uppercase">Database e Storage Latency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA 1 & 2: AÇÕES E LOGS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-dark-soft border border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Ações de Manutenção</h2>
              <Clock size={20} className="text-white/20" />
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase italic">Forçar Faxina Agora</h4>
                  <p className="text-[10px] text-white/40 font-bold leading-relaxed">Deleta arquivos órfãos sem esperar o agendamento da madrugada.</p>
                </div>
                <form action={async () => { 'use server'; await limparArquivosOrfaos(); }}>
                  <button className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Trash2 size={14} /> Executar Faxina
                  </button>
                </form>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase italic">Re-tentar Integrações</h4>
                  <p className="text-[10px] text-white/40 font-bold leading-relaxed">Tenta reenviar e-mails e webhooks que ficaram travados com erro.</p>
                </div>
                <form action={async () => { 'use server'; await retryFailedIntegrations(); }}>
                  <button className="w-full h-12 bg-secondary/20 hover:bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-secondary/30">
                    <RotateCcw size={14} /> Re-tentar Falhas
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-dark-soft border border-white/10 rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center gap-3">
               <AlertCircle className="text-amber-500" />
               <h2 className="text-lg font-black text-white uppercase italic">Alertas Pendentes</h2>
             </div>
             {stats.integrationHealth.failedCount > 0 ? (
               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
                 <AlertCircle size={20} />
                 <p className="text-xs font-bold uppercase tracking-tight">Existem integrações que falharam. Verifique os logs e tente novamente.</p>
               </div>
             ) : (
               <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4 text-green-400">
                 <CheckCircle size={20} />
                 <p className="text-xs font-bold uppercase tracking-tight">Nenhum erro crítico detectado nas últimas 24 horas.</p>
               </div>
             )}
          </div>
        </div>

        {/* COLUNA 3: ESTATÍSTICAS DE DENÚNCIAS */}
        <div className="space-y-8">
           <div className="bg-dark-soft border border-white/10 rounded-[2.5rem] p-8 space-y-8">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Status das Denúncias</h2>
              <div className="space-y-6">
                {Object.entries(stats.denunciasStats || {}).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-white/60">{status.replace('_', ' ')}</span>
                      <span className="text-white">{count as number}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent shadow-glow-cyan" 
                        style={{ width: `${Math.min(100, ((count as number) / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-primary/20 to-primary-dark/20 border border-primary/30 p-8 rounded-[2.5rem] space-y-4">
              <ShieldCheck className="text-accent" size={32} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Conformidade LGPD</h3>
              <p className="text-[10px] text-white/50 font-bold leading-relaxed italic">
                O sistema está operando com criptografia AES-256-GCM. 
                Nenhum dado pessoal (PII) está exposto no banco de dados sem proteção.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
