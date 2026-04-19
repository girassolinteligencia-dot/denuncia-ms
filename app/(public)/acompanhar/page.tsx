'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, ChevronRight, Lock } from 'lucide-react'

export default function AcompanharPage() {
  const [protocolo, setProtocolo] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (protocolo.trim()) {
      router.push(`/acompanhar/${protocolo.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="bg-surface min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-glow-cyan flex items-center justify-center text-primary mx-auto mb-6">
              <ShieldCheck size={32} />
           </div>
           <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">Consultar Denúncia</h1>
           <p className="text-muted text-sm">Insira o número do protocolo gerado no momento do registro para acompanhar o andamento.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
              <input 
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                placeholder="Ex: DNS-2026-000042" 
                className="input h-14 pl-12 text-lg font-bold tracking-widest uppercase placeholder:font-normal placeholder:tracking-normal"
                required
              />
           </div>
           <button type="submit" className="btn-primary w-full h-14 text-lg gap-2 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green uppercase italic font-black">
              Consultar Status
              <ChevronRight size={20} />
           </button>
        </form>

        <div className="flex items-center justify-center gap-4 text-[10px] text-muted font-black uppercase tracking-[0.2em] pt-4">
           <Lock size={14} className="text-secondary" />
           Consulta Segura e Privada
        </div>
      </div>
    </div>
  )
}
