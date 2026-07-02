export const dynamic = 'force-dynamic'

import React from 'react'
import { LocalidadesManager } from '@/components/admin/localidades-manager'
import { listLocalidadesPublicas } from '@/lib/actions/admin-localidades'

export const metadata = {
  title: 'Localidades Públicas',
}

export default async function LocalidadesPage() {
  const result = await listLocalidadesPublicas()

  if (!result.success) {
    return <div className="p-8 text-error">Erro ao carregar localidades: {result.error}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Localidades Públicas</h1>
          <p className="text-muted text-sm">
            Cadastre órgãos, unidades e localidades que poderão ser selecionados no formulário de denúncia.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-muted uppercase">Total de Localidades</p>
          <p className="text-xl font-black text-primary">{result.data?.length || 0}</p>
        </div>
      </div>

      <LocalidadesManager initialLocalidades={result.data || []} />
    </div>
  )
}
