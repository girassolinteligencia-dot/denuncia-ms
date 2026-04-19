'use client'

import React, { useState } from 'react'
import { Save, RefreshCw, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import type { ConfigCampoFormulario } from '@/types'

export const CamposFormularioTable: React.FC<{ initialCampos: ConfigCampoFormulario[] }> = ({ initialCampos }) => {
  const [campos, setCampos] = useState<ConfigCampoFormulario[]>(
    [...initialCampos].sort((a, b) => a.ordem - b.ordem)
  )
  const [loading, setLoading] = useState(false)

  const handleToggle = (id: string, field: 'obrigatorio' | 'visivel') => {
    setCampos(prev => prev.map(c => {
      if (c.id === id) {
        // Regra especial: se for obrigatório, DEVE ser visível
        if (field === 'obrigatorio' && !c.obrigatorio) {
           return { ...c, obrigatorio: true, visivel: true }
        }
        return { ...c, [field]: !c[field] }
      }
      return c
    }))
  }

  const handleInputChange = (id: string, field: 'label' | 'placeholder', value: string) => {
    setCampos(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Salvando campos:', campos)
      alert('Configuração de campos salva com sucesso!')
    } catch (err) {
      alert('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-card shadow-card border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
              <th className="px-6 py-4">Ordem</th>
              <th className="px-6 py-4">Campo Interno</th>
              <th className="px-6 py-4">Label Público</th>
              <th className="px-6 py-4">Placeholder</th>
              <th className="px-6 py-4 text-center">Obrigatório</th>
              <th className="px-6 py-4 text-center">Visível</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campos.map((campo, index) => (
              <tr key={campo.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-muted">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <code className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-primary font-bold">
                    {campo.campo}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <input 
                    value={campo.label}
                    onChange={(e) => handleInputChange(campo.id, 'label', e.target.value)}
                    className="bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-dark w-full"
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    value={campo.placeholder || ''}
                    onChange={(e) => handleInputChange(campo.id, 'placeholder', e.target.value)}
                    className="bg-transparent border-none focus:ring-0 p-0 text-xs text-muted w-full italic"
                    placeholder="Sem placeholder..."
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleToggle(campo.id, 'obrigatorio')}
                      className={`w-10 h-5 rounded-full relative transition-colors ${campo.obrigatorio ? 'bg-primary' : 'bg-border'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${campo.obrigatorio ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                     <button 
                      onClick={() => handleToggle(campo.id, 'visivel')}
                      disabled={campo.obrigatorio} // campos obrigatórios devem ser visíveis
                      className={`flex items-center gap-2 text-xs font-bold transition-colors ${campo.visivel ? 'text-primary' : 'text-muted'}`}
                    >
                      {campo.visivel ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span className="w-8">{campo.visivel ? 'SIM' : 'NÃO'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3 text-yellow-800 text-xs leading-relaxed">
        <AlertCircle size={16} className="shrink-0" />
        <div>
          <p className="font-bold mb-1">Dica de parametrização:</p>
          <p>Campos configurados como <strong>Obrigatórios</strong> ativam automaticamente a validação de formulário no lado do cliente e do servidor. Se um campo é obrigatório, ele não pode ser ocultado.</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4">
         <button 
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary min-w-[150px] gap-2"
         >
           {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
           Salvar Ordenação e Regras
         </button>
      </div>
    </div>
  )
}
