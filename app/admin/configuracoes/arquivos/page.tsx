export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { TiposArquivoTable } from '@/components/admin/config/tipos-arquivo-table'

export const metadata = {
  title: 'Tipos de Arquivo',
}

export default async function TiposArquivoPage() {
  const supabase = createAdminClient()
  
  const { data: tipos, error } = await supabase
    .from('config_tipos_arquivo')
    .select('*')
    .order('tipo', { ascending: true })

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar tipos de arquivo: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
          Módulo 0 — Core Admin Engine
        </div>
        <h1 className="text-2xl font-bold text-dark">Tipos de Arquivo Permitidos</h1>
        <p className="text-muted text-sm text-balance max-w-2xl">
          Configure quais tipos de mídia o cidadão pode anexar à denuncia. 
          As limitações de tamanho e quantidade ajudam a controlar os custos de armazenamento no Supabase Storage.
        </p>
      </div>

      <TiposArquivoTable initialTipos={tipos || []} />
    </div>
  )
}
