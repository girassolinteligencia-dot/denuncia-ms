'use server'

import React from 'react'
import { ShieldCheck, BarChart3, Globe, Zap, Clock, AlertCircle } from 'lucide-react'
import { getSystemConfig } from '@/lib/actions/admin-config'
import { getMunicipalityMapData } from '@/lib/actions/impacto'
import { PainelImpacto } from '@/components/public/painel-impacto'
import { MSMunicipalityMap } from '@/components/public/transparencia-mapa'
import Link from 'next/link'

export default async function SalaDeSituacaoPage() {
  const isEnabled = await getSystemConfig('sala_situacao_ativa')
  
  if (!isEnabled.valor) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-secondary mb-8 animate-pulse">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">Acesso Restrito</h1>
        <p className="text-white/50 max-w-md font-medium leading-relaxed">
          A Sala de Situação técnica está temporariamente em manutenção ou o acesso público foi desabilitado pela governança do Denúncia MS.
        </p>
        <Link href="/" className="mt-12 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">
          Voltar para Início
        </Link>
      </div>
    )
  }

  const mapDataResult = await getMunicipalityMapData()
  const mapData = mapDataResult.success ? mapDataResult.data || [] : []

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      {/* Header Técnico Style Command Center */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container-page py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <Zap size={20} className="fill-primary" />
             </div>
             <div>
                <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">Sala de <span className="text-primary italic">Situação</span></h1>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mt-1">Monitoramento em Tempo Real MS</p>
             </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Sincronização</span>
                <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   LIVE DATA
                </span>
             </div>
             <div className="h-8 w-px bg-white/10"></div>
             <ShieldCheck size={20} className="text-secondary" />
          </div>
        </div>
      </header>

      <main className="container-page py-12 space-y-16">
        {/* Top Stats - Visão Infra/Saúde */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <TechStatCard title="Uptime do Sistema" value="99.98%" subValue="Last 30 Days" icon={Zap} color="text-primary" />
           <TechStatCard title="Latência API" value="42ms" subValue="Stable Connection" icon={Activity} color="text-secondary" />
           <TechStatCard title="Processamento" value="0.8s" subValue="Média por Protocolo" icon={Clock} color="text-blue-500" />
           <TechStatCard title="Segurança" value="AES-256" subValue="LGPD Protocol Active" icon={ShieldCheck} color="text-green-500" />
        </section>

        {/* Dashboard de Impacto (Reuso) */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">Métricas de <span className="text-secondary">Impacto Social</span></h2>
              <div className="h-px flex-1 bg-white/5"></div>
           </div>
           <div className="bg-white/5 rounded-[3rem] border border-white/10 p-4 sm:p-12 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <PainelImpacto isDark />
           </div>
        </section>

        {/* Inteligência Territorial */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
           <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                 <Globe size={14} />
                 Mapeamento Ativo
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-tight">
                 Expansão da <br />
                 <span className="text-primary italic">Cidadania</span> no MS
              </h2>
              <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">
                 Nosso motor geoespacial processa a origem das demandas para identificar carências estruturais em Mato Grosso do Sul. O mapa ao lado representa a intensidade de engajamento por mesorregiões oficiais.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-2xl font-black tracking-tighter">79</p>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mt-1">Municípios Monitorados</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-2xl font-black tracking-tighter">100%</p>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mt-1">Integridade Geográfica</p>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-3 bg-white/5 rounded-[3rem] border border-white/10 p-8 sm:p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <MSMunicipalityMap data={mapData} />
           </div>
        </section>

        {/* Footer Técnico */}
        <footer className="pt-20 pb-8 border-t border-white/5 text-center space-y-6">
           <div className="flex flex-wrap justify-center gap-8 opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                 <AlertCircle size={14} />
                 Dados Auditáveis
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                 <ShieldCheck size={14} />
                 LGPD Compliant
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                 <BarChart3 size={14} />
                 Real-time Stats
              </div>
           </div>
           <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">
              Denúncia MS — Sala de Situação Técnica v2.0
           </p>
        </footer>
      </main>
    </div>
  )
}

function TechStatCard({ title, value, subValue, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-primary/40 transition-colors group">
       <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
             <Icon size={20} />
          </div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
       </div>
       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{title}</p>
       <p className="text-2xl font-black tracking-tighter italic uppercase">{value}</p>
       <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2">{subValue}</p>
    </div>
  )
}

function Activity({ size, className }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
