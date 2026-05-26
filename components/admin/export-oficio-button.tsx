'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getDenunciasParaOficio } from '@/lib/actions/admin-oficios'
import { gerarOficioLote } from '@/lib/utils/oficio-generator'

const LIMITE_LOTE = 50

interface Props {
  selectedIds: string[]
}

export function ExportOficioButton({ selectedIds }: Props) {
  const [loading, setLoading] = useState(false)

  const handleExportar = async () => {
    if (selectedIds.length === 0) return

    if (selectedIds.length > LIMITE_LOTE) {
      toast.error(`Selecione no máximo ${LIMITE_LOTE} denúncias por exportação.`)
      return
    }

    setLoading(true)
    try {
      const res = await getDenunciasParaOficio(selectedIds)

      if (!res.success || !res.data) {
        toast.error('Erro ao buscar dados: ' + res.error)
        return
      }

      gerarOficioLote(res.data)
      toast.success(`${res.data.length} ofício(s) gerado(s) com sucesso!`)
    } catch (err: any) {
      toast.error('Erro inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExportar}
      disabled={loading || selectedIds.length === 0}
      className="text-[9px] font-bold uppercase bg-blue-50 hover:bg-azul border border-blue-200 hover:border-azul text-blue-700 hover:text-white transition-all px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
      Gerar Ofício{selectedIds.length > 1 ? 's' : ''} ({selectedIds.length})
    </button>
  )
}
