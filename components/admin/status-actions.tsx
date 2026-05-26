'use client'

import React, { useState } from 'react'
import {
  Clock,
  Search,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updateDenunciaStatus, deletarDenuncia } from '@/lib/actions/admin-denuncias'
import { toast } from 'sonner'
import type { StatusDenuncia } from '@/types'

const STATUS_OPTIONS: {
  value: StatusDenuncia
  label: string
  icon: any
  activeColor: string
}[] = [
  { value: 'recebida',   label: 'Recebida',    icon: Clock,         activeColor: 'bg-primary border-primary text-white shadow-glow-cyan' },
  { value: 'em_analise', label: 'Em Análise',  icon: Search,        activeColor: 'bg-info border-info text-white shadow-glow-blue' },
  { value: 'encaminhada',label: 'Encaminhada', icon: Send,          activeColor: 'bg-secondary border-secondary text-white shadow-glow-green' },
  { value: 'resolvida',  label: 'Resolvida',   icon: CheckCircle2,  activeColor: 'bg-success border-success text-white' },
  { value: 'arquivada',  label: 'Arquivada',   icon: AlertTriangle, activeColor: 'bg-red-500 border-red-500 text-white' },
]

interface Props {
  denunciaId: string
  currentStatus: StatusDenuncia
  isSuperAdmin?: boolean
}

export const StatusActions: React.FC<Props> = ({ denunciaId, currentStatus, isSuperAdmin = false }) => {
  const router = useRouter()
  const [status, setStatus]         = useState<StatusDenuncia>(currentStatus)
  const [loading, setLoading]       = useState(false)
  const [obs, setObs]               = useState('')

  // exclusão
  const [showDelete, setShowDelete] = useState(false)
  const [motivo, setMotivo]         = useState('')
  const [delLoading, setDelLoading] = useState(false)

  const handleStatusChange = async (newStatus: StatusDenuncia) => {
    if (newStatus === status) return

    if (!obs.trim()) {
      toast.error('Observação de triagem é obrigatória para alterar o status.')
      return
    }

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

  const handleDelete = async () => {
    if (motivo.trim().length < 10) {
      toast.error('Descreva o motivo com ao menos 10 caracteres.')
      return
    }
    setDelLoading(true)
    const result = await deletarDenuncia(denunciaId, motivo)
    if (result.success) {
      toast.success('Denúncia excluída definitivamente.')
      router.push('/admin/denuncias')
    } else {
      toast.error(result.error || 'Erro ao excluir.')
      setDelLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Status ── */}
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
              {loading && !isActive && <div className="w-2 h-2 rounded-full bg-white/20" />}
            </button>
          )
        })}
      </div>

      {/* ── Observação de triagem ── */}
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

      {/* ── Exclusão definitiva (superadmin) ── */}
      {isSuperAdmin && (
        <div className="pt-4 border-t border-white/10">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Trash2 size={14} />
              Excluir Definitivamente
            </button>
          ) : (
            <div className="space-y-3 bg-red-950/40 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldAlert size={14} />
                Confirmar Exclusão Permanente
              </div>
              <p className="text-[9px] text-red-300/70 leading-relaxed">
                Esta ação é <strong>irreversível</strong>. A denúncia e todos os seus dados serão removidos. O motivo ficará registrado no log de auditoria vinculado ao seu usuário.
              </p>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva obrigatoriamente o motivo da exclusão (mín. 10 caracteres)..."
                className="w-full bg-red-950/30 border border-red-500/30 rounded-lg p-3 text-xs text-white placeholder:text-red-300/30 focus:outline-none focus:border-red-400 transition-all resize-none h-20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDelete(false); setMotivo('') }}
                  disabled={delLoading}
                  className="flex-1 p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={delLoading || motivo.trim().length < 10}
                  className="flex-1 p-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                >
                  {delLoading ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-dark/20 backdrop-blur-[1px] flex items-center justify-center rounded-card">
          <RefreshCw size={24} className="animate-spin text-secondary" />
        </div>
      )}
    </div>
  )
}
