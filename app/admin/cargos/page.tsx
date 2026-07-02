export const dynamic = 'force-dynamic'

import React from 'react'
import { CargosManager } from '@/components/admin/cargos-manager'
import { listCargosPublicos } from '@/lib/actions/admin-cargos'

export const metadata = {
  title: 'Cargos Públicos',
}

export default async function CargosPage() {
  const result = await listCargosPublicos()

  if (!result.success) {
    return <div className="p-8 text-error">Erro ao carregar cargos: {result.error}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Cargos Públicos</h1>
          <p className="text-muted text-sm">
            Cadastre cargos e funções para auxiliar o preenchimento de denúncias anônimas.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-muted uppercase">Total de Cargos</p>
          <p className="text-xl font-black text-primary">{result.data?.length || 0}</p>
        </div>
      </div>

      <CargosManager initialCargos={result.data || []} />
    </div>
  )
}
