'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Logar o erro em um serviço de monitoramento
    console.error('Erro detectado na plataforma:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FDF2F2] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Elementos Decorativos de Alerta */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.05]">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full space-y-10 animate-fade-in">
        
        {/* Ícone de Alerta Animado */}
        <div className="mx-auto w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-red-500 border-b-4 border-red-100">
           <AlertTriangle size={64} className="animate-pulse" />
        </div>

        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-200 rounded-full text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
             Erro 500 • Falha Interna
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter uppercase italic leading-none">
             Turbulência <span className="text-red-500 italic">Técnica!</span>
           </h1>
           <p className="text-muted text-lg font-medium max-w-lg mx-auto leading-relaxed">
             Ops! Nossos sistemas tiveram um pequeno soluço. Mas não se preocupe, nossos engenheiros já foram notificados.
           </p>
        </div>

        {/* Technical Info (Sutil) */}
        {error.digest && (
          <div className="bg-white/50 backdrop-blur-sm border border-red-100 rounded-xl py-2 px-4 inline-block">
             <p className="text-[10px] font-mono text-red-400">ID DO ERRO: {error.digest}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
           <button 
             onClick={() => reset()}
             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-500 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-500/20"
           >
             <RefreshCcw size={18} />
             Tentar Novamente
           </button>
           <Link 
             href="/" 
             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border-2 border-border text-dark px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-surface transition-all"
           >
             <Home size={18} />
             Voltar ao Início
           </Link>
        </div>

        {/* Botão de Suporte */}
        <div className="pt-8">
           <button className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-muted hover:text-dark transition-colors">
              <MessageSquare size={14} />
              Reportar falha ao suporte
           </button>
        </div>
      </div>
    </div>
  )
}
