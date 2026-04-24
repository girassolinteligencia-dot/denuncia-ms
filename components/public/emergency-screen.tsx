'use client'

import React from 'react'
import { ShieldAlert, AlertTriangle, Phone, ExternalLink, ArrowRight } from 'lucide-react'

export const EmergencyScreen = ({ mensagem }: { mensagem: string }) => {
  return (
    <div className="min-h-screen bg-[#0A0000] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Cinematográfico de Alerta */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-red-900/10 rounded-full blur-[180px] animate-pulse"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full space-y-12 animate-fade-in">
        
        {/* Emblema de Segurança Máxima */}
        <div className="relative mx-auto w-40 h-40">
           <div className="absolute inset-0 bg-red-600 rounded-[3rem] rotate-12 opacity-20 animate-spin-slow"></div>
           <div className="absolute inset-0 bg-red-600 rounded-[3rem] -rotate-6 opacity-20 animate-reverse-spin-slow"></div>
           <div className="relative z-10 w-full h-full bg-red-600 rounded-[2.5rem] shadow-[0_0_60px_rgba(220,38,38,0.4)] flex items-center justify-center text-white border-b-8 border-red-800">
              <ShieldAlert size={80} />
           </div>
        </div>

        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
             <AlertTriangle size={14} className="animate-pulse" />
             Protocolo de Contingência Nível 5
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
             SISTEMA <br />
             <span className="text-red-600 italic">SUSPENSO</span>
           </h1>
           
           <div className="max-w-xl mx-auto p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
              <p className="text-white/80 text-lg font-bold leading-relaxed italic">
                &ldquo;{mensagem || 'Acesso suspenso temporariamente por motivos de segurança institucional.'}&rdquo;
              </p>
           </div>
        </div>

        {/* Canais de Emergência */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
           <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 text-left group hover:bg-white/10 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <Phone size={24} />
              </div>
              <div>
                 <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Emergência Geral</p>
                 <p className="text-lg font-black text-white">Ligue 190</p>
              </div>
              <ArrowRight className="ml-auto text-white/20 group-hover:text-red-500 transition-colors" />
           </div>

           <a 
             href="https://www.ouvidoria.ms.gov.br" 
             target="_blank" 
             rel="noopener noreferrer"
             className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 text-left group hover:bg-white/10 transition-all"
           >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                 <ExternalLink size={24} />
              </div>
              <div>
                 <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Canal Oficial</p>
                 <p className="text-lg font-black text-white">Ouvidoria Geral</p>
              </div>
              <ArrowRight className="ml-auto text-white/20 group-hover:text-white transition-colors" />
           </a>
        </div>

        {/* Rodapé Institucional */}
        <div className="pt-12 space-y-4 opacity-30">
           <p className="text-[9px] font-black text-white uppercase tracking-[0.5em]">
              Denuncia MS — Mato Grosso do Sul
           </p>
           <div className="flex justify-center gap-2">
              <div className="w-12 h-1 bg-red-600 rounded-full"></div>
              <div className="w-4 h-1 bg-white/20 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  )
}
