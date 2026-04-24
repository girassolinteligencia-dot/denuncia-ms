'use client'
import React, { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { getImpactoStats } from '@/lib/actions/impacto'

export function PainelImpacto({ isDark = false }: { isDark?: boolean }) {
  const [stats, setStats] = useState<{ hoje: number; feedback: string; cidade: string; crescimento: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getImpactoStats()
      if (res.success && res.stats) {
        setStats(res.stats)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const Content = (
    <div className={`space-y-12 ${isDark ? '' : 'container-page'}`}>
      
      {/* Header do Painel */}
      <header className="space-y-4 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 ${isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/10 border-secondary/20 text-secondary'} border rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4`}>
          <Zap size={14} className={isDark ? 'fill-primary' : 'fill-secondary'} />
          Métricas de Impacto Real
        </div>
        <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-dark'} tracking-tighter italic uppercase`}>
          PAINEL DE <span className="text-secondary italic">EFICÁCIA</span>
        </h2>
        <p className={`${isDark ? 'text-white/40' : 'text-muted'} text-sm md:text-md max-w-2xl mx-auto font-medium leading-relaxed`}>
          Dados vivos extraídos diretamente da nossa base de dados sobre a atuação cidadã em Mato Grosso do Sul.
        </p>
      </header>

      {/* Stats Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className={`p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-dark'} text-white rounded-3xl relative overflow-hidden group shadow-glow-cyan min-h-[180px] flex flex-col justify-center`}>
           <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
              <TrendingUp size={80} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Denúncias Hoje</p>
           {loading ? <Loader2 className="animate-spin text-primary" /> : (
             <div className="text-5xl font-black italic animate-fade-in">{stats?.hoje}</div>
           )}
           <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">{stats?.crescimento || '--'} em relação a ontem</p>
        </div>

        <div className={`p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-dark'} text-white rounded-3xl relative overflow-hidden group shadow-glow-green min-h-[180px] flex flex-col justify-center`}>
           <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
              <CheckCircle2 size={80} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Feedback Positivo</p>
           {loading ? <Loader2 className="animate-spin text-secondary" /> : (
             <div className="text-5xl font-black text-secondary italic animate-fade-in">{stats?.feedback}</div>
           )}
           <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">Da comunidade sul-mato-grossense</p>
        </div>

        <div className={`p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-dark'} text-white rounded-3xl relative overflow-hidden group shadow-glow-cyan min-h-[180px] flex flex-col justify-center`}>
           <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
              <ShieldAlert size={80} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-electric mb-2">Foco Geográfico</p>
           {loading ? <Loader2 className="animate-spin text-electric" /> : (
             <div className="text-2xl font-black uppercase tracking-tight italic animate-fade-in truncate">{stats?.cidade}</div>
           )}
           <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">Concentração atual de demandas</p>
        </div>
      </div>
    </div>
  )

  if (isDark) return Content

  return (
    <section className="section bg-surface border-t border-border">
      {Content}
    </section>
  )
}
