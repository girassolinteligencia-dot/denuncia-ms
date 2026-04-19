'use client'

import React from 'react'
import { 
  Megaphone, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BarChart3,
  Calendar,
  Zap,
  ShieldAlert
} from 'lucide-react'
import Link from 'next/link'

// Mock de dados para o "Painel de Impacto Diário"
const NOTICIAS_IMPACTO = [
  {
    id: '1',
    data: '19/04/2026',
    horario: '08:30',
    titulo: 'Saúde Pública lidera demandas cidadãs neste domingo em MS',
    slug: 'saude-publica-lidera-demandas',
    resumo: 'Nas últimas 24 horas, a Plataforma Denúncia MS registrou um volume significativo de relatos sobre o abastecimento de medicamentos. O monitoramento aponta Campo Grande como o epicentro das solicitações.',
    categoria: 'Saúde',
    tag: 'BOLETIM DIÁRIO',
    impacto: 'Alta Relevância',
    visualizacoes: 1240
  },
  {
    id: '2',
    data: '18/04/2026',
    horario: '18:15',
    titulo: 'Fiscalização de Infraestrutura Urbana avança no interior do Estado',
    slug: 'infraestrutura-urbana-avanca',
    resumo: 'Relatórios automáticos sugerem uma melhora na sinalização de obras após intervenções diretas baseadas em protocolos da comunidade. Dourados e Três Lagoas apresentam índices positivos.',
    categoria: 'Infraestrutura',
    tag: 'RESOLVIDO',
    impacto: 'Impacto Positivo',
    visualizacoes: 856
  }
]

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header do Painel */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Zap size={14} className="fill-secondary" />
            Live Intelligence Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter italic">
            PAINEL DE <span className="text-primary italic">IMPACTO</span>
          </h1>
          <p className="text-muted text-sm md:text-md max-w-2xl mx-auto font-medium leading-relaxed">
            Transparência em tempo real. Acompanhe o resumo das atividades civis e a evolução das soluções em Mato Grosso do Sul.
          </p>
        </header>

        {/* Stats Rápidas (Estilo Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-stats p-8 bg-dark text-white rounded-3xl relative overflow-hidden group shadow-glow-cyan border-none">
             <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                <TrendingUp size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Denúncias Hoje</p>
             <div className="text-5xl font-black">42</div>
             <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">+12% em relação a ontem</p>
          </div>

          <div className="card-stats p-8 bg-dark text-white rounded-3xl relative overflow-hidden group border-none shadow-glow-green">
             <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                <CheckCircle2 size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Resolvidas (24h)</p>
             <div className="text-5xl font-black text-secondary">15</div>
             <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">Feedback positivo da comunidade</p>
          </div>

          <div className="card-stats p-8 bg-dark text-white rounded-3xl relative overflow-hidden group border-none shadow-glow-cyan">
             <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-white/10 transition-colors">
                <ShieldAlert size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-electric mb-2">Foco Geográfico</p>
             <div className="text-2xl font-black uppercase tracking-tight">Campo Grande</div>
             <p className="text-[9px] text-white/40 mt-4 leading-relaxed uppercase font-bold">Concentração de demandas em Vias</p>
          </div>
        </div>

        {/* Feed de Notícias Jornalísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-xl font-black text-dark tracking-tight italic uppercase shrink-0 px-4 border-l-4 border-primary">Últimas Atualizações</h3>
               <div className="h-[1px] bg-border w-full ml-4"></div>
            </div>

            {NOTICIAS_IMPACTO.map((noticia) => (
              <article key={noticia.id} className="group cursor-pointer">
                <div className="bg-white rounded-card overflow-hidden border border-border transition-all hover:border-primary/50 hover:shadow-card-lg relative">
                  <div className="grid grid-cols-1 md:grid-cols-12">
                     <div className="md:col-span-4 bg-surface flex items-center justify-center p-8 relative overflow-hidden">
                        <div className="absolute -bottom-4 -left-4 text-primary/5 font-black text-8xl italic select-none">MS</div>
                        <Megaphone size={40} className="text-primary/20 group-hover:text-primary transition-colors duration-500" />
                        <div className="absolute top-4 left-4">
                           <span className="px-2 py-1 bg-dark text-white text-[8px] font-black rounded uppercase tracking-widest">
                              {noticia.tag}
                           </span>
                        </div>
                     </div>
                     <div className="md:col-span-8 p-6 md:p-8 space-y-4">
                        <div className="flex items-center gap-4 text-[9px] font-black text-muted uppercase tracking-widest">
                           <span className="flex items-center gap-1"><Calendar size={12} /> {noticia.data}</span>
                           <span className="flex items-center gap-1"><Clock size={12} /> {noticia.horario}</span>
                           <span className="text-primary">{noticia.categoria}</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-dark group-hover:text-primary transition-colors leading-tight">
                           {noticia.titulo}
                        </h2>
                        <p className="text-muted text-sm leading-relaxed line-clamp-3 font-medium">
                           {noticia.resumo}
                        </p>
                        <div className="pt-4 flex items-center justify-between border-t border-border/50">
                           <div className="flex items-center gap-2">
                              <Zap size={14} className="text-secondary fill-secondary" />
                              <span className="text-[10px] font-black uppercase tracking-tighter text-dark">{noticia.impacto}</span>
                           </div>
                           <button className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest group-hover:translate-x-1 transition-transform">
                              Ler Análise Completa <ArrowRight size={14} />
                           </button>
                        </div>
                     </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar de Intelligence */}
          <aside className="lg:col-span-4 space-y-8">
             <div className="bg-dark text-white rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                   <BarChart3 size={24} className="text-primary" />
                   <h3 className="font-black text-sm uppercase tracking-widest italic">Tendências do Dia</h3>
                </div>

                <div className="space-y-6">
                   {[
                     { label: 'Saúde Mental', value: '78%', color: 'bg-primary' },
                     { label: 'Saneamento', value: '45%', color: 'bg-secondary' },
                     { label: 'Segurança Pública', value: '32%', color: 'bg-electric' }
                   ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-white/60">
                           <span>{item.label}</span>
                           <span>{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }}></div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="pt-4">
                   <p className="text-[9px] text-white/30 font-bold leading-relaxed uppercase">
                      Os dados acima são gerados a partir da anonimização de mais de 500 interações cidadãs nas últimas 72 horas.
                   </p>
                </div>
             </div>

             <div className="border-2 border-dashed border-border rounded-card p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto text-muted">
                   <Zap size={24} />
                </div>
                <div>
                   <h4 className="font-extrabold text-dark uppercase text-xs">Assine o Boletim Diário</h4>
                   <p className="text-[10px] text-muted font-bold mt-1 leading-relaxed">Receba os resumos de impacto diretamente no seu e-mail.</p>
                </div>
                <div className="flex gap-2">
                   <input className="input h-10 text-xs px-4" placeholder="seu@email.com" />
                   <button className="btn-primary w-12 h-10 p-0 shrink-0">
                      <ArrowRight size={18} />
                   </button>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
