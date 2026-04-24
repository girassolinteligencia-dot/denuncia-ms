'use client'

import React from 'react'
import Link from 'next/link'
import { Search, ArrowLeft, Home, Map } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 max-w-2xl w-full space-y-12 animate-fade-in">
        
        {/* Visual do Mascote (Placeholder para a imagem oficial) */}
        <div className="relative mx-auto w-64 h-64">
           <div className="absolute inset-0 bg-surface rounded-full scale-90 animate-pulse"></div>
           <div className="relative z-10 w-full h-full flex items-center justify-center">
              {/* Aqui entrará a imagem do mascote com a lupa */}
              <Search size={120} className="text-primary/20 animate-bounce" />
           </div>
        </div>

        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
             Erro 404 • Página não encontrada
           </div>
           <h1 className="text-5xl md:text-6xl font-black text-dark tracking-tighter uppercase italic leading-none">
             Perdido na <span className="text-primary italic">Trilha?</span>
           </h1>
           <p className="text-muted text-lg font-medium max-w-lg mx-auto leading-relaxed">
             Ops! Parece que o endereço que você tentou acessar não existe ou foi movido para uma nova localização no Mato Grosso do Sul.
           </p>
        </div>

        {/* Ações de Recuperação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
           <Link 
             href="/" 
             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-dark text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
           >
             <Home size={18} className="text-secondary" />
             Ir para o Início
           </Link>
           <button 
             onClick={() => window.history.back()}
             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border-2 border-border text-dark px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-surface transition-all"
           >
             <ArrowLeft size={18} />
             Voltar de onde veio
           </button>
        </div>

        {/* Rodapé de Ajuda */}
        <div className="pt-12 flex items-center justify-center gap-8 opacity-40">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Map size={14} />
              Portal MS
           </div>
           <div className="w-1 h-1 bg-muted rounded-full"></div>
           <div className="text-[10px] font-black uppercase tracking-widest">
              Suporte Técnico
           </div>
        </div>
      </div>
    </div>
  )
}
