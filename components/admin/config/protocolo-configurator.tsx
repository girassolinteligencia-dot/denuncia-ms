'use client'

import React, { useState } from 'react'
import { Save, RefreshCw, Hash, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ConfigProtocolo } from '@/types'

export const ProtocoloConfigurator: React.FC<{ initialConfig: ConfigProtocolo }> = ({ initialConfig }) => {
  const [config, setConfig] = useState<ConfigProtocolo>(initialConfig)
  const [loading, setLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleChange = (field: keyof ConfigProtocolo, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const formatarPreview = () => {
    const ano = config.formato_ano === 'YYYY' ? new Date().getFullYear() : new Date().getFullYear().toString().slice(-2)
    const seq = '0'.repeat(config.digitos_seq - 1) + '1'
    return `${config.prefixo}${config.separador}${ano}${config.separador}${seq}`
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configuração de protocolo salva!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <section className="bg-white rounded-card shadow-card border border-border overflow-hidden">
            <div className="p-4 bg-surface border-b border-border flex items-center gap-2">
              <Hash size={18} className="text-primary" />
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider">Padrão de Numeração</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prefixo</label>
                  <input 
                    value={config.prefixo}
                    onChange={(e) => handleChange('prefixo', e.target.value.toUpperCase())}
                    className="input font-bold tracking-widest"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="label">Separador</label>
                  <input 
                    value={config.separador}
                    onChange={(e) => handleChange('separador', e.target.value)}
                    className="input text-center font-bold"
                    maxLength={1}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Formato do Ano</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleChange('formato_ano', 'YYYY')}
                    className={`p-2 text-xs font-bold rounded-btn border transition-all ${config.formato_ano === 'YYYY' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border hover:border-primary'}`}
                  >
                    2026 (YYYY)
                  </button>
                  <button 
                    onClick={() => handleChange('formato_ano', 'YY')}
                    className={`p-2 text-xs font-bold rounded-btn border transition-all ${config.formato_ano === 'YY' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border hover:border-primary'}`}
                  >
                     26 (YY)
                  </button>
                </div>
              </div>

              <div>
                <label className="label text-xs">Dígitos Sequenciais</label>
                <div className="grid grid-cols-3 gap-2">
                   {[4, 5, 6].map(d => (
                     <button 
                      key={d}
                      onClick={() => handleChange('digitos_seq', d)}
                      className={`p-2 text-xs font-bold rounded-btn border transition-all ${config.digitos_seq === d ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border hover:border-primary'}`}
                    >
                      {d} Dígitos
                    </button>
                   ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-red-50 border border-red-100 rounded-card p-6">
            <h3 className="font-bold text-error text-xs uppercase mb-3 flex items-center gap-2">
               <AlertTriangle size={16} />
               Zona de Perigo
            </h3>
            <p className="text-[11px] text-red-700 leading-relaxed mb-4">
              Resetar a sequência fará com que a próxima denuncia comece a partir do número 1. Isso pode causar duplicidade de protocolos se o prefixo ou ano não forem alterados.
            </p>
            {!showResetConfirm ? (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="btn-danger w-full btn-sm"
              >
                Resetar Sequência para 1
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 btn-outline btn-sm">Cancelar</button>
                <button onClick={() => { setShowResetConfirm(false); alert('Sequência resetada!'); }} className="flex-1 btn-danger btn-sm">Confirmar Reset</button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-dark text-white rounded-card shadow-card p-8 flex flex-col items-center justify-center text-center">
             <p className="text-[10px] font-bold text-primary-300 uppercase tracking-[0.2em] mb-4">Preview do Próximo Protocolo</p>
             <div className="text-3xl font-black tracking-tighter sm:text-4xl text-accent">
               {formatarPreview()}
             </div>
             <p className="text-[10px] text-primary-200/60 mt-4 max-w-[200px]">
               Este será o formato exato gerado para a próxima denuncia registrada.
             </p>
          </section>

          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <h4 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              Status Atual
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Sequência Atual:</span>
                <span className="font-mono font-bold text-dark">{config.sequencia_atual}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Último Reset:</span>
                <span className="font-medium text-dark">{config.resetado_em ? new Date(config.resetado_em).toLocaleDateString() : 'Nunca'}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-3">
                <span className="text-muted">Capacidade máx:</span>
                <span className="font-bold text-dark">{Math.pow(10, config.digitos_seq) - 1} denuncias</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full gap-2"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Padrão de Protocolo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
