import React from 'react'
import { getConfigsByPrefix } from '@/lib/config'
import { IdentidadeConfigForm } from '@/components/admin/config/identidade-config-form'

export const metadata = {
  title: 'Configurações Gerais',
}

export default async function ConfiguracoesGeraisPage() {
  // Busca todas as configurações de identidade e cores do banco
  // Como é Server Component, os fallbacks são aplicados aqui ou no helper getConfig
  let initialConfigs = {}
  
  try {
    const identidades = await getConfigsByPrefix('identidade')
    const cores = await getConfigsByPrefix('cores')
    initialConfigs = { ...identidades, ...cores }
  } catch (err) {
    console.error('Erro ao buscar configurações iniciais:', err)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
          Módulo 0 — Core Admin Engine
        </div>
        <h1 className="text-2xl font-bold text-dark">Configurações Gerais</h1>
        <p className="text-muted text-sm text-balance max-w-2xl">
          Gerencie a identidade visual, dados institucionais e paleta de cores da plataforma. 
          Nenhuma alteração aqui exige redeploy do sistema.
        </p>
      </div>

      <IdentidadeConfigForm initialData={initialConfigs} />
    </div>
  )
}
