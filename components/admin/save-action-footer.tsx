'use client'

import React from 'react'
import { Save, X, RefreshCw } from 'lucide-react'

interface SaveActionFooterProps {
  isDirty: boolean
  loading: boolean
  onSave: () => void
  onCancel: () => void
  labelSave?: string
  labelCancel?: string
}

export const SaveActionFooter: React.FC<SaveActionFooterProps> = ({
  isDirty,
  loading,
  onSave,
  onCancel,
  labelSave = 'Salvar Alterações',
  labelCancel = 'Descartar'
}) => {
  if (!isDirty && !loading) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="bg-dark/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 min-w-[320px] justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none">Alterações Pendentes</span>
          <span className="text-[9px] text-white/40 font-bold uppercase tracking-tight mt-1">Existem modificações não salvas</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-4 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <X size={14} />
            {labelCancel}
          </button>
          
          <button
            onClick={onSave}
            disabled={loading}
            className="h-12 px-8 bg-accent hover:bg-accent-600 text-dark font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-glow-cyan flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {labelSave}
          </button>
        </div>
      </div>
    </div>
  )
}
