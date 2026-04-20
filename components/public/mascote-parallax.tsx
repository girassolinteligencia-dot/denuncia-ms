'use client'

import React, { useEffect, useState } from 'react'

export function MascoteParallax() {
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Cálculo sutil de deslocamento (10% da velocidade do scroll)
      // Limitamos para evitar que a imagem 'descole' da base
      const scrollPos = window.scrollY
      if (scrollPos < 1000) {
        setOffsetY(scrollPos * 0.1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:flex items-end justify-end pointer-events-none z-10 overflow-visible"
      style={{
        transform: `translateY(${offsetY}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <img 
        src="/assets/mascote.png" 
        alt="Representante Denúncia MS" 
        className="h-[105%] xl:h-[115%] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      />
    </div>
  )
}
