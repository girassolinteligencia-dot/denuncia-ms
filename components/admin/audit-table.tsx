'use client'

import React from 'react'
import { Search, Filter, ArrowUpRight } from 'lucide-react'
import type { LogAuditoria } from '@/types'

export const AuditTable: React.FC<{ logs: LogAuditoria[] }> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-10 h-10" placeholder="Filtrar por ação ou tabela..." />
        </div>
        <button className="btn-outline btn-sm gap-2">
          <Filter size={16} />
          Filtros Avançados
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Tabela</th>
              <th className="px-6 py-4">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted text-sm italic">
                  Nenhum registro de auditoria encontrado.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-dark">
                    {new Date(log.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-surface rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                         {log.usuario?.nome.charAt(0) || 'U'}
                       </div>
                       <span className="text-sm font-semibold text-dark">{log.usuario?.nome || 'Usuário do Sistema'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.acao.startsWith('INSERT') ? 'bg-green-100 text-green-700' :
                      log.acao.startsWith('UPDATE') ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.acao}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-muted font-mono">{log.tabela}</code>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:underline flex items-center gap-1 text-[11px] font-bold">
                      VER DIFF
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
