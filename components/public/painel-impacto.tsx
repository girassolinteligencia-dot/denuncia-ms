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
  const [stats, setStats] = useState<{ hoje: number; feedback: string; topCidades?: { nome: string, count: number }[]; crescimento: string } | null>(null)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className={`p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-dark'} text-white rounded-3xl relative overflow-hidden group shadow-glow-cyan min-h-[180px] flex flex-col justify-center`}>
           <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
              <TrendingUp size={80} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Denuncias Hoje</p>
           {loading ? <Loader2 className="animate-spin text-primary" /> : (
             <div className="text-5xl font-black italic animate-fade-in">{stats?.hoje}</div>
           )}
           <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">{stats?.crescimento || '--'} em relação a ontem</p>
        </div>

        <div className={`p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-dark'} text-white rounded-3xl relative overflow-hidden group shadow-glow-cyan min-h-[180px] flex flex-col justify-center`}>
           <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
              <ShieldAlert size={80} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-electric mb-4">Foco Geográfico (Top 3)</p>
           {loading ? <Loader2 className="animate-spin text-electric" /> : (
             <div className="flex flex-col gap-2 animate-fade-in relative z-10">
               {stats?.topCidades?.map((cidade, i) => (
                 <div key={i} className="flex justify-between items-center text-xs md:text-sm font-bold border-b border-white/10 pb-2 last:border-0 last:pb-0">
                    <span className="uppercase truncate pr-2">
                       <span className="text-electric mr-2">{i+1}º</span>{cidade.nome}
                    </span>
                    <span className="text-white/50">{cidade.count} <span className="text-[8px]">den.</span></span>
                 </div>
               ))}
             </div>
           )}
           <p className="text-[9px] text-white/40 mt-6 leading-relaxed uppercase font-bold relative z-10">Monitorando 79 municípios</p>
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
