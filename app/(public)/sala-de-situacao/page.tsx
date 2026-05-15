'use server'

import React from 'react'
import { ShieldCheck, BarChart3, Globe, Zap, Shield, Flame, Activity } from 'lucide-react'
import { getSystemConfig } from '@/lib/actions/admin-config'
import { getMunicipalityMapData, getImpactoStats } from '@/lib/actions/impacto'
import { getPublicIntelligenceData } from '@/lib/actions/public-intelligence'
import { MSMunicipalityMap } from '@/components/public/transparencia-mapa'
import Link from 'next/link'

export default async function SalaDeSituacaoPage({
  searchParams
}: {
  searchParams?: { periodo?: string }
}) {
  const isEnabled = await getSystemConfig('sala_situacao_ativa')
  
  if (!isEnabled.valor) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-secondary mb-8 animate-pulse">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">Acesso Restrito</h1>
        <p className="text-white/50 max-w-md font-medium leading-relaxed">
          A Sala de Gestão técnica está temporariamente em manutenção ou o acesso público foi desabilitado.
        </p>
        <Link href="/" className="mt-12 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">
          Voltar para Início
        </Link>
      </div>
    )
  }

  const periodoParam = searchParams?.periodo || 'todas'

  const [mapDataResult, impactStats, intelResult] = await Promise.all([
    getMunicipalityMapData(periodoParam),
    getImpactoStats(),
    getPublicIntelligenceData()
  ])

  const mapData = mapDataResult.success ? mapDataResult.data || [] : []
  const impactData = (impactStats.success ? impactStats.stats : { hoje: 0, ontem: 0, mes: 0 }) as any
  const intel = intelResult.success ? intelResult.data : { liveFeed: [], topTrends: [], topOrgans: [], privacyShield: 0 }

  return (
    <div className="h-screen bg-[#050505] text-white selection:bg-primary/30 flex flex-col overflow-hidden">
      {/* HEADER TÉCNICO COMPACTO */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                <Zap size={16} className="fill-primary" />
             </div>
             <div>
                <h1 className="text-base font-black tracking-tighter uppercase italic leading-none">Sala de <span className="text-primary italic">Gestão</span></h1>
                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40 mt-1">CCOM - Mato Grosso do Sul</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black uppercase text-white/30 tracking-widest">Live Sync</span>
                <span className="text-[9px] font-bold text-green-500 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   CONECTADO
                </span>
             </div>
             <div className="h-6 w-px bg-white/10"></div>
             <ShieldCheck size={18} className="text-secondary opacity-80" />
          </div>
        </div>
      </header>

      {/* GRID WIDESCREEN (TV MODE) */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0">
        
        {/* COLUNA ESQUERDA: PRIVACIDADE E RANKINGS (25%) */}
        <section className="col-span-3 flex flex-col gap-4 min-h-0">
           {/* Privacy Shield */}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500">
                <Shield size={64} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                 <Shield className="text-green-500" size={16} />
                 <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Medidor de Privacidade</h2>
              </div>
              <p className="text-4xl font-black italic tracking-tighter text-white">{intel?.privacyShield.toLocaleString('pt-BR')}</p>
              <p className="text-[8px] font-bold text-white/30 uppercase mt-1">Dados pessoais protegidos e anonimizados</p>
           </div>

           {/* Radar de Órgãos Acionados */}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                 <div className="flex items-center gap-2">
                    <Activity className="text-blue-400" size={16} />
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Radar de Assuntos (Setores)</h2>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                 {(intel?.topOrgans || []).map((orgao, i) => (
                   <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-bold text-white/80">
                         <span className="truncate pr-2">{orgao.name}</span>
                         <span className="text-blue-400">{orgao.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (orgao.count / (intel?.topOrgans[0]?.count || 1)) * 100)}%` }}></div>
                      </div>
                   </div>
                 ))}
                 {(!intel?.topOrgans || intel.topOrgans.length === 0) && (
                   <div className="text-xs text-white/30 italic text-center py-4">Processando demandas...</div>
                 )}
              </div>
           </div>

           {/* Top Trends (Assuntos) */}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                 <div className="flex items-center gap-2">
                    <Flame className="text-orange-500" size={16} />
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Assuntos em Alta</h2>
                 </div>
              </div>
              <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar">
                 {(intel?.topTrends || []).map((trend, i) => (
                   <div key={i} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[10px] font-bold text-orange-400 flex items-center gap-2">
                      {trend.name} <span className="opacity-50 text-[9px]">{trend.count}</span>
                   </div>
                 ))}
                 {(!intel?.topTrends || intel.topTrends.length === 0) && (
                   <div className="text-xs text-white/30 italic text-center py-4 w-full">Coletando amostras...</div>
                 )}
              </div>
           </div>
        </section>

        {/* COLUNA CENTRAL: MAPA (50%) */}
        <section className="col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden min-h-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] inset-0">
           <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
           <div className="flex items-center justify-between mb-4 z-10 flex-shrink-0">
              <div className="flex items-center gap-2">
                 <Globe className="text-secondary" size={18} />
                 <h2 className="text-xs font-black text-white uppercase tracking-widest italic">Inteligência Territorial MS</h2>
              </div>
              
              {/* FILTRO DE PERÍODO (Links para o próprio Server Component) */}
              <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-1">
                 <Link href="?periodo=hoje" className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-colors ${periodoParam === 'hoje' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>Hoje</Link>
                 <Link href="?periodo=semana" className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-colors ${periodoParam === 'semana' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>Últ. Semana</Link>
                 <Link href="?periodo=mes" className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-colors ${periodoParam === 'mes' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>Últ. Mês</Link>
                 <Link href="?periodo=todas" className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-colors ${periodoParam === 'todas' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>Todas</Link>
              </div>
           </div>
           
           <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative z-10 min-h-[300px]">
              <MSMunicipalityMap data={mapData} />
           </div>
        </section>

        {/* COLUNA DIREITA: ESTATÍSTICAS E FEED AO VIVO (25%) */}
        <section className="col-span-3 flex flex-col gap-4 min-h-0">
           
           {/* Global Impact Stats */}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                 <BarChart3 className="text-accent" size={16} />
                 <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Volume de Impacto</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1">Hoje</p>
                    <p className="text-2xl font-black italic text-white">{impactData?.hoje || 0}</p>
                 </div>
                 <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1">Ontem</p>
                    <p className="text-2xl font-black italic text-white/70">{(impactData as any)?.ontem || 0}</p>
                 </div>
                 <div className="bg-primary/20 rounded-xl p-3 border border-primary/30 text-center col-span-2">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">Acumulado do Mês</p>
                    <p className="text-3xl font-black italic text-white">{(impactData as any)?.mes || 0}</p>
                 </div>
              </div>
           </div>

           {/* Live Feed Ticker */}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                 <div className="flex items-center gap-2">
                    <Activity className="text-green-500" size={16} />
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Feed Operacional</h2>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 <div className="space-y-4">
                    {(intel?.liveFeed || []).map((feed, i) => (
                      <div key={feed.id || i} className="flex items-start gap-3 relative before:absolute before:left-[5px] before:top-4 before:bottom-[-20px] before:w-px before:bg-white/10 last:before:hidden">
                         <div className="w-3 h-3 rounded-full bg-white/10 border border-white/30 mt-0.5 shrink-0 z-10 flex items-center justify-center">
                           <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white/80 leading-tight">{feed.texto}</p>
                            <p className="text-[9px] font-black text-white/30 uppercase mt-1 tracking-widest">{feed.tempo}</p>
                         </div>
                      </div>
                    ))}
                    {(!intel?.liveFeed || intel.liveFeed.length === 0) && (
                      <div className="text-xs text-white/30 italic text-center py-8">Aguardando dados da rede...</div>
                    )}
                 </div>
              </div>
           </div>

        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  )
}
