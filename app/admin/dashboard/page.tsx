import React from 'react'
import { Card } from '@/components/ui/card' // I'll create this primitive soon
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-muted text-sm">Visão geral do sistema e estatísticas de denúncias.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem 
          title="Total de Denúncias" 
          value="124" 
          change="+12% este mês" 
          icon={FileText} 
          color="text-primary" 
          bgColor="bg-primary-50"
        />
        <KPIItem 
          title="Pendentes" 
          value="45" 
          change="+5 hoje" 
          icon={Clock} 
          color="text-warning" 
          bgColor="bg-yellow-50"
        />
        <KPIItem 
          title="Em Análise" 
          value="32" 
          change="-2 desde ontem" 
          icon={AlertTriangle} 
          color="text-info" 
          bgColor="bg-blue-50"
        />
        <KPIItem 
          title="Resolvidas" 
          value="47" 
          change="+18 este mês" 
          icon={CheckCircle2} 
          color="text-success" 
          bgColor="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-border p-6 h-96 flex flex-col items-center justify-center text-muted">
           <p className="text-sm">Gráfico de evolução (Recharts será implementado aqui)</p>
        </div>
        <div className="bg-white rounded-card shadow-card border border-border p-6 h-96">
           <h2 className="font-bold text-dark mb-4">Últimas Atividades</h2>
           <div className="text-sm text-muted">Lista de logs recentes será implementada aqui.</div>
        </div>
      </div>
    </div>
  )
}

function KPIItem({ title, value, change, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white rounded-card shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-medium text-success">{change}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-dark mt-1">{value}</p>
      </div>
    </div>
  )
}
