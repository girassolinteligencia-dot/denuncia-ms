'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, BarChart3, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { votarEnquete } from '@/lib/actions/enquetes'

interface Opcao {
  id: string
  texto: string
  votos: number
  percentual: number
}

interface EnqueteData {
  id: string
  titulo: string
  descricao: string
  opcoes: Opcao[]
  totalVotos: number
  jaVotou: boolean
}

export function EnqueteDinamica({ initialData }: { initialData: EnqueteData | null }) {
  const [data, setData] = useState<EnqueteData | null>(initialData)
  const [votando, setVotando] = useState(false)
  const [votedId, setVotedId] = useState<string | null>(null)

  if (!data) return null

  const handleVoto = async (opcaoId: string) => {
    if (data.jaVotou || votando) return
    
    setVotando(true)
    setVotedId(opcaoId)
    const res = await votarEnquete(data.id, opcaoId)
    setVotando(false)

    if (res.success) {
      toast.success('Voto registrado com sucesso!')
      // Recarregar dados ou atualizar localmente (simulação rápida para UX)
      const novasOpcoes = data.opcoes.map(opt => {
        const novosVotos = opt.id === opcaoId ? opt.votos + 1 : opt.votos
        const novoTotal = data.totalVotos + 1
        return {
          ...opt,
          votos: novosVotos,
          percentual: Math.round((novosVotos / novoTotal) * 100)
        }
      })
      setData({ ...data, opcoes: novasOpcoes, totalVotos: data.totalVotos + 1, jaVotou: true })
    } else {
      toast.error(res.error || 'Erro ao votar.')
    }
  }

  const exibeResultados = data.jaVotou

  return (
    <div className="bg-white rounded-[2rem] border border-border/50 shadow-xl overflow-hidden animate-fade-in max-w-xl mx-auto w-full">
      <div className="bg-primary p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-secondary" />
          <h3 className="font-black uppercase tracking-tight italic text-sm sm:text-base">Pesquisa de Opinião</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <Lock size={10} className="text-secondary" />
          Proteção por IP
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-6">
        <div className="space-y-2">
          <h4 className="text-xl sm:text-2xl font-black text-dark leading-tight italic uppercase tracking-tighter">
            {data.titulo}
          </h4>
          {data.descricao && <p className="text-xs sm:text-sm text-muted font-medium">{data.descricao}</p>}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {data.opcoes.map((opt) => (
            <div key={opt.id} className="relative group">
              {exibeResultados ? (
                // VIEW RESULTADOS (PERCENTUAIS)
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-xs font-black text-dark uppercase tracking-tight">{opt.texto}</span>
                    <span className="text-sm font-black text-primary italic">{opt.percentual}%</span>
                  </div>
                  <div className="h-4 bg-surface rounded-full overflow-hidden border border-border/30">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${opt.percentual}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                // VIEW VOTAÇÃO
                <button
                  onClick={() => handleVoto(opt.id)}
                  disabled={votando}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-between"
                >
                  <span className="font-bold text-dark text-sm sm:text-base">{opt.texto}</span>
                  {votedId === opt.id && votando ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center transition-all">
                      <div className="w-3 h-3 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest italic">
            Total de {data.totalVotos} participações
          </p>
          {data.jaVotou && (
            <div className="flex items-center gap-1.5 text-primary">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Voto Computado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
