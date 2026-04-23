'use client'

import React, { useEffect, useState } from 'react'
import { 
  Megaphone, 
  ArrowRight, 
  BarChart3,
  Calendar,
  Zap,
  Loader2,
  CloudOff
} from 'lucide-react'
import { buscarNoticiasPublicas } from '@/lib/actions/intelligence'

export function BoletimIntelligence() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadNews = async () => {
      const res = await buscarNoticiasPublicas()
      if (res.success) {
        setNoticias(res.data || [])
      }
      setLoading(false)
    }
    loadNews()
  }, [])

  const handleSubscribe = async () => {
    if (!email) return
    setSubmitting(true)
    try {
      const { assinarNewsletter } = await import('@/lib/actions/newsletter')
      await assinarNewsletter(email)
      setEmail('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted font-black text-[10px] uppercase tracking-widest">Sincronizando Inteligência...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-fade-in">
      
      {/* Feed Principal */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between mb-2 px-2 sm:px-0">
           <h3 className="text-lg sm:text-xl font-black text-dark tracking-tight italic uppercase shrink-0 px-4 border-l-4 border-primary">Live Intelligence Feed</h3>
           <div className="h-[1px] bg-border w-full ml-4 hidden sm:block"></div>
        </div>

        {noticias.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-border/40 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
            <CloudOff size={48} className="text-muted/20" />
            <p className="text-muted font-bold text-sm italic">Nenhum boletim oficial emitido nas últimas 24h.</p>
          </div>
        ) : (
          noticias.map((noticia) => (
            <article key={noticia.id} className="group mx-2 sm:mx-0">
              <div className="bg-white rounded-3xl overflow-hidden border border-border/60 transition-all hover:border-primary/40 hover:shadow-card-lg relative">
                <div className="grid grid-cols-1 md:grid-cols-12">
                   <div className="md:col-span-3 bg-surface flex items-center justify-center p-6 relative overflow-hidden hidden md:flex">
                      <div className="absolute -bottom-4 -left-4 text-primary/5 font-black text-7xl italic select-none uppercase">MS</div>
                      <Megaphone size={28} className="text-primary/20 group-hover:text-primary transition-colors duration-500" />
                      <div className="absolute top-4 left-4">
                         <span className="px-2 py-0.5 bg-dark text-white text-[7px] font-black rounded uppercase tracking-widest">
                            {noticia.gerado_por_ia ? 'BOLETIM IA' : 'OFICIAL'}
                         </span>
                      </div>
                   </div>
                   <div className="md:col-span-9 p-6 sm:p-8 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3 text-[8px] sm:text-[9px] font-black text-muted uppercase tracking-widest">
                         <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(noticia.publicado_em || noticia.criado_em).toLocaleDateString()}</span>
                         <span className="text-primary">{noticia.categoria}</span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black text-dark group-hover:text-primary transition-colors leading-tight italic">
                         {noticia.titulo}
                      </h2>
                      <p className="text-muted text-xs sm:text-sm leading-relaxed line-clamp-2 font-medium">
                         {noticia.conteudo}
                      </p>
                      <div className="pt-3 sm:pt-4 flex items-center justify-between border-t border-border/40">
                         <div className="flex items-center gap-2">
                            <Zap size={14} className="text-secondary fill-secondary" />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-dark">Alta Relevância</span>
                         </div>
                         <button className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase text-primary tracking-widest group-hover:translate-x-1 transition-transform">
                            Ver detalhes <ArrowRight size={14} />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Sidebar de Inteligência */}
      <aside className="lg:col-span-4 space-y-6 sm:space-y-8 px-2 sm:px-0">
         <div className="bg-dark text-white rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
               <BarChart3 size={20} className="text-primary" />
               <h3 className="font-black text-xs uppercase tracking-widest italic">Tendências do Dia</h3>
            </div>

            <div className="space-y-5 sm:space-y-6">
               {[
                 { label: 'Saúde Pública', value: '82%', color: 'bg-primary' },
                 { label: 'Obras & Vias', value: '64%', color: 'bg-secondary' },
                 { label: 'Segurança', value: '31%', color: 'bg-electric' }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-white/60 tracking-widest">
                       <span>{item.label}</span>
                       <span>{item.value}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: item.value }}></div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-2">
               <p className="text-[8px] text-white/30 font-bold leading-relaxed uppercase tracking-tighter">
                  Dados gerados via anonimização de interações cidadãs (72h).
               </p>
            </div>
         </div>

         {/* Newsletter */}
         <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mx-auto text-primary">
               <Zap size={20} />
            </div>
            <div>
               <h4 className="font-black text-dark uppercase text-[11px] tracking-widest">Boletim Diário</h4>
               <p className="text-[9px] text-muted font-bold mt-1 leading-relaxed uppercase">Receba o impacto no seu e-mail.</p>
            </div>
            <div className="space-y-2">
               <div className="flex gap-2">
                  <input 
                    className="input h-10 text-[10px] px-4 font-bold tracking-tight" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                  <button 
                    className={`btn-primary w-10 h-10 p-0 shrink-0 shadow-none ${submitting ? 'opacity-50' : ''}`}
                    onClick={handleSubscribe}
                    disabled={submitting || !email}
                  >
                     <ArrowRight size={16} />
                  </button>
               </div>
            </div>
         </div>
      </aside>
    </div>
  )
}
