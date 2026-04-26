export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { TemplatesConfigEditor } from '@/components/admin/config/templates-config-editor'

export const metadata = {
  title: 'Templates de Documentos',
}

export default async function TemplatesPage() {
  const supabase = createAdminClient()
  
  const { data: templates, error } = await supabase
    .from('config_templates')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar templates: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
          Módulo 0 — Core Admin Engine
        </div>
        <h1 className="text-2xl font-bold text-dark">Templates de Documentos e E-mails</h1>
        <p className="text-muted text-sm text-balance max-w-2xl">
          Personalize o cabeçalho e rodapé dos documentos PDF, além dos e-mails enviados aos órgãos e cidadãos. 
          Use as variáveis dinâmicas ao lado para preencher os dados automaticamente.
        </p>
      </div>

      <TemplatesConfigEditor initialTemplates={templates || []} />
    </div>
  )
}
