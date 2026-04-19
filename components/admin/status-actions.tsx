'use client'

import React, { useState } from 'react'
import { 
  Clock, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { updateDenunciaStatus } from '@/lib/actions/admin-denuncias'
import { toast } from 'sonner'
import type { StatusDenuncia } from '@/types'

const STATUS_OPTIONS: { value: StatusDenuncia, label: string, icon: any, color: string, activeColor: string }[] = [
  { value: 'recebida', label: 'Recebida', icon: Clock, color: 'text-muted', activeColor: 'bg-primary border-primary text-white shadow-glow-cyan' },
  { value: 'em_analise', label: 'Em Análise', icon: Search, color: 'text-muted', activeColor: 'bg-info border-info text-white shadow-glow-blue' },
  { value: 'encaminhada', label: 'Encaminhada', icon: Send, color: 'text-muted', activeColor: 'bg-secondary border-secondary text-white shadow-glow-green' },
  { value: 'resolvida', label: 'Resolvida', icon: CheckCircle2, color: 'text-muted', activeColor: 'bg-success border-success text-white' },
  { value: 'arquivada', label: 'Arquivada', icon: AlertTriangle, color: 'text-muted', activeColor: 'bg-red-500 border-red-500 text-white' },
]

export const StatusActions: React.FC<{ denunciaId: string, currentStatus: StatusDenuncia }> = ({ denunciaId, currentStatus }) => {
  const [status, setStatus] = useState<StatusDenuncia>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [obs, setObs] = useState('')

  const handleStatusChange = async (newStatus: StatusDenuncia) => {
    if (newStatus === status) return
    
    setLoading(true)
    const result = await updateDenunciaStatus(denunciaId, newStatus, obs)
    
    if (result.success) {
      setStatus(newStatus)
      toast.success(`Status atualizado para: ${newStatus.replace('_', ' ').toUpperCase()}`)
      setObs('')
    } else {
      toast.error(result.error || 'Erro ao atualizar status')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value
          const Icon = opt.icon
          
          return (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={loading}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                isActive 
                  ? opt.activeColor 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
              }`}
            >
              <div className="flex items-center gap-3">
                 <Icon size={18} />
                 <span className="text-xs font-black uppercase tracking-widest">{opt.label}</span>
              </div>
              {isActive && <CheckCircle2 size={16} />}
              {loading && !isActive && <div className="w-2 h-2 rounded-full bg-white/20"></div>}
            </button>
          )
        })}
      </div>

      <div className="space-y-2 pt-4 border-t border-white/10">
         <div className="flex items-center gap-2 text-secondary text-[10px] font-black uppercase tracking-widest">
            <MessageSquare size={14} />
            Observação de Triagem
         </div>
         <textarea 
           value={obs}
           onChange={(e) => setObs(e.target.value)}
           placeholder="Descreva o motivo da alteração ou próximos passos..."
           className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-secondary transition-all resize-none h-24"
         />
         <p className="text-[9px] text-white/40 font-medium italic">
            Esta observação ficará registrada nos logs internos de auditoria.
         </p>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-dark/20 backdrop-blur-[1px] flex items-center justify-center rounded-card">
           <RefreshCw size={24} className="animate-spin text-secondary" />
        </div>
      )}
    </div>
  )
}
