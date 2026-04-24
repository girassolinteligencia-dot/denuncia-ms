'use client'

import React, { useEffect, useState } from 'react'

export function MascoteParallax({ imageUrl = '/assets/mascote_sem_fundo.png' }: { imageUrl?: string }) {
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Somente aplica o efeito parallax em telas grandes (Desktop)
      if (window.innerWidth < 1024) {
        if (offsetY !== 0) setOffsetY(0)
        return
      }

      const scrollPos = window.scrollY
      if (scrollPos < 1000) {
        setOffsetY(scrollPos * 0.1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [offsetY])

  // Estilos comuns para as camadas do mascote
  const containerClasses = "absolute right-[-15%] sm:right-[-10%] lg:right-[-5%] xl:right-0 bottom-0 top-0 w-[110%] sm:w-[80%] lg:w-1/2 flex items-end justify-end pointer-events-none overflow-visible transition-all duration-1000"
  const imgClasses = "h-[75%] sm:h-[85%] xl:h-[95%] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
  
  const parallaxStyle = {
    transform: offsetY !== 0 ? `translateY(${offsetY}px)` : 'none',
    transition: 'transform 0.1s ease-out'
  }

  return (
    <>
      {/* CAMADA 1: Corpo (Atrás do texto - z-10) */}
      <div 
        className={`${containerClasses} z-10`}
        style={parallaxStyle}
      >
        <img 
          src={imageUrl} 
          alt="Representante Denuncia MS" 
          className={imgClasses}
        />
      </div>

      {/* CAMADA 2: Cabeça/Pescoço (À frente do texto - z-30) 
          Aplicamos uma máscara gradiente para garantir que apenas a parte superior 
          fique sobreposta ao texto, criando o efeito de profundidade.
      */}
      <div 
        className={`${containerClasses} z-30`}
        style={{
          ...parallaxStyle,
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 45%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 45%)',
        }}
      >
        <img 
          src={imageUrl} 
          alt="Destaque Cabeça Mascote" 
          className={imgClasses}
        />
      </div>
    </>
  )
}
