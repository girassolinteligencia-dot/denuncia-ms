'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight, Lock, Loader2 } from 'lucide-react'

export default function AcompanharPage() {
  const [protocolo, setProtocolo] = useState('')
  const [chave, setChave] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!protocolo.trim() || !chave.trim()) {
       setError('Preencha ambos os campos para consultar.')
       return
    }

    setLoading(true)
    setError(null)
    
    // Simulação ou chamada real via URL (vamos usar URL por enquanto para manter a simplicidade do roteamento dinâmico, 
    // mas passando a chave via query param para ser validada no destino)
    router.push(`/acompanhar/${protocolo.trim().toUpperCase()}?key=${chave.trim()}`)
  }

  return (
    <div className="bg-surface min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">Consultar Denúncia</h1>
           <p className="text-muted text-sm font-medium">Insira suas credenciais geradas no momento do registro.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
           <div className="space-y-4">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                 <input 
                   value={protocolo}
                   onChange={(e) => setProtocolo(e.target.value)}
                   placeholder="Protocolo (Ex: DNS-2026-X7B9)" 
                   className="input h-14 pl-12 text-lg font-black tracking-widest uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-xs"
                   required
                 />
              </div>

              <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" size={20} />
                 <input 
                   type="text"
                   value={chave}
                   onChange={(e) => setChave(e.target.value)}
                   placeholder="Chave de Acesso (6 caracteres)" 
                   maxLength={6}
                   className="input h-14 pl-12 text-lg font-black tracking-widest uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-xs border-secondary/20 focus:border-secondary"
                   required
                 />
              </div>
           </div>

           {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-slide-up">
                 {error}
              </p>
           )}

           <button 
             type="submit" 
             disabled={loading}
             className="btn-primary w-full h-14 text-lg gap-2 bg-secondary hover:bg-secondary-600 border-none uppercase italic font-black disabled:opacity-50"
           >
              {loading ? <Loader2 className="animate-spin" /> : (
                 <>
                    Consultar Status
                    <ChevronRight size={20} />
                 </>
              )}
           </button>
        </form>
      </div>
    </div>
  )
}
