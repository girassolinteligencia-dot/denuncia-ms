import React from 'react'
import { BoletimIntelligence } from '@/components/public/boletim-intelligence'
import { EnqueteDinamica } from '@/components/public/enquete-dinamica'
import { getEnqueteAtiva } from '@/lib/actions/enquetes'

export default async function NoticiasPage() {
  const enqueteNoticias = await getEnqueteAtiva('noticias')

  return (
    <div className="min-h-screen bg-surface py-12 sm:py-20 space-y-16">
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

      {/* Seção de Enquete Específica para Notícias */}
      {enqueteNoticias && (
        <section className="bg-white border-y border-border py-16">
          <div className="container-page max-w-4xl">
            <div className="text-center mb-8 space-y-2">
               <h2 className="text-2xl font-black text-dark tracking-tight uppercase italic">Opinião <span className="text-primary">Pública</span></h2>
               <p className="text-muted text-xs font-medium">Participe da nossa pesquisa sobre os fatos recentes.</p>
            </div>
            <EnqueteDinamica initialData={enqueteNoticias} />
          </div>
        </section>
      )}
    </div>
  )
}
