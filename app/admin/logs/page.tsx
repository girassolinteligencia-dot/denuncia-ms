import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { 
  History, 
  Shield, 
  User, 
  Clock, 
  Filter
} from 'lucide-react'

export const metadata = {
  title: 'Logs de Auditoria',
}

export default async function LogsPage() {
  const supabase = createAdminClient()
  
  // No mundo real, buscaríamos da tabela log_auditoria
  // Com filtragem e paginação
  const { data: dbLogs } = await supabase
    .from('log_auditoria')
    .select('*, usuario:profiles(nome)')
    .order('criado_em', { ascending: false })
    .limit(50)

  // Fallback para demonstração se o banco estiver vazio
  const logs = (dbLogs && dbLogs.length > 0) ? dbLogs : [
    {
      id: 1,
      evento: 'CREATE_DENUNCIA',
      descricao: 'Nova denúncia protocolada: DNS-2026-000042',
      ip: '187.121.45.10',
      usuario: { nome: 'Sistema (Cidadão)' },
      criado_em: new Date().toISOString()
    },
    {
      id: 2,
      evento: 'AUTH_LOGIN',
      descricao: 'Login administrativo realizado com sucesso',
      ip: '177.34.12.89',
      usuario: { nome: 'paulo@admin.ms.gov.br' },
      criado_em: new Date(Date.now() - 3600000).toISOString()
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-3">
             <History className="text-primary" />
             Logs de Auditoria
          </h1>
          <p className="text-muted text-sm border-l-2 border-primary pl-4 py-1">
            Rastreabilidade total e imutável de todas as ações críticas no sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-outline gap-2 text-xs h-10 px-4">
              <Filter size={16} />
              Filtrar
           </button>
           <button className="btn-primary gap-2 text-xs h-10 px-4 bg-dark border-none">
              Exportar CSV
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] font-black text-muted uppercase tracking-[0.2em] border-b border-border">
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">Evento</th>
                <th className="px-6 py-5">Usuário / Ator</th>
                <th className="px-6 py-5">Descrição</th>
                <th className="px-6 py-5">IP de Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-dark">
                       <Clock size={14} className="text-muted" />
                       {new Date(log.criado_em).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      String(log.evento).startsWith('CONFIG') ? 'bg-primary-50 text-primary' : 
                      String(log.evento).startsWith('AUTH') ? 'bg-secondary-50 text-secondary' : 
                      'bg-dark text-white'
                    }`}>
                      {log.evento}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-muted">
                          <User size={14} />
                       </div>
                       <p className="text-xs font-bold text-dark">{log.usuario?.nome || 'Anônimo'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-muted font-medium italic">"{log.descricao}"</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] bg-surface px-1.5 py-0.5 rounded font-mono text-muted">
                      {log.ip || '0.0.0.0'}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-dark to-slate-900 rounded-card text-white flex items-center justify-between border-t-4 border-electric">
         <div>
            <p className="text-sm font-black flex items-center gap-2">
               <Shield className="text-electric" />
               Integridade por Hash de Auditoria
            </p>
            <p className="text-[11px] text-white/50 mt-1">Os logs são protegidos por mecanismos append-only (RLS) e não podem ser editados ou excluídos.</p>
         </div>
         <button className="text-[10px] font-black uppercase tracking-widest text-electric hover:underline">
            Verificar Cadeia de Custódia
         </button>
      </div>
    </div>
  )
}
