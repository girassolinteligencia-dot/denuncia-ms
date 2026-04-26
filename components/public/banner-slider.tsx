'use client'

import React, { useState, useEffect } from 'react'
import type { Banner } from '@/types'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface BannerSliderProps {
  banners: Banner[]
  posicao: 'topo' | 'lateral' | 'rodape'
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners, posicao }) => {
  const [current, setCurrent] = useState(0)
  
  const filteredBanners = banners.filter(b => b.ativo && b.posicao === posicao)
  
  useEffect(() => {
    if (filteredBanners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % filteredBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [filteredBanners.length])

  if (filteredBanners.length === 0) return null

  const next = () => setCurrent((current + 1) % filteredBanners.length)
  const prev = () => setCurrent((current - 1 + filteredBanners.length) % filteredBanners.length)

  if (posicao === 'topo') {
    return (
      <div className="relative group w-full overflow-hidden bg-dark rounded-[2.5rem] shadow-2xl border border-white/10 aspect-[21/9] md:aspect-[21/7]">
        {filteredBanners.map((banner, index) => (
          <div 
            key={banner.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
            }`}
          >
            <img 
              src={banner.imagem_url} 
              alt={banner.titulo || 'Banner'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Se a imagem falhar (ex: webp não suportado ou erro de link), mostra um fundo neutro
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Overlay Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/40 to-transparent flex flex-col justify-center px-12 sm:px-20">
              <div className="max-w-2xl space-y-4">
                 {banner.titulo && (
                   <h2 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight animate-slide-up">
                     {banner.titulo}
                   </h2>
                 )}
                 {banner.subtitulo && (
                   <p className="text-lg sm:text-xl text-white/70 font-medium animate-slide-up animation-delay-200">
                     {banner.subtitulo}
                   </p>
                 )}
                  {banner.link_url && (
                    <a 
                      href="https://wa.me/5567991036562" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-secondary text-dark font-black px-8 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-white transition-all shadow-glow-green animate-slide-up animation-delay-300"
                    >
                      Saiba Mais
                      <ArrowRight size={18} />
                    </a>
                  )}
              </div>
            </div>
          </div>
        ))}

        {filteredBanners.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={24} />
            </button>
            <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={24} />
            </button>
            
            {/* Indicadores */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
               {filteredBanners.map((_, i) => (
                 <button 
                  key={i} 
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 transition-all rounded-full ${i === current ? 'w-8 bg-secondary' : 'w-2 bg-white/30'}`}
                 />
               ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // Layout para Lateral (Sidebar)
  if (posicao === 'lateral') {
    const banner = filteredBanners[current]
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border group aspect-[4/5]">
         <img src={banner.imagem_url} alt={banner.titulo || 'Banner'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
         {banner.link_url && (
           <a href={banner.link_url} className="absolute inset-0 z-10" title={banner.titulo || 'Ver mais informações'} />
         )}
         {(banner.titulo || banner.subtitulo) && (
           <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-dark to-transparent text-white">
              {banner.titulo && <h4 className="font-black uppercase italic tracking-tighter text-sm">{banner.titulo}</h4>}
              {banner.subtitulo && <p className="text-[10px] text-white/70 font-medium mt-1">{banner.subtitulo}</p>}
           </div>
         )}
      </div>
    )
  }

  return null
}
