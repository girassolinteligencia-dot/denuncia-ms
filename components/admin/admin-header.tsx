'use client'

import React from 'react'
import { Bell, Search, Menu } from 'lucide-react'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="h-16 sm:h-20 bg-dark/95 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 w-full shadow-lg">
      <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-2xl min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full group min-w-0">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-electric transition-colors" size={18} />
          <input 
            id="admin-search"
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric/50 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 ml-4">
        <div className="hidden lg:flex flex-col text-right">
           <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] animate-pulse-soft">Sistema Online</p>
           <p className="text-[9px] text-white/30 font-bold">Encerrando em 07:59</p>
        </div>

        <button className="p-2 sm:p-2.5 text-white/50 hover:text-electric hover:bg-white/5 rounded-xl transition-all relative">
          <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-dark shadow-glow-cyan"></span>
        </button>
        
        <div className="hidden sm:block h-8 w-px bg-white/10 mx-2"></div>

        <button className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-xl transition-all group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-neon rounded-lg sm:rounded-xl flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-glow-cyan">
            PA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-black text-white tracking-tight group-hover:text-electric">Paulo Admin</p>
          </div>
        </button>
      </div>
    </header>
  )
}
