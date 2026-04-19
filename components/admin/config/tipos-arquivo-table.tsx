'use client'

import React, { useState } from 'react'
import { Save, RefreshCw, FileImage, Headphones, Video, FileText, File as FileIcon } from 'lucide-react'
import type { ConfigTipoArquivo } from '@/types'

const ICON_MAP: Record<string, any> = {
  foto: FileImage,
  audio: Headphones,
  video: Video,
  pdf: FileText,
  documento: FileIcon,
}

export const TiposArquivoTable: React.FC<{ initialTipos: ConfigTipoArquivo[] }> = ({ initialTipos }) => {
  const [tipos, setTipos] = useState<ConfigTipoArquivo[]>(initialTipos)
  const [loading, setLoading] = useState(false)

  const handleToggle = (id: string) => {
    setTipos(prev => prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t))
  }

  const handleInputChange = (id: string, field: 'qtd_maxima' | 'tamanho_max_mb', value: number) => {
    setTipos(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Controle de anexos atualizado!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-card shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Tipo de Arquivo</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Quant. Máxima</th>
                <th className="px-6 py-4">Tamanho Máx. (MB)</th>
                <th className="px-6 py-4">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tipos.map((tipo) => {
                const Icon = ICON_MAP[tipo.tipo] || FileIcon
                return (
                  <tr key={tipo.id} className={`transition-colors ${tipo.ativo ? 'bg-white' : 'bg-surface/30 opacity-60'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tipo.ativo ? 'bg-primary-50 text-primary' : 'bg-border text-muted'}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark uppercase">{tipo.tipo}</p>
                          <p className="text-[10px] text-muted">Acesso público ao upload</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleToggle(tipo.id)}
                          className={`w-12 h-6 rounded-full relative transition-all ${tipo.ativo ? 'bg-success' : 'bg-border'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${tipo.ativo ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="1"
                          max="20"
                          disabled={!tipo.ativo}
                          value={tipo.qtd_maxima}
                          onChange={(e) => handleInputChange(tipo.id, 'qtd_maxima', parseInt(e.target.value))}
                          className="input w-20 py-1.5 text-center font-bold"
                        />
                        <span className="text-[10px] text-muted font-bold">ARQS</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="1"
                          max="500"
                          disabled={!tipo.ativo}
                          value={tipo.tamanho_max_mb}
                          onChange={(e) => handleInputChange(tipo.id, 'tamanho_max_mb', parseInt(e.target.value))}
                          className="input w-24 py-1.5 text-center font-bold"
                        />
                        <span className="text-[10px] text-muted font-bold">MB / ARQ</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted italic">
                      {tipo.tipo === 'audio' || tipo.tipo === 'video' ? 'Requer processamento de stream' : 'Upload direto para S3/Storage'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end">
         <button 
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary min-w-[200px] gap-2"
         >
           {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
           Atualizar Políticas de Upload
         </button>
      </div>
    </div>
  )
}
