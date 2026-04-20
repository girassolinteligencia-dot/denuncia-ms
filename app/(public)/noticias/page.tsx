'use client'

import React from 'react'
import { 
  Megaphone, 
  ArrowRight, 
  Calendar,
  Clock,
  Zap
} from 'lucide-react'

// Mantemos apenas as notícias jornalísticas
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
    impacto: 'Alta Relevância'
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
    impacto: 'Impacto Positivo'
  }
]

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Simplificado */}
        <header className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-dark tracking-tighter italic">
            CENTRAL DE <span className="text-primary italic">NOTÍCIAS</span>
          </h1>
          <p className="text-muted text-sm md:text-md max-w-xl mx-auto font-medium leading-relaxed">
            Acompanhe as principais atualizações e relatórios de transparência de Mato Grosso do Sul.
          </p>
        </header>

        {/* Feed de Notícias */}
        <div className="space-y-6">
          {NOTICIAS_IMPACTO.map((noticia) => (
            <article key={noticia.id} className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden border border-border transition-all hover:border-primary/50 hover:shadow-card-lg p-6 md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[9px] font-black text-muted uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {noticia.data}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {noticia.horario}</span>
                    <span className="text-primary">{noticia.categoria}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-dark group-hover:text-primary transition-colors leading-tight italic">
                    {noticia.titulo}
                  </h2>
                  <p className="text-muted text-sm leading-relaxed font-medium">
                    {noticia.resumo}
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-border/50">
                    <div className="flex items-center gap-2 text-dark">
                      <Zap size={14} className="text-secondary fill-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{noticia.impacto}</span>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest group-hover:translate-x-1 transition-transform">
                      Ler mais <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  )
}
