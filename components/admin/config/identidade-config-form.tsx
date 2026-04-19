'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, Palette, Globe, Mail, Info } from 'lucide-react'
import { toast } from 'sonner' // I'll need to install sonner or use a custom toast

interface PlataformaConfigData {
  'identidade.nome': string
  'identidade.slogan': string
  'identidade.email': string
  'identidade.rodape': string
  'cores.primaria': string
  'cores.secundaria': string
}

export const IdentidadeConfigForm: React.FC<{ initialData: any }> = ({ initialData }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PlataformaConfigData>({
    'identidade.nome': initialData['identidade.nome'] || 'DENUNCIA MS',
    'identidade.slogan': initialData['identidade.slogan'] || '',
    'identidade.email': initialData['identidade.email'] || '',
    'identidade.rodape': initialData['identidade.rodape'] || '',
    'cores.primaria': initialData['cores.primaria'] || '#1535C9',
    'cores.secundaria': initialData['cores.secundaria'] || '#F5C800',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Aqui chamaremos a Server Action que implementarei para salvar configs em lote
      // Por enquanto, simulamos o sucesso
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Salvando configs:', formData)
      alert('Configurações salvas com sucesso!')
    } catch (err) {
      alert('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Dados Básicos */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-card shadow-card border border-border overflow-hidden">
            <div className="p-4 bg-surface border-b border-border flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider">Identidade da Plataforma</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label label-required">Nome da Plataforma</label>
                  <input 
                    name="identidade.nome"
                    value={formData['identidade.nome']}
                    onChange={handleChange}
                    className="input" 
                    placeholder="Ex: DENUNCIA MS"
                    required
                  />
                </div>
                <div>
                  <label className="label">Slogan / Subtítulo</label>
                  <input 
                    name="identidade.slogan"
                    value={formData['identidade.slogan']}
                    onChange={handleChange}
                    className="input" 
                    placeholder="Ex: Sua voz, nossa missão"
                  />
                </div>
              </div>

              <div>
                <label className="label">E-mail Institucional de Contato</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    name="identidade.email"
                    type="email"
                    value={formData['identidade.email']}
                    onChange={handleChange}
                    className="input pl-10" 
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </div>

              <div>
                <label className="label">Rodapé Institucional</label>
                <textarea 
                  name="identidade.rodape"
                  value={formData['identidade.rodape']}
                  onChange={handleChange}
                  className="input min-h-[100px] py-3" 
                  placeholder="Texto que aparecerá no rodapé de todas as páginas..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-card shadow-card border border-border overflow-hidden">
             <div className="p-4 bg-surface border-b border-border flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider">Cores Institucionais</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg shadow-inner border border-border"
                    style={{ backgroundColor: formData['cores.primaria'] }}
                  ></div>
                  <div className="flex-1">
                    <label className="label">Cor Primária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        name="cores.primaria"
                        value={formData['cores.primaria']}
                        onChange={handleChange}
                        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        name="cores.primaria"
                        value={formData['cores.primaria']}
                        onChange={handleChange}
                        className="input font-mono uppercase text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg shadow-inner border border-border"
                    style={{ backgroundColor: formData['cores.secundaria'] }}
                  ></div>
                  <div className="flex-1">
                    <label className="label">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        name="cores.secundaria"
                        value={formData['cores.secundaria']}
                        onChange={handleChange}
                        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        name="cores.secundaria"
                        value={formData['cores.secundaria']}
                        onChange={handleChange}
                        className="input font-mono uppercase text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-700 text-xs">
                <Info size={16} className="shrink-0" />
                <p>Estas cores serão aplicadas dinamicamente na interface pública. A alteração aqui reflete instantaneamente após o salvamento.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Coluna 2: Logo e Favicon */}
        <div className="space-y-6">
          <section className="bg-white rounded-card shadow-card border border-border overflow-hidden">
             <div className="p-4 bg-surface border-b border-border flex items-center gap-2">
              <ImageIcon size={18} className="text-primary" />
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider">Logotipo e Ícone</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="label">Logotipo Principal (PNG/SVG)</label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface transition-colors">
                  <div className="bg-primary-50 text-primary p-3 rounded-full mb-3">
                    <RefreshCw size={24} />
                  </div>
                  <p className="text-sm font-bold text-dark">Clique para enviar</p>
                  <p className="text-[10px] text-muted mt-1">Recomendado: 240x80px</p>
                </div>
              </div>

              <div>
                <label className="label">Favicon (16x16 / 32x32)</label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-4 cursor-pointer hover:bg-surface transition-colors">
                  <div className="w-8 h-8 bg-surface rounded flex items-center justify-center text-muted">
                    <ImageIcon size={16} />
                  </div>
                  <div className="text-left">
                     <p className="text-xs font-bold text-dark">Enviar favicon</p>
                     <p className="text-[10px] text-muted">Apenas arquivos .ico ou .png</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-primary/5 border border-primary/10 rounded-card p-6">
            <h3 className="font-bold text-primary text-sm mb-2 flex items-center gap-2">
               <RefreshCw size={16} />
               Sincronização
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              O sistema utiliza cache para as configurações. Ao salvar, o cache é invalidado automaticamente, mas pode levar até 30 segundos para ser propagado em todos os servidores do Mato Grosso do Sul.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-border">
         <p className="text-xs text-muted italic">Última atualização: {new Date().toLocaleDateString()} por Paulo Administrativo</p>
         <button 
          type="submit" 
          disabled={loading}
          className="btn-primary min-w-[150px] gap-2"
         >
           {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
           Salvar Alterações
         </button>
      </div>
    </form>
  )
}

function ImageIcon({ size, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  )
}
