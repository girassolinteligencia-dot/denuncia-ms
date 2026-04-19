'use client'

import React from 'react'
import { 
  Mail, 
  Zap, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export const IntegrationsHealthTable: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-card shadow-card-md border border-border overflow-hidden animate-fade-in">
      <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          Status das Entregas (Últimas 24h)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface/50 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Status Atual</th>
              <th className="px-6 py-4">Sucesso</th>
              <th className="px-6 py-4">Falhas</th>
              <th className="px-6 py-4">Último Disparo</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-surface/30 transition-colors group">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-dark">{item.categoria_nome}</p>
                    <p className="text-[10px] text-muted font-mono">{item.categoria_slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {item.tem_email && <Mail size={16} className="text-primary" title="E-mail" />}
                    {item.tem_webhook && <Zap size={16} className="text-secondary" title="Webhook" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${item.saudavel ? 'text-success' : 'text-error'}`}>
                    {item.saudavel ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {item.saudavel ? 'Operacional' : 'Com Falhas'}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-dark text-sm">{item.sucessos}</td>
                <td className="px-6 py-4 font-bold text-error text-sm">{item.falhas}</td>
                <td className="px-6 py-4 text-xs text-muted font-medium">
                  {item.ultimo_disparo ? new Date(item.ultimo_disparo).toLocaleString() : 'Sem registros'}
                </td>
                <td className="px-6 py-4">
                   <Link 
                    href={`/admin/categorias/${item.categoria_id}/integracao`}
                    className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all inline-flex"
                   >
                     <ChevronRight size={20} />
                   </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
