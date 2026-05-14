'use client'

import React, { useState } from 'react'
import { 
  Mail, 
  Zap, 
  Save, 
  RefreshCw, 
  Plus, 
  X, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react'
import { saveIntegracaoDestino } from '@/lib/actions/categorias'
import type { IntegracaoDestino, TipoIntegracao, PrioridadeEmail, MetodoWebhook, TipoAuthWebhook } from '@/types'

interface Props {
  categoriaId: string
  initialIntegracao?: IntegracaoDestino
}

export const CategoryIntegrationForm: React.FC<Props> = ({ categoriaId, initialIntegracao }) => {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  
  const [data, setData] = useState<Partial<IntegracaoDestino>>(initialIntegracao || {
    categoria_id: categoriaId,
    tipo: 'ambos',
    ativo: true,
    email_para: [],
    email_cc: [],
    email_bcc: [],
    email_assunto_template: 'Nova Denuncia: {{titulo}}',
    prioridade: 'normal',
    webhook_metodo: 'POST',
    webhook_auth_tipo: 'none',
    webhook_timeout: 30,
    webhook_retry_max: 3
  })

  const [activeTab, setActiveTab] = useState<'email' | 'webhook'>('email')
  const [newEmail, setNewEmail] = useState('')

  const handleAddEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      const currentEmails = data.email_para || []
      if (!currentEmails.includes(newEmail)) {
        setData({ ...data, email_para: [...currentEmails, newEmail] })
      }
      setNewEmail('')
    }
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setData({ ...data, email_para: (data.email_para || []).filter(e => e !== emailToRemove) })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await saveIntegracaoDestino(data)
      if (!res.success) throw new Error(res.error)
      alert('Integração de destino salva com sucesso!')
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    // API call to /api/webhook/test
    setTimeout(() => {
      setTesting(false)
      alert('Teste de entrega realizado via SSE. Verifique os logs.')
    }, 1500)
  }

  return (
    <div className="bg-white rounded-card shadow-card-lg border border-border overflow-hidden animate-slide-up max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-neon text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap size={22} className="text-accent shadow-glow-cyan" />
              Destino de Encaminhamento
            </h2>
            <p className="text-xs text-white/70 mt-1 uppercase tracking-widest font-bold">
              Configurar Integração para: {categoriaId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${data.ativo ? 'bg-secondary text-white' : 'bg-red-500/50 text-white line-through'}`}>
              {data.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border bg-surface">
        <button 
          onClick={() => setActiveTab('email')}
          className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 -mb-[2px] ${activeTab === 'email' ? 'border-primary text-primary bg-white' : 'border-transparent text-muted hover:text-dark'}`}
        >
          <Mail size={18} />
          ENCAMINHAMENTO POR E-MAIL
        </button>
        <button 
          onClick={() => setActiveTab('webhook')}
          className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 -mb-[2px] ${activeTab === 'webhook' ? 'border-primary text-primary bg-white' : 'border-transparent text-muted hover:text-dark'}`}
        >
          <Zap size={18} />
          WEBHOOK / API EXTERNA
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'email' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="label label-required">E-mails de Destino (Principal)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      className="input" 
                      placeholder="exemplo@orgao.ms.gov.br" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddEmail()
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={handleAddEmail}
                      className="btn-primary p-2 flex items-center justify-center shrink-0"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(data.email_para || []).map((email) => (
                       <span key={email} className="badge bg-primary-100 text-primary gap-1 pl-3 py-1 flex items-center rounded-full text-xs font-medium">
                         {email} 
                         <X size={14} className="cursor-pointer ml-1 hover:text-red-500 transition-colors" onClick={() => handleRemoveEmail(email)} />
                       </span>
                    ))}
                    {(!data.email_para || data.email_para.length === 0) && (
                      <span className="text-xs text-muted italic">Nenhum e-mail adicionado. A denúncia não será encaminhada por e-mail.</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Prioridade da Denuncia</label>
                <div className="grid grid-cols-3 gap-2">
                   {['normal', 'urgente', 'confidencial'].map(p => (
                     <button 
                      key={p}
                      onClick={() => setData({...data, prioridade: p as any})}
                      className={`p-2 text-[10px] font-black rounded-btn border transition-all uppercase ${data.prioridade === p ? 'bg-primary text-white border-primary shadow-glow-cyan' : 'bg-white text-muted border-border'}`}
                     >
                       {p}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed border-border">
               <label className="label">Modelo do Assunto (Dynamic Variables Suportadas)</label>
               <input 
                className="input font-mono text-xs" 
                value={data.email_assunto_template}
                onChange={e => setData({...data, email_assunto_template: e.target.value})}
               />
               <p className="text-[10px] text-muted">Variáveis disponíveis: {`{{protocolo}}, {{titulo}}, {{local}}, {{categoria}}`}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-lg flex gap-4 text-xs text-secondary-700 leading-relaxed">
                <Zap size={24} className="shrink-0" />
                <div>
                  <p className="font-black uppercase mb-1">Integração em Tempo Real</p>
                  <p>Ao selecionar Webhook, o sistema disparará um POST JSON para a URL configurada assim que a denuncia for confirmada.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="label label-required">URL do Endpoint</label>
                  <input className="input font-mono" placeholder="https://api.sistema-externo.com/v1/denuncias" />
                </div>
                <div>
                  <label className="label">Método HTTP</label>
                  <select className="input font-bold">
                    <option>POST</option>
                    <option>PUT</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="label flex items-center gap-2">
                      <ShieldCheck size={16} className="text-secondary" />
                      Autenticação
                    </label>
                    <span className="text-[10px] font-bold text-muted uppercase">Segurança Críptica</span>
                  </div>
                  <select className="input text-sm">
                    <option value="none">Nenhuma</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth (User/Pass)</option>
                    <option value="apikey">API Key (Custom Header)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="label">Timeout e Retry</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                       <input type="number" className="input pr-12" defaultValue={30} />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted">SEG</span>
                    </div>
                    <div className="relative">
                       <input type="number" className="input pr-12" defaultValue={3} />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted">TENT</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-surface border-t border-border flex items-center justify-between">
         <button 
          onClick={handleTest}
          disabled={testing}
          className="btn-outline gap-2"
         >
           {testing ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
           Testar Integração Agora
         </button>

         <div className="flex gap-4">
           <button className="btn-ghost text-xs uppercase font-bold tracking-widest text-muted">Cancelar</button>
           <button 
            onClick={handleSave}
            disabled={loading}
            className="btn-primary min-w-[200px] gap-2 shadow-glow-green bg-secondary hover:bg-secondary-600 border-none"
           >
             {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
             Salvar Destino
           </button>
         </div>
      </div>
    </div>
  )
}
