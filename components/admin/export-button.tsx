'use client'

import React from 'react'
import { Download, FileText } from 'lucide-react'
import { generateDenunciaPDF } from '@/lib/utils/pdf-generator'
import type { Denuncia } from '@/types'

export const ExportButton: React.FC<{ denuncia: Denuncia }> = ({ denuncia }) => {
  const handleExport = () => {
    const data = {
      protocolo: denuncia.protocolo,
      titulo: denuncia.titulo,
      categoria: denuncia.categoria?.label || 'Geral',
      descricao: denuncia.descricao_original,
      local: denuncia.local || 'Não informado',
      data_ocorrido: denuncia.data_ocorrido,
      criado_em: denuncia.criado_em,
      status: denuncia.status,
      anonima: denuncia.anonima,
      nome: denuncia.denunciante_nome,
      email: denuncia.denunciante_email,
      telefone: denuncia.denunciante_telefone
    }

    generateDenunciaPDF(data)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-white text-dark border border-border rounded-lg text-xs font-black uppercase tracking-widest hover:bg-surface transition-all shadow-none hover:shadow-card"
    >
      <FileText size={16} className="text-primary" />
      Gerar Relatório (PDF)
      <Download size={14} className="ml-2 opacity-50" />
    </button>
  )
}
