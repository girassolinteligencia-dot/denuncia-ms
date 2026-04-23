'use client'

import React from 'react'
import { 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  ShieldAlert
} from 'lucide-react'

export function PainelImpacto() {
  return (
    <section className="section bg-surface border-t border-border">
      <div className="container-page space-y-12">
        
        {/* Header do Painel */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Zap size={14} className="fill-secondary" />
            Métricas de Impacto
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tighter italic">
            PAINEL DE <span className="text-primary italic">EFICÁCIA</span>
          </h2>
          <p className="text-muted text-sm md:text-md max-w-2xl mx-auto font-medium leading-relaxed">
            Dados reais sobre a resolução de demandas e o impacto social da plataforma em Mato Grosso do Sul.
          </p>
        </header>

        {/* Stats Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-8 bg-dark text-white rounded-3xl relative overflow-hidden group shadow-glow-cyan border-none">
             <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                <TrendingUp size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Denúncias Hoje</p>
             <div className="text-5xl font-black italic">42</div>
             <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">+12% em relação a ontem</p>
          </div>

          <div className="p-8 bg-dark text-white rounded-3xl relative overflow-hidden group border-none shadow-glow-green">
             <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                <CheckCircle2 size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Resolvidas (24h)</p>
             <div className="text-5xl font-black text-secondary italic">15</div>
             <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">Feedback positivo da comunidade</p>
          </div>

          <div className="p-8 bg-dark text-white rounded-3xl relative overflow-hidden group border-none shadow-glow-cyan">
             <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                <ShieldAlert size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-electric mb-2">Foco Geográfico</p>
             <div className="text-2xl font-black uppercase tracking-tight italic">Campo Grande</div>
             <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">Concentração de demandas em Vias</p>
          </div>
        </div>

      </div>
    </section>
  )
}
