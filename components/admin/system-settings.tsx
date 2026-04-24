'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  ShieldCheck, 
  Globe, 
  Power, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react'
import { getSystemConfig, updateSystemConfig } from '@/lib/actions/admin-config'
import { toast } from 'sonner'

export const SystemSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configs, setConfigs] = useState({
    sala_situacao_ativa: true,
    manutencao_global: false,
    status_emergencia: false,
    mensagem_emergencia: ''
  })

  useEffect(() => {
    async function loadConfigs() {
      const [sala, manutencao, emergencia, msg] = await Promise.all([
        getSystemConfig('sala_situacao_ativa'),
        getSystemConfig('manutencao_global'),
        getSystemConfig('status_emergencia'),
        getSystemConfig('mensagem_emergencia')
      ])
      
      setConfigs({
        sala_situacao_ativa: sala.valor,
        manutencao_global: manutencao.valor,
        status_emergencia: emergencia.valor,
        mensagem_emergencia: String(msg.valor_raw || '')
      })
      setLoading(false)
    }
    loadConfigs()
  }, [])

  const handleToggle = async (chave: keyof typeof configs) => {
    if (typeof configs[chave] !== 'boolean') return
    const novoValor = !configs[chave]
    setSaving(true)
    
    const result = await updateSystemConfig(chave, novoValor)
    
    if (result.success) {
      setConfigs(prev => ({ ...prev, [chave]: novoValor }))
      toast.success(`Status "${chave.replace(/_/g, ' ')}" atualizado.`, {
        style: { background: '#021691', color: '#fff', border: 'none' }
      })
    } else {
      toast.error('Erro ao atualizar configuração.')
    }
    setSaving(false)
  }

  const handleUpdateMessage = async () => {
    setSaving(true)
    const result = await updateSystemConfig('mensagem_emergencia', configs.mensagem_emergencia)
    if (result.success) {
      toast.success('Nota oficial de emergência atualizada.')
    } else {
      toast.error('Erro ao atualizar mensagem.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-border">
      <RefreshCw className="animate-spin text-primary" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted">Carregando Governança...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-dark rounded-2xl flex items-center justify-center text-white">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-dark tracking-tighter uppercase italic">Configurações de Sistema</h2>
          <p className="text-xs font-bold text-muted uppercase tracking-wider">Gestão de Governança e Acesso Público</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controle Sala de Situação */}
        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${
          configs.sala_situacao_ativa ? 'bg-white border-primary/20' : 'bg-surface border-border grayscale'
        }`}>
           <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl ${configs.sala_situacao_ativa ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                 <Globe size={32} />
              </div>
              <button 
                onClick={() => handleToggle('sala_situacao_ativa')}
                disabled={saving}
                title="Alternar visibilidade da Sala de Situação"
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
                  configs.sala_situacao_ativa ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                  configs.sala_situacao_ativa ? 'translate-x-8' : 'translate-x-0'
                }`} />
              </button>
           </div>
           
           <h3 className="text-lg font-black text-dark uppercase italic tracking-tighter mb-2">Sala de Situação</h3>
           <p className="text-sm text-muted font-medium mb-6 leading-relaxed">
              Habilita ou desabilita o acesso público ao painel técnico de transparência. 
              Quando desativado, cidadãos verão uma tela de manutenção técnica.
           </p>
           
           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              configs.sala_situacao_ativa ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
           }`}>
              <Power size={12} />
              {configs.sala_situacao_ativa ? 'Acesso Público Ativo' : 'Acesso Restrito'}
           </div>
        </div>

        {/* Modo de Manutenção Global */}
        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${
          configs.manutencao_global ? 'bg-orange-50 border-orange-200' : 'bg-white border-border'
        }`}>
           <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl ${configs.manutencao_global ? 'bg-orange-100 text-orange-500' : 'bg-surface text-muted'}`}>
                 <AlertTriangle size={32} />
              </div>
              <button 
                onClick={() => handleToggle('manutencao_global')}
                disabled={saving}
                title="Alternar Modo de Manutenção Global"
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
                  configs.manutencao_global ? 'bg-orange-500' : 'bg-muted'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                  configs.manutencao_global ? 'translate-x-8' : 'translate-x-0'
                }`} />
              </button>
           </div>
           
           <h3 className="text-lg font-black text-dark uppercase italic tracking-tighter mb-2">Modo Manutenção</h3>
           <p className="text-sm text-muted font-medium mb-6 leading-relaxed">
              Bloqueia o envio de novas denuncias e o acesso às enquetes em toda a plataforma. 
              Use apenas para atualizações críticas de banco de dados.
           </p>
           
           {configs.manutencao_global && (
             <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest animate-pulse">
                <ShieldCheck size={14} />
                Sistema em Estado de Alerta
             </div>
           )}
        </div>
      </div>

      {/* PROTOCOLO DE EMERGÊNCIA (BOTÃO DE PÂNICO) */}
      <div className={`p-8 rounded-[3rem] border-4 transition-all duration-500 ${
        configs.status_emergencia ? 'bg-red-950 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'bg-white border-red-50'
      }`}>
         <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
               <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${configs.status_emergencia ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500'}`}>
                     <Power size={32} className={configs.status_emergencia ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                     <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${configs.status_emergencia ? 'text-white' : 'text-dark'}`}>
                        Protocolo de Emergência
                     </h3>
                     <p className={`text-xs font-bold uppercase tracking-widest ${configs.status_emergencia ? 'text-red-400' : 'text-red-500'}`}>
                        Kill Switch de Segurança Máxima
                     </p>
                  </div>
               </div>
               <p className={`text-sm font-medium leading-relaxed max-w-2xl ${configs.status_emergencia ? 'text-white/60' : 'text-muted'}`}>
                  Este comando suspende instantaneamente TODA a plataforma pública do Denuncia MS. 
                  Deve ser utilizado apenas em casos de comprometimento de dados, ataques cibernéticos ou ordens institucionais de urgência.
               </p>
            </div>

            <button 
              onClick={() => {
                if (window.confirm('ALERTA: Esta ação tirará a plataforma DO AR imediatamente. Confirmar desligamento de emergência?')) {
                  handleToggle('status_emergencia')
                }
              }}
              disabled={saving}
              title="BOTÃO DE PÂNICO: Desligar Plataforma"
              className={`w-full lg:w-auto px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                configs.status_emergencia 
                  ? 'bg-white text-red-600 shadow-xl' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-glow-red'
              }`}
            >
              {configs.status_emergencia ? 'REATIVAR PLATAFORMA' : 'EXECUTAR SHUTDOWN'}
            </button>
         </div>

         {/* Editor de Nota Oficial */}
         <div className="mt-8 pt-8 border-t border-red-100/10 space-y-4">
            <div className="flex items-center gap-2">
               <ShieldCheck size={16} className={configs.status_emergencia ? 'text-red-400' : 'text-red-500'} />
               <span className={`text-[10px] font-black uppercase tracking-widest ${configs.status_emergencia ? 'text-white/40' : 'text-muted'}`}>
                  Nota Oficial de Contingência
               </span>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
               <textarea 
                  value={configs.mensagem_emergencia}
                  onChange={(e) => setConfigs(prev => ({ ...prev, mensagem_emergencia: e.target.value }))}
                  placeholder="Descreva o motivo institucional da suspensão..."
                  className={`flex-1 min-h-[100px] p-4 rounded-2xl text-xs font-bold border outline-none transition-all ${
                    configs.status_emergencia 
                      ? 'bg-red-900/30 border-red-800 text-white placeholder:text-red-700 focus:border-red-500' 
                      : 'bg-surface border-border text-dark focus:border-red-200'
                  }`}
               />
               <button 
                 onClick={handleUpdateMessage}
                 disabled={saving}
                 className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all h-fit ${
                   configs.status_emergencia
                     ? 'bg-red-500 text-white hover:bg-red-600'
                     : 'bg-dark text-white hover:bg-black'
                 }`}
               >
                 Atualizar Nota
               </button>
            </div>
         </div>
      </div>

      {/* Info Card */}
      <div className="bg-dark text-white p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 border border-white/5 shadow-2xl">
         <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-secondary">
            <Info size={32} />
         </div>
         <div className="flex-1 space-y-1 text-center md:text-left">
            <h4 className="text-sm font-black uppercase tracking-widest italic">Auditoria de Configurações</h4>
            <p className="text-white/50 text-xs font-medium leading-relaxed">
              Todas as alterações nesta seção são registradas no log de auditoria com o carimbo de tempo e a identidade do administrador responsável, conforme as diretrizes de governança da plataforma.
            </p>
         </div>
      </div>
    </div>
  )
}
