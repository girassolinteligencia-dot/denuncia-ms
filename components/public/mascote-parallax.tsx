'use client'

import React, { useEffect, useState } from 'react'

export function MascoteParallax({ imageUrl = '/assets/mascote.png' }: { imageUrl?: string }) {
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

  return (
    <div 
      className="absolute right-[-20%] sm:right-[-10%] lg:right-0 bottom-0 top-0 w-[120%] sm:w-[80%] lg:w-1/2 flex items-end justify-end pointer-events-none z-0 overflow-visible opacity-20 lg:opacity-100 transition-opacity duration-1000"
      style={{
        transform: offsetY !== 0 ? `translateY(${offsetY}px)` : 'none',
        transition: 'transform 0.1s ease-out'
      }}
    >
      <img 
        src={imageUrl} 
        alt="Representante Denúncia MS" 
        className="h-[85%] xl:h-[95%] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      />
    </div>
  )
}
