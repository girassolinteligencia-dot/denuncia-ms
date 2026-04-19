'use client'

import React from 'react'
import { Bell, Search } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  return (
    <header className="h-20 bg-dark/95 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50 w-full shadow-lg">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-electric transition-colors" size={20} />
          <input 
            id="admin-search"
            type="text" 
            placeholder="Buscar por protocolo, cidadão ou ocorrência..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric/50 transition-all outline-none shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex flex-col text-right">
           <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] animate-pulse-soft">Sistema Online</p>
           <p className="text-[9px] text-white/30 font-bold">Encerrando em 07:59</p>
        </div>

        <button className="p-2.5 text-white/50 hover:text-electric hover:bg-white/5 rounded-xl transition-all relative border border-white/5 shadow-lg">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark shadow-glow-cyan animate-pulse"></span>
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-2"></div>

        <button className="flex items-center gap-4 hover:bg-white/5 p-1.5 pr-4 rounded-xl transition-all group border border-transparent hover:border-white/5">
          <div className="w-10 h-10 bg-gradient-neon rounded-xl flex items-center justify-center font-black text-white text-sm shadow-glow-cyan">
            PA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-black text-white tracking-tight group-hover:text-electric">Paulo Admin</p>
            <p className="text-[9px] text-secondary font-black uppercase tracking-widest mt-0.5">MS Central Control</p>
          </div>
        </button>
      </div>
    </header>
  )
}
