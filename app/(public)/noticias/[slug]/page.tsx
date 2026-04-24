import React from 'react'
import { buscarNoticiaPorSlug } from '@/lib/actions/intelligence'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Zap, Share2 } from 'lucide-react'

interface NewsDetailPageProps {
  params: {
    slug: string
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const res = await buscarNoticiaPorSlug(params.slug)

  if (!res.success || !res.data) {
    notFound()
  }

  const noticia = res.data

  return (
    <div className="min-h-screen bg-surface py-12 sm:py-20">
      <div className="container-page max-w-4xl space-y-8">
        
        {/* Navegação Voltar */}
        <Link 
          href="/noticias" 
          className="inline-flex items-center gap-2 text-[10px] font-black text-muted hover:text-primary transition-colors uppercase tracking-widest group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Notícias
        </Link>

        {/* Artigo */}
        <article className="bg-white rounded-[3rem] border border-border/60 shadow-xl overflow-hidden animate-fade-in">
          
          {/* Header do Artigo */}
          <header className="p-8 sm:p-16 bg-dark text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
               <span className="px-3 py-1 bg-primary text-white rounded-full">{noticia.categoria}</span>
               <span className="flex items-center gap-1.5 text-white/50"><Calendar size={14} className="text-secondary" /> {new Date(noticia.publicado_em || noticia.criado_em).toLocaleDateString()}</span>
               {noticia.gerado_por_ia && (
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60">
                    <Zap size={12} className="text-secondary fill-secondary" /> 
                    Inteligência Artificial
                 </span>
               )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter italic uppercase leading-[1.1] relative z-10">
              {noticia.titulo}
            </h1>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                     <User size={20} className="text-primary" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Fonte</p>
                     <p className="text-[10px] font-bold text-white/80">Denúncia MS — Oficial</p>
                  </div>
               </div>
               
               <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                  <Share2 size={18} className="text-white/40 group-hover:text-secondary" />
               </button>
            </div>
          </header>

          {/* Conteúdo do Artigo */}
          <div className="p-8 sm:p-16 space-y-8">
            <div className="prose prose-lg max-w-none text-dark/80 font-medium leading-relaxed">
              {noticia.conteudo.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-12 border-t border-border/40">
               <div className="bg-surface rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                     <h3 className="font-black text-dark uppercase text-xs tracking-widest">Sua voz importa</h3>
                     <p className="text-[10px] text-muted font-bold uppercase">Relate problemas em sua região agora.</p>
                  </div>
                  <Link 
                    href="/denunciar" 
                    className="btn-primary px-8 py-4 bg-primary text-white rounded-2xl font-black italic uppercase text-xs shadow-glow-cyan"
                  >
                    Fazer Denúncia
                  </Link>
               </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
