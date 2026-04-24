'use client'

import React, { useState } from 'react'
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

// Mock de solicitações de privacidade
const MOCK_SOLICITACOES = [
  {
    id: '1',
    protocolo: 'MS-2026-0422-001',
    data: '22/04/2026',
    tipo: 'Exclusão de Dados Pessoais',
    status: 'pendente',
    justificativa: 'Não desejo mais que meus dados pessoais fiquem vinculados a este relato.'
  },
  {
    id: '2',
    protocolo: 'MS-2026-0415-089',
    data: '15/04/2026',
    tipo: 'Acesso aos Dados',
    status: 'concluido',
    justificativa: 'Solicitação de cópia integral dos dados armazenados.'
  }
]

export default function AdminPrivacidadePage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAnonimizar = async (id: string, protocolo: string) => {
    if (!confirm(`Confirmar anonimização irreversível dos dados pessoais da denuncia ${protocolo}? Esta ação cumpre a LGPD e não pode ser desfeita.`)) {
      return
    }

    setLoading(id)
    // Simulação de delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success(`Dados pessoais do protocolo ${protocolo} foram anonimizados com sucesso.`)
    setLoading(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark tracking-tighter uppercase italic flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Gestão de Privacidade & LGPD
          </h1>
          <p className="text-sm text-muted font-medium">Processamento de direitos dos titulares (LGPD / LAI)</p>
        </div>
      </header>

      {/* Stats LGPD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Solicitações Pendentes</p>
           <div className="text-3xl font-black text-dark italic">01</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Total Processado (30d)</p>
           <div className="text-3xl font-black text-secondary italic">12</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Tempo Médio Resposta</p>
           <div className="text-3xl font-black text-primary italic">4.2h</div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-black text-sm uppercase tracking-widest text-dark">Pedidos de Titulares</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input className="input h-10 pl-10 text-xs w-full md:w-64" placeholder="Buscar protocolo..." />
            </div>
            <button className="btn-outline h-10 px-4 gap-2 text-xs">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {MOCK_SOLICITACOES.map((req) => (
            <div key={req.id} className="p-6 hover:bg-surface transition-colors group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-dark tracking-tighter">{req.protocolo}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      req.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-muted uppercase tracking-tight">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {req.data}</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> {req.tipo}</span>
                  </div>
                  <p className="text-sm text-dark/70 italic max-w-2xl leading-relaxed">
                    &quot;{req.justificativa}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.status === 'pendente' ? (
                    <>
                      <button 
                        onClick={() => handleAnonimizar(req.id, req.protocolo)}
                        disabled={loading === req.id}
                        className="btn-primary bg-primary hover:bg-primary-dark h-11 px-6 gap-2 text-xs shadow-glow-cyan"
                      >
                        {loading === req.id ? (
                          'Processando...'
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Executar Anonimização
                          </>
                        )}
                      </button>
                      <button className="btn-outline border-red-200 text-red-500 hover:bg-red-50 text-xs h-11 px-4">
                        Rejeitar
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest">
                      <CheckCircle2 size={16} />
                      Concluído em 16/04
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerta de Auditoria */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
        <AlertTriangle className="text-amber-600 shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest">Aviso de Auditoria</h4>
          <p className="text-amber-800/80 text-sm font-medium leading-relaxed">
            Todas as ações de exclusão ou anonimização são registradas permanentemente nos logs de auditoria do sistema, 
            contendo o ID do administrador responsável e o timestamp da operação, para fins de fiscalização da ANPD.
          </p>
        </div>
      </div>
    </div>
  )
}
