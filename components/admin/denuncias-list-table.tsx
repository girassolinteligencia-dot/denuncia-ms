'use client'

import React, { useState } from 'react'
import { 
  Clock, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import type { Denuncia, StatusDenuncia } from '@/types'

const STATUS_STYLE: Record<StatusDenuncia, { label: string, color: string, icon: any }> = {
  recebida: { label: 'Recebida', color: 'bg-primary-50 text-primary border-primary/20', icon: Clock },
  em_analise: { label: 'Em Análise', color: 'bg-blue-50 text-info border-blue-200', icon: Search },
  encaminhada: { label: 'Encaminhada', color: 'bg-secondary-50 text-secondary border-secondary/20', icon: Send },
  resolvida: { label: 'Resolvida', color: 'bg-green-50 text-success border-green-200', icon: CheckCircle2 },
  arquivada: { label: 'Arquivada', color: 'bg-surface text-muted border-border', icon: AlertTriangle },
}

export const DenunciasListTable: React.FC<{ initialDenuncias: any[] }> = ({ initialDenuncias }) => {
  const [denuncias] = useState(initialDenuncias)

  return (
    <div className="bg-white rounded-card shadow-card-lg border border-border overflow-hidden animate-slide-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface text-[10px] font-black text-muted uppercase tracking-widest border-b border-border">
              <th className="px-6 py-5">Protocolo</th>
              <th className="px-6 py-5">Categoria / Título</th>
              <th className="px-6 py-5">Registrado em</th>
              <th className="px-6 py-5">Situação Atual</th>
              <th className="px-6 py-5">Tipo</th>
              <th className="px-6 py-5 text-right w-20">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {denuncias.map((denuncia) => {
              const status = STATUS_STYLE[denuncia.status as StatusDenuncia] || STATUS_STYLE.recebida
              const Icon = status.icon

              return (
                <tr key={denuncia.id} className="hover:bg-primary-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-dark tracking-tight uppercase group-hover:text-primary transition-colors">
                      {denuncia.protocolo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                          {denuncia.categorias?.emoji} {denuncia.categorias?.label}
                       </span>
                       <span className="text-sm font-bold text-dark truncate max-w-xs">{denuncia.titulo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-muted">
                      {new Date(denuncia.criado_em).toLocaleDateString()}
                      <span className="text-[10px] ml-1 opacity-60">{new Date(denuncia.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${status.color}`}>
                       <Icon size={12} />
                       {status.label}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${denuncia.anonima ? 'bg-surface text-muted border border-border' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                       {denuncia.anonima ? 'ANÔNIMA' : 'IDENTIFICADA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/denuncias/${denuncia.id}`}
                      className="p-2 text-muted hover:text-dark hover:bg-white border border-transparent hover:border-border rounded-lg transition-all inline-block shadow-none group-hover:shadow-card group-hover:bg-white"
                      title="Ver Detalhes"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {denuncias.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto text-muted">
                <Search size={32} />
             </div>
             <p className="text-muted font-medium">Nenhuma denúncia encontrada.</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-surface border-t border-border flex items-center justify-between text-[10px] font-black text-muted uppercase tracking-widest">
         <span>Total de ocorrências: {denuncias.length}</span>
         <div className="flex items-center gap-4">
            <button className="opacity-50 hover:opacity-100 transition-opacity">Anterior</button>
            <span className="text-dark bg-white px-2 py-1 rounded border border-border">Página 1</span>
            <button className="opacity-50 hover:opacity-100 transition-opacity">Próximo</button>
         </div>
      </div>
    </div>
  )
}
