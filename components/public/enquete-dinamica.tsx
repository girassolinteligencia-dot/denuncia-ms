'use client'

import React, { useState } from 'react'
import { CheckCircle2, Loader2, BarChart3, Lock, Timer, Target, Info } from 'lucide-react'
import { toast } from 'sonner'
import { votarEnquete } from '@/lib/actions/enquetes'
import type { Enquete } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EnqueteDinamica({ initialData }: { initialData: Enquete | null }) {
  const [data, setData] = useState<Enquete | null>(initialData)
  const [votando, setVotando] = useState(false)
  const [votedId, setVotedId] = useState<string | null>(null)

  if (!data) return null

  const handleVoto = async (opcaoId: string) => {
    if (data.jaVotou || votando || data.status_atual !== 'ativa') return
    
    setVotando(true)
    setVotedId(opcaoId)
    const res = await votarEnquete(data.id, opcaoId)
    setVotando(false)

    if (res.success) {
      toast.success('Voto registrado com sucesso!')
      
      const novasOpcoes = (data.opcoes || []).map(opt => {
        const novosVotos = opt.id === opcaoId ? (opt.votos || 0) + 1 : (opt.votos || 0)
        const novoTotal = (data.totalVotos || 0) + 1
        return {
          ...opt,
          votos: novosVotos,
          percentual: Math.round((novosVotos / novoTotal) * 100)
        }
      })
      setData({ 
        ...data, 
        opcoes: novasOpcoes, 
        totalVotos: (data.totalVotos || 0) + 1, 
        jaVotou: true 
      })
    } else {
      toast.error(res.error || 'Erro ao votar.')
    }
  }

  const isEncerrada = data.status_atual !== 'ativa'
  const exibeResultados = data.jaVotou || isEncerrada

  return (
    <div className="bg-white rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden animate-fade-in max-w-2xl mx-auto w-full">
      {/* Header com Status */}
      <div className={`p-6 text-white flex items-center justify-between ${isEncerrada ? 'bg-dark' : 'bg-primary'}`}>
        <div className="flex items-center gap-3">
          <BarChart3 size={22} className="text-secondary" />
          <div>
            <h3 className="font-black uppercase tracking-widest italic text-xs">Pesquisa de Opinião</h3>
            <p className="text-[10px] font-bold text-white/50 uppercase">Módulo de Engajamento Público</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEncerrada ? (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-accent">
              <Lock size={12} />
              Enquete Encerrada
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_#FFD700]"></span>
              Ao Vivo
            </div>
          )}
        </div>
      </div>

      <div className="p-8 sm:p-12 space-y-8">
        {/* Título e Contexto */}
        <div className="space-y-4 text-center">
          <h4 className="text-2xl sm:text-3xl font-black text-dark leading-[1.1] italic uppercase tracking-tighter">
            {data.titulo}
          </h4>
          {data.descricao && (
            <p className="text-sm text-muted font-medium max-w-lg mx-auto">
              {data.descricao}
            </p>
          )}
        </div>

        {/* Dashboard / Opções */}
        <div className="space-y-4">
          {(data.opcoes || []).map((opt) => (
            <div key={opt.id} className="relative">
              {exibeResultados ? (
                // DASHBOARD DE RESULTADOS
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[11px] font-black text-dark uppercase tracking-tight">{opt.texto}</span>
                    <span className="text-sm font-black text-primary italic">{opt.percentual}%</span>
                  </div>
                  <div className="h-6 bg-surface rounded-xl overflow-hidden border border-border/30 p-1">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-lg shadow-sm ${
                        isEncerrada ? 'bg-dark/40' : 'bg-gradient-to-r from-primary to-secondary'
                      }`}
                      style={{ width: `${opt.percentual}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                // INTERFACE DE VOTAÇÃO
                <button
                  onClick={() => handleVoto(opt.id)}
                  disabled={votando}
                  className="w-full text-left p-6 rounded-2xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-between"
                >
                  <span className="font-black text-dark text-sm sm:text-base uppercase tracking-tight">{opt.texto}</span>
                  {votedId === opt.id && votando ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center transition-all">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Estatísticas e Características (Footer do Card) */}
        <div className="pt-8 border-t border-border/60">
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted">
                  <Target size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Participação</span>
                </div>
                <p className="text-sm font-black text-dark italic">{data.totalVotos} Votos</p>
              </div>

              {data.data_expiracao && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Timer size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {isEncerrada ? 'Encerrada em' : 'Prazo Final'}
                    </span>
                  </div>
                  <p className="text-sm font-black text-dark italic">
                    {format(new Date(data.data_expiracao), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}

              {data.limite_votos && (
                <div className="space-y-1 hidden sm:block">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Info size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Meta de Coleta</span>
                  </div>
                  <p className="text-sm font-black text-dark italic">{data.limite_votos} Votos Max.</p>
                </div>
              )}
           </div>

           {/* Mensagem de Encerramento */}
           {isEncerrada && (
             <div className="mt-8 p-4 bg-dark/5 rounded-2xl border border-dark/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center flex-shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-dark uppercase tracking-widest">Relatório de Encerramento</p>
                  <p className="text-xs text-muted font-medium">
                    {data.status_atual === 'expirada' ? 'Esta consulta foi encerrada automaticamente ao atingir o prazo estabelecido.' : 
                     data.status_atual === 'limite_atingido' ? 'A meta de participação foi atingida e a coleta de dados concluída.' :
                     'Enquete encerrada por decisão da administração da plataforma.'}
                  </p>
                </div>
             </div>
           )}

           {data.jaVotou && !isEncerrada && (
             <div className="mt-8 flex items-center justify-center gap-2 text-primary bg-primary/5 py-4 rounded-2xl border border-primary/20">
                <CheckCircle2 size={16} />
                <span className="text-xs font-black uppercase tracking-widest italic">Obrigado pela sua participação!</span>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
