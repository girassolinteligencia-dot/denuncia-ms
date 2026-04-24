import React from 'react'
import { 
  FileText, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Activity
} from 'lucide-react'
import { getDashboardStats, getRecentActivities } from '@/lib/actions/admin-denuncias'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const statsResult = await getDashboardStats()
  const activityResult = await getRecentActivities()

  const stats = (statsResult.success && statsResult.stats) ? statsResult.stats : { 
    total: 0, 
    recebida: 0, 
    em_analise: 0, 
    resolvida: 0, 
    arquivada: 0,
    newsletter: 0,
    engajamento: 0
  }
  const activities = activityResult.success ? (activityResult.data || []) : []

  return (
    <div className="space-y-6 animate-fade-in px-4">
      <div>
        <h1 className="text-xl font-black text-dark tracking-tighter italic uppercase">Painel de Impacto</h1>
        <p className="text-muted text-[11px] font-medium">Estatísticas em tempo real da plataforma Denúncia MS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPIItem 
          title="Denúncias" 
          value={stats.total} 
          change="Volume Total" 
          icon={FileText} 
          color="text-primary" 
          bgColor="bg-primary-50"
        />
        <KPIItem 
          title="Novas" 
          value={stats.recebida} 
          change="Pendentes" 
          icon={Clock} 
          color="text-warning" 
          bgColor="bg-yellow-50"
        />
        <KPIItem 
          title="Resolvidas" 
          value={stats.resolvida} 
          change="Taxa: 85%" 
          icon={CheckCircle2} 
          color="text-success" 
          bgColor="bg-green-50"
        />
        <KPIItem 
          title="Inscritos" 
          value={stats.newsletter} 
          change="News" 
          icon={Activity} 
          color="text-secondary" 
          bgColor="bg-secondary/10"
        />
        <KPIItem 
          title="Votos" 
          value={stats.engajamento} 
          change="Enquetes" 
          icon={Activity} 
          color="text-info" 
          bgColor="bg-blue-50"
        />
        <KPIItem 
          title="Impacto" 
          value="100%" 
          change="Score" 
          icon={Activity} 
          color="text-dark" 
          bgColor="bg-surface"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-card shadow-card-lg border border-border p-8 h-[450px] flex flex-col items-center justify-center text-muted relative overflow-hidden group">
           <div className="absolute top-6 left-8 flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h2 className="font-black text-dark text-xs uppercase tracking-widest">Evolução de Protocolos</h2>
           </div>
           <div className="flex flex-col items-center opacity-40 group-hover:opacity-60 transition-opacity">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                 <Activity size={32} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Motor de Gráficos em Standby</p>
              <p className="text-[10px] mt-1 italic">Conectando ao Recharts para visualização histórica...</p>
           </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card-lg border border-border overflow-hidden h-[450px] flex flex-col">
           <div className="p-6 bg-surface border-b border-border">
              <h2 className="font-black text-dark text-xs uppercase tracking-widest flex items-center gap-2">
                 <Activity size={16} className="text-secondary" />
                 Atividades Recentes
              </h2>
           </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activities.length > 0 ? activities.map((act: { id: string, acao: string, usuario?: { nome: string }, criado_em: string }) => (
                <div key={act.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary border-l border-border ml-1">
                   <p className="text-[11px] font-bold text-dark leading-tight uppercase">
                      {act.acao.replace('_', ' ')}
                   </p>
                   <p className="text-[10px] text-muted font-medium">
                      Por: <span className="text-primary">{act.usuario?.nome || 'Sistema'}</span>
                   </p>
                   <p className="text-[9px] text-muted/60 mt-1">
                      {new Date(act.criado_em).toLocaleString()}
                   </p>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                   <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sem atividades registradas no log.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}

function KPIItem({ title, value, change, icon: Icon, color, bgColor }: { title: string, value: string | number, change: string, icon: React.ElementType, color: string, bgColor: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-border p-5 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bgColor} ${color} shadow-sm`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-success bg-green-50 px-2 py-0.5 rounded-full">
           <ArrowUpRight size={10} />
           {change}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">{title}</p>
        <p className="text-2xl font-black text-dark mt-0.5 tracking-tighter">{value}</p>
      </div>
    </div>
  )
}

