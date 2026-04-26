'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  FileText, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Activity,
  Globe,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react'
import { 
  getDashboardStats, 
  getRecentActivities,
  getProtocolEvolutionData,
  getGeographicIntelligence
} from '@/lib/actions/admin-denuncias'
import { ProtocolEvolutionChart } from '@/components/admin/protocol-evolution-chart'
import { AdminGeoIntelligence } from '@/components/admin/geo-intelligence'
import { SystemSettings } from '@/components/admin/system-settings'

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as 'analytics' | 'geo' | 'system') || 'analytics'
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'geo' | 'system'>(initialTab)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Sincroniza tab com URL se mudar
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (tab === 'analytics' || tab === 'geo' || tab === 'system')) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  useEffect(() => {
    async function loadData() {
      const [stats, activities, evolution, geo] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getProtocolEvolutionData(),
        getGeographicIntelligence()
      ])
      
      setData({
        stats: stats.success ? stats.stats : null,
        activities: activities.success ? activities.data : [],
        chartData: evolution.success ? evolution.data : [],
        geoData: geo.success ? geo.data : []
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-spin text-primary" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted animate-pulse">Sincronizando Inteligência MS...</p>
      </div>
    </div>
  )

  const stats = data.stats || { 
    total: 0, 
    recebida: 0, 
    em_analise: 0, 
    resolvida: 0, 
    arquivada: 0,
    newsletter: 0,
    engajamento: 0
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in">
      {/* Dashboard Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">Painel de <span className="text-primary italic">Impacto</span></h1>
          <p className="text-muted text-[11px] font-black uppercase tracking-widest mt-1">Centro de Comando Denuncia MS — Monitoramento Cidadão</p>
        </div>

        <div className="flex p-1.5 bg-surface rounded-2xl border border-border self-start shadow-inner overflow-x-auto max-w-full scrollbar-hide">
          <div className="flex items-center min-w-max">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === 'analytics' ? 'bg-white text-primary shadow-md border border-border scale-105' : 'text-muted hover:text-dark'
              }`}
            >
              <LayoutDashboard size={14} className="sm:size-16" />
              Analítico
            </button>
            <button 
              onClick={() => setActiveTab('geo')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === 'geo' ? 'bg-white text-primary shadow-md border border-border scale-105' : 'text-muted hover:text-dark'
              }`}
            >
              <Globe size={14} className="sm:size-16" />
              Geográfico
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === 'system' ? 'bg-white text-primary shadow-md border border-border scale-105' : 'text-muted hover:text-dark'
              }`}
            >
              <ShieldCheck size={14} className="sm:size-16" />
              Governança
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
            <KPIItem title="Denuncias" value={stats.total} change="Volume Total" icon={FileText} color="text-primary" bgColor="bg-primary/10" />
            <KPIItem title="Novas" value={stats.recebida} change="Pendentes" icon={Clock} color="text-warning" bgColor="bg-yellow-50" />
            <KPIItem title="Resolvidas" value={stats.resolvida} change="Taxa: 85%" icon={CheckCircle2} color="text-success" bgColor="bg-green-50" />
            <KPIItem title="Inscritos" value={stats.newsletter} change="News" icon={Activity} color="text-secondary" bgColor="bg-secondary/10" />
            <KPIItem title="Votos" value={stats.engajamento} change="Enquetes" icon={Activity} color="text-info" bgColor="bg-blue-50" />
            <KPIItem title="Impacto" value="100%" change="Score" icon={Activity} color="text-dark" bgColor="bg-surface" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Evolução */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-card-lg border border-border p-8 h-[450px] flex flex-col relative overflow-hidden group">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                     <Activity size={18} className="text-primary" />
                     <h2 className="font-black text-dark text-xs uppercase tracking-widest">Evolução de Protocolos</h2>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span>
                     <span className="text-[10px] font-bold text-muted uppercase tracking-tight">Últimos 30 dias</span>
                  </div>
               </div>
               
               <div className="flex-1 w-full">
                  <ProtocolEvolutionChart data={data.chartData} />
               </div>
            </div>

            {/* Atividades Recentes */}
            <div className="bg-white rounded-3xl shadow-card-lg border border-border overflow-hidden h-[450px] flex flex-col">
               <div className="p-6 bg-surface border-b border-border">
                  <h2 className="font-black text-dark text-xs uppercase tracking-widest flex items-center gap-2">
                     <Activity size={16} className="text-secondary" />
                     Log de Auditoria
                  </h2>
               </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {data.activities && data.activities.length > 0 ? data.activities.map((act: any) => (
                    <div key={act.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary border-l border-border ml-1">
                       <p className="text-[11px] font-black text-dark leading-tight uppercase tracking-tighter">
                          {act.acao.replace('_', ' ')}
                       </p>
                       <p className="text-[10px] text-muted font-bold mt-0.5">
                          Por: <span className="text-primary uppercase">{act.usuario?.nome || 'Sistema'}</span>
                       </p>
                       <p className="text-[9px] text-muted/40 mt-1 font-bold">
                          {new Date(act.criado_em).toLocaleString('pt-BR')}
                       </p>
                    </div>
                  )) : (
                    <div className="h-full flex items-center justify-center text-center p-8">
                       <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-40">Sem atividades registradas.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </>
      ) : activeTab === 'geo' ? (
        <AdminGeoIntelligence data={data.geoData} />
      ) : (
        <SystemSettings />
      )}
    </div>
  )
}

function KPIItem({ title, value, change, icon: Icon, color, bgColor }: { title: string, value: string | number, change: string, icon: React.ElementType, color: string, bgColor: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-border p-5 hover:-translate-y-0.5 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bgColor} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Activity className="animate-spin text-primary" size={40} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
