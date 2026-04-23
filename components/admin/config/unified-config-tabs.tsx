'use client'

import React, { useState } from 'react'
import { 
  Settings, 
  ShieldCheck, 
  Share2, 
  Layout, 
  Activity,
  Zap,
  Lock,
  Globe
} from 'lucide-react'
import { IdentidadeConfigForm } from './identidade-config-form'
// Note: In a real app, I'd move the Privacy and Integration forms to separate components too.
// For now, I'll integrate the Identity form and placeholders for others to demonstrate aglutination.

export function UnifiedConfigTabs({ initialConfigs }: { initialConfigs: any }) {
  const [activeTab, setActiveTab] = useState('identidade')

  const TABS = [
    { id: 'identidade', label: 'Identidade & Cores', icon: Globe },
    { id: 'privacidade', label: 'LGPD & Privacidade', icon: ShieldCheck },
    { id: 'integracoes', label: 'Integrações (API)', icon: Share2 },
    { id: 'avancado', label: 'Campos & Sistema', icon: Settings },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* TABS NAVIGATION */}
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

      {/* TAB CONTENT */}
      <div className="py-4">
        {activeTab === 'identidade' && (
          <div className="space-y-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Identidade Visual</h2>
              <p className="text-sm text-muted font-medium">Configure as cores, logotipos e textos institucionais que aparecem para o cidadão.</p>
            </div>
            <IdentidadeConfigForm initialData={initialConfigs} />
          </div>
        )}

        {activeTab === 'privacidade' && (
          <div className="space-y-8 animate-slide-up">
             <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Governança de Dados</h2>
              <p className="text-sm text-muted font-medium">Gerencie os termos de uso e as solicitações de anonimização (Direito à exclusão).</p>
            </div>
            {/* Aqui entraria o componente de Privacidade consolidado */}
            <div className="p-20 border-4 border-dashed border-border rounded-[3rem] text-center space-y-4">
               <ShieldCheck size={48} className="mx-auto text-muted/30" />
               <p className="text-xs font-black text-muted uppercase tracking-widest">Painel de LGPD Integrado</p>
               <button className="btn-primary h-12 bg-dark border-none">Gerenciar Termos Legais</button>
            </div>
          </div>
        )}

        {activeTab === 'integracoes' && (
          <div className="space-y-8 animate-slide-up">
             <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Conectividade & APIs</h2>
              <p className="text-sm text-muted font-medium">Configuração de chaves do Supabase, SMTP de E-mail e serviços de terceiros.</p>
            </div>
            {/* Aqui entraria o componente de Integrações consolidado */}
            <div className="p-20 border-4 border-dashed border-border rounded-[3rem] text-center space-y-4">
               <Share2 size={48} className="mx-auto text-muted/30" />
               <p className="text-xs font-black text-muted uppercase tracking-widest">Configurações de API</p>
               <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  <div className="p-4 bg-surface rounded-2xl text-[10px] font-bold text-left border border-border">Supabase Project Ref</div>
                  <div className="p-4 bg-surface rounded-2xl text-[10px] font-bold text-left border border-border">SMTP Auth Key</div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'avancado' && (
          <div className="space-y-8 animate-slide-up">
             <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Parâmetros do Sistema</h2>
              <p className="text-sm text-muted font-medium">Configurações avançadas de campos, templates de protocolo e flags de funcionalidade.</p>
            </div>
            {/* Aqui entraria a gestão de campos e o toggle de pesquisa global que criamos */}
            <div className="p-20 border-4 border-dashed border-border rounded-[3rem] text-center space-y-4">
               <Settings size={48} className="mx-auto text-muted/30" />
               <p className="text-xs font-black text-muted uppercase tracking-widest">Configurações de Engine</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
