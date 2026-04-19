'use client'

import React, { useState } from 'react'
import { Plus, GripVertical, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import type { Banner } from '@/types'

export const BannerManager: React.FC<{ initialBanners: Banner[] }> = ({ initialBanners }) => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
         <p className="text-xs text-muted font-bold uppercase tracking-widest">Arraste para ordenar os banners ativos</p>
         <button className="btn-primary gap-2 bg-secondary hover:bg-secondary-600 border-none">
           <Plus size={20} />
           Adicionar Banner
         </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-card shadow-card border border-border overflow-hidden flex items-center gap-6 p-4 hover:shadow-card-md transition-all">
            <div className="cursor-grab text-muted hover:text-primary transition-colors">
              <GripVertical size={24} />
            </div>

            <div className="w-48 h-20 bg-surface rounded-lg overflow-hidden border border-border shrink-0">
               {banner.imagem_url ? (
                 <img src={banner.imagem_url} alt="Banner" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageIcon size={24} />
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-1">
               <div className="flex items-center gap-2">
                 <span className="badge bg-primary-50 text-primary uppercase text-[8px] font-black tracking-widest">
                   {banner.posicao}
                 </span>
                 {banner.ativo ? (
                   <span className="badge bg-green-50 text-success uppercase text-[8px] font-black tracking-widest">Ativo</span>
                 ) : (
                   <span className="badge bg-red-50 text-error uppercase text-[8px] font-black tracking-widest">Pausado</span>
                 )}
               </div>
               <div className="flex items-center gap-2 text-xs text-muted font-medium">
                 <LinkIcon size={14} className="text-primary" />
                 <span className="line-clamp-1">{banner.link_url || 'Sem link externo definido'}</span>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button className="btn-outline btn-sm">Editar</button>
               <button className="btn-ghost p-2 text-error hover:bg-red-50 rounded-lg">
                 <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-card p-12 text-center text-muted italic">
             Nenhum banner cadastrado. Adicione um para destacar informações importantes no portal público.
          </div>
        )}
      </div>
    </div>
  )
}
