'use client'

import React from 'react'
import { BoletimIntelligence } from '@/components/public/boletim-intelligence'

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-surface py-12 sm:py-20">
      <div className="container-page max-w-6xl space-y-8 sm:space-y-12">
        
        {/* Header Simplificado */}
        <header className="space-y-3 sm:space-y-4 text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter italic uppercase">
            Central de <span className="text-primary italic">Notícias</span>
          </h1>
          <p className="text-xs sm:text-md text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Acompanhe as principais atualizações e relatórios de inteligência de Mato Grosso do Sul.
          </p>
        </header>

        {/* Boletim e Inteligência (Live Feed + Tendências) */}
        <BoletimIntelligence />

      </div>
    </div>
  )
}
