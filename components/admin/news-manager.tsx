'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  ExternalLink, 
  Eye, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  Image as ImageIcon
} from 'lucide-react'
import type { Noticia } from '@/types'

export const NewsManager: React.FC<{ initialNoticias: Noticia[] }> = ({ initialNoticias }) => {
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input className="input pl-10" placeholder="Pesquisar notícias..." />
        </div>
        <button className="btn-primary gap-2 h-11 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green">
          <Plus size={20} />
          Criar Nova Publicação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {noticias.map((news) => (
          <div key={news.id} className="bg-white rounded-card shadow-card-md border border-border overflow-hidden flex flex-col group transition-all hover:shadow-card-lg">
            <div className="h-48 bg-surface relative overflow-hidden">
               {news.imagem_url ? (
                 <img src={news.imagem_url} alt={news.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageIcon size={48} className="opacity-20" />
                 </div>
               )}
               <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20 ${news.publicado ? 'bg-success/80 text-white' : 'bg-warning/80 text-white'}`}>
                    {news.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
               </div>
            </div>

            <div className="p-5 flex-1 space-y-3">
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.1em]">{news.categoria || 'Geral'}</p>
              <h3 className="font-bold text-dark leading-tight line-clamp-2">
                {news.titulo}
              </h3>
              
              <div className="flex items-center gap-4 text-[11px] text-muted">
                 <div className="flex items-center gap-1">
                   <Calendar size={14} />
                   {news.publicado_em ? new Date(news.publicado_em).toLocaleDateString() : 'N/A'}
                 </div>
                 <div className="flex items-center gap-1">
                   <User size={14} />
                   Paulo Admin
                 </div>
              </div>
            </div>

            <div className="p-4 bg-surface/50 border-t border-border flex items-center justify-between">
               <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                 <Eye size={14} />
                 Visualizar
               </button>
               <button className="p-2 hover:bg-white rounded-lg transition-colors">
                 <MoreHorizontal size={18} className="text-muted" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
