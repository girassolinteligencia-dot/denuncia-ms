export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { ProtocoloConfigurator } from '@/components/admin/config/protocolo-configurator'

export const metadata = {
  title: 'Padrão de Protocolo',
}

export default async function ProtocoloPage() {
  const supabase = createAdminClient()
  
  const { data: config, error } = await supabase
    .from('config_protocolo')
    .select('*')
    .single()

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar configuração de protocolo: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
          Módulo 0 — Core Admin Engine
        </div>
        <h1 className="text-2xl font-bold text-dark">Numeração de Protocolo</h1>
        <p className="text-muted text-sm text-balance max-w-2xl">
          Personalize o formato dos protocolos gerados pelo sistema. 
          O gerenciamento da numeração é atômico no banco de dados para evitar conflitos.
        </p>
      </div>

      <ProtocoloConfigurator initialConfig={config} />
    </div>
  )
}
