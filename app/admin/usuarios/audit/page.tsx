'use client'

import React, { useEffect, useState } from 'react'
import { 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Search,
  Ban
} from 'lucide-react'
import { getRankingAuditUsuarios, banirUsuario } from '@/lib/actions/admin-denuncias'
import { toast } from 'sonner'

export default function UserAuditPage() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadRanking()
  }, [])

  async function loadRanking() {
    setLoading(true)
    const res = await getRankingAuditUsuarios()
    if (res.success && res.ranking) {
      setRanking(res.ranking)
    }
    setLoading(false)
  }

  async function handleBan(hash: string) {
    const motivo = prompt('Informe o motivo do banimento para registro de auditoria:')
    if (!motivo) return

    const res = await banirUsuario(hash, motivo)
    if (res.success) {
      toast.success('Usuário banido com sucesso. Ele não poderá mais enviar denúncias identificadas.')
      loadRanking()
    } else {
      toast.error('Erro ao banir usuário.')
    }
  }

  const filteredRanking = ranking.filter(u => u.hash.includes(filter))

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark tracking-tighter uppercase italic flex items-center gap-2">
            <ShieldAlert className="text-primary" />
            Auditoria de Incidência
          </h1>
          <p className="text-sm text-muted font-medium">Ranking de credibilidade e análise de denúncias recorrentes.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            className="input pl-10 h-10 w-full md:w-64 text-xs font-bold" 
            placeholder="Filtrar por hash..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </header>

      {/* Grid de Alerta */}
      <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex gap-4 items-start">
        <AlertTriangle className="text-red-500 shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-red-900 uppercase tracking-widest">Alerta de Integridade</h4>
          <p className="text-sm text-red-800/80 font-medium leading-relaxed">
            Usuários com baixa credibilidade (abaixo de 30%) e alta recorrência devem ser auditados individualmente. 
            O arquivamento sistemático de denúncias de um mesmo originador é um forte indício de denúncias falsas ou má-fé.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface text-[10px] font-black text-muted uppercase tracking-[0.2em] border-b border-border">
                <th className="px-6 py-5">Assinatura Digital (Hash)</th>
                <th className="px-6 py-5 text-center">Total</th>
                <th className="px-6 py-5">Status Breakdown</th>
                <th className="px-6 py-5 text-center">Credibilidade</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-xs font-bold text-muted uppercase">Carregando inteligência de dados...</td></tr>
              ) : filteredRanking.map((user) => (
                <tr key={user.hash} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-bold text-dark">{user.hash.substring(0, 16)}...</span>
                      <span className="text-[9px] text-muted font-black uppercase tracking-tighter mt-1">Titular Identificado</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-black text-dark tracking-tighter">{user.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        <CheckCircle2 size={10} /> {user.resolvidas}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        <XCircle size={10} /> {user.arquivadas}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        <TrendingDown size={10} /> {user.pendentes}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`text-sm font-black italic ${
                        user.credibilidade > 70 ? 'text-green-500' : user.credibilidade > 40 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {user.credibilidade}%
                      </div>
                      <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${user.credibilidade > 70 ? 'bg-green-500' : user.credibilidade > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${user.credibilidade}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleBan(user.hash)}
                      className="btn-outline border-red-200 text-red-500 hover:bg-red-50 h-9 px-3 gap-2 text-[10px] font-black uppercase"
                    >
                      <Ban size={14} />
                      Banir Origem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
