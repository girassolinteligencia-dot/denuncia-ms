'use client'

import React, { useState } from 'react'
import { Save, RefreshCw, FileText, Code, CheckCircle2, QrCode } from 'lucide-react'
import type { ConfigTemplate, TipoTemplate } from '@/types'

export const TemplatesConfigEditor: React.FC<{ initialTemplates: ConfigTemplate[] }> = ({ initialTemplates }) => {
  const [templates, setTemplates] = useState<ConfigTemplate[]>(initialTemplates)
  const [activeTab, setActiveTab] = useState<TipoTemplate>('cabecalho')
  const [loading, setLoading] = useState(false)

  const templateAtivo = templates.find(t => t.tipo === activeTab)!

  const handleContentChange = (content: string) => {
    setTemplates(prev => prev.map(t => t.tipo === activeTab ? { ...t, conteudo: content } : t))
  }

  const handleToggleQrCode = () => {
    setTemplates(prev => prev.map(t => t.tipo === activeTab ? { ...t, incluir_qrcode: !t.incluir_qrcode } : t))
  }

  const inserirVariavel = (variavel: string) => {
    const area = document.getElementById('template-editor') as HTMLTextAreaElement
    if (!area) return

    const start = area.selectionStart
    const end = area.selectionEnd
    const texto = area.value
    const novoTexto = texto.substring(0, start) + variavel + texto.substring(end)
    
    handleContentChange(novoTexto)
    
    // Pequeno timeout para focar de volta
    setTimeout(() => {
      area.focus()
      area.setSelectionRange(start + variavel.length, start + variavel.length)
    }, 0)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Templates de documento atualizados!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex border-b border-border">
        {templates.map((t) => (
          <button
            key={t.tipo}
            onClick={() => setActiveTab(t.tipo)}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === t.tipo 
                ? 'border-primary text-primary bg-primary-50/50' 
                : 'border-transparent text-muted hover:text-dark'
            }`}
          >
            {t.tipo.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-card shadow-card border border-border overflow-hidden">
            <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h2 className="font-bold text-dark text-sm uppercase tracking-wider">Editor de Template</h2>
              </div>
              <div className="flex items-center gap-4">
                 {activeTab === 'rodape' && (
                   <button 
                    onClick={handleToggleQrCode}
                    className={`flex items-center gap-2 text-[10px] font-bold transition-colors ${templateAtivo.incluir_qrcode ? 'text-success' : 'text-muted'}`}
                   >
                     <QrCode size={16} />
                     {templateAtivo.incluir_qrcode ? 'QR CODE ATIVO' : 'SEM QR CODE'}
                   </button>
                 )}
                 <div className="text-[10px] font-bold text-muted bg-border px-2 py-0.5 rounded">
                   FORMATO: PLAIN TEXT/HANDLEBARS
                 </div>
              </div>
            </div>
            
            <textarea
              id="template-editor"
              value={templateAtivo.conteudo}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-80 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none border-none bg-surface/10"
              placeholder="Digite o conteúdo do template aqui..."
            />
          </div>

          <div className="flex items-center justify-end">
             <button 
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary min-w-[200px] gap-2"
             >
               {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
               Salvar Todos Templates
             </button>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-card shadow-card border border-border overflow-hidden">
            <div className="p-4 bg-primary text-white flex items-center gap-2">
              <Code size={18} />
              <h3 className="font-bold text-xs uppercase tracking-wider">Variáveis Dinâmicas</h3>
            </div>
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              <p className="text-[10px] text-muted font-bold mb-4 uppercase">Clique na variável para inserir no cursor:</p>
              {templateAtivo.variaveis_disponiveis.map((v) => (
                <button
                  key={v.chave}
                  onClick={() => inserirVariavel(v.chave)}
                  className="w-full group text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary-50 transition-all"
                >
                  <code className="text-[11px] font-bold text-primary group-hover:underline">
                    {v.chave}
                  </code>
                  <p className="text-[10px] text-muted mt-1 uppercase tracking-tight font-medium">
                    {v.descricao}
                  </p>
                </button>
              ))}
              
              <div className="p-3 border border-dashed border-border rounded-lg bg-surface/30">
                 <p className="text-[10px] font-bold text-dark uppercase mb-1 flex items-center gap-1">
                   <CheckCircle2 size={12} className="text-success" />
                   Condicional Suportada:
                 </p>
                 <code className="text-[9px] text-muted block leading-tight">
                   {`{{#unless anonima}}`} <br/>
                   &nbsp;&nbsp;... conteúdo ... <br/>
                   {`{{/unless}}`}
                 </code>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
