import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { CamposFormularioTable } from '@/components/admin/config/campos-formulario-table'

export const metadata = {
  title: 'Campos do Formulário',
}

export default async function CamposFormularioPage() {
  const supabase = createAdminClient()
  
  // Busca a configuração atual dos campos
  const { data: campos, error } = await supabase
    .from('config_campos_formulario')
    .select('*')
    .order('ordem', { ascending: true })

  if (error) {
    return <div className="text-error">Erro ao carregar configurações de campos: {error.message}</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
            Módulo 0 — Core Admin Engine
          </div>
          <h1 className="text-2xl font-bold text-dark">Campos do Formulário</h1>
          <p className="text-muted text-sm">
            Defina quais informações o cidadão deve preencher no formulário de denuncia.
          </p>
        </div>
      </div>

      <CamposFormularioTable initialCampos={campos || []} />
    </div>
  )
}
