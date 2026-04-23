'use client'

import React, { useState } from 'react'
import { 
  History, 
  ShieldAlert, 
  Activity,
  Lock
} from 'lucide-react'
import { AuditTable } from './audit-table'
import { IntegrationsHealthTable } from './integrations-health-table'

export function UnifiedSegurancaTabs({ 
  initialLogs, 
  initialHealth 
}: { 
  initialLogs: any[], 
  initialHealth: any 
}) {
  const [activeTab, setActiveTab] = useState('logs')

  const TABS = [
    { id: 'logs', label: 'Logs de Auditoria', icon: History },
    { id: 'saude', label: 'Saúde do Sistema', icon: Activity },
    { id: 'privacidade', label: 'Auditoria LGPD', icon: ShieldAlert },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id 
                ? 'text-primary' 
                : 'text-muted hover:text-dark hover:bg-surface'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-glow-cyan"></div>
            )}
          </button>
        ))}
      </div>

      <div className="py-4">
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Histórico de Operações</h2>
              <p className="text-sm text-muted font-medium">Registro detalhado de todas as ações realizadas por administradores na plataforma.</p>
            </div>
            <AuditTable logs={initialLogs} />
          </div>
        )}

        {activeTab === 'saude' && (
          <div className="space-y-6 animate-slide-up">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Status da Infraestrutura</h2>
              <p className="text-sm text-muted font-medium">Monitoramento em tempo real das conexões com Supabase, Edge Functions e serviços de e-mail.</p>
            </div>
            <IntegrationsHealthTable data={[initialHealth]} />
          </div>
        )}

        {activeTab === 'privacidade' && (
          <div className="space-y-6 animate-slide-up">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Conformidade LGPD</h2>
              <p className="text-sm text-muted font-medium">Relatórios de anonimização e acessos a dados sensíveis para fins de fiscalização.</p>
            </div>
            <div className="p-20 bg-dark rounded-[3rem] text-center space-y-4">
               <Lock size={48} className="mx-auto text-secondary shadow-glow-green" />
               <p className="text-xs font-black text-white uppercase tracking-widest">Motor de Auditoria Criptografado</p>
               <p className="text-[10px] text-white/40 max-w-xs mx-auto font-medium">Todos os logs nesta seção são assinados digitalmente para garantir imutabilidade.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
