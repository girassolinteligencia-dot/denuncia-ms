'use client'

import React, { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { setPesquisaSatisfacaoAtiva, criarEnquete, deletarEnquete } from '@/lib/actions/enquetes'

// Note: In a real app, I'd have server actions for CRUD. For now I'll implement the UI logic.
// I'll assume we have a server action called `salvarEnquete` which I'll create next.

export function EnquetesManager({ 
  initialEnquetes, 
  satisfacaoAtiva 
}: { 
  initialEnquetes: any[], // Tipagem simplificada para props iniciais
  satisfacaoAtiva: boolean 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSatisfacaoAtiva, setIsSatisfacaoAtiva] = useState(satisfacaoAtiva)
  const [showNovoForm, setShowNovoForm] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta enquete?')) return
    setLoading(true)
    const res = await deletarEnquete(id)
    setLoading(false)
    if (res.success) {
      toast.success('Enquete excluída!')
      router.refresh()
    } else {
      toast.error('Erro ao excluir: ' + res.error)
    }
  }

  const handleToggleSatisfacao = async () => {
    setLoading(true)
    const res = await setPesquisaSatisfacaoAtiva(!isSatisfacaoAtiva)
    setLoading(false)
    if (res.success) {
      setIsSatisfacaoAtiva(!isSatisfacaoAtiva)
      toast.success(`Pesquisa de satisfação ${!isSatisfacaoAtiva ? 'ativada' : 'desativada'}!`)
    }
  }

  return (
    <div className="space-y-8">
      {/* CARD DE CONTROLE GLOBAL */}
      <div className="bg-dark rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl font-black uppercase tracking-tight italic text-secondary">Pesquisa de Satisfação Global</h2>
          <p className="text-white/50 text-sm font-medium">Habilitar ou desabilitar o modal de emojis (Ruim/Ótimo) na Landing Page.</p>
        </div>
        <button 
          onClick={handleToggleSatisfacao}
          disabled={loading}
          className={`flex items-center gap-3 px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${isSatisfacaoAtiva ? 'bg-secondary text-dark' : 'bg-white/10 text-white/40'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : isSatisfacaoAtiva ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          {isSatisfacaoAtiva ? 'Ativado' : 'Desativado'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Enquetes <span className="text-primary">Parametrizáveis</span></h2>
        <button 
          onClick={() => setShowNovoForm(!showNovoForm)}
          className="btn-primary gap-2 h-12 px-6 rounded-xl bg-primary text-white font-black uppercase text-xs shadow-glow-cyan"
        >
          <Plus size={18} />
          Nova Enquete
        </button>
      </div>

      {showNovoForm && (
        <NovoEnqueteForm 
          onClose={() => setShowNovoForm(false)} 
          onSuccess={() => {
            setShowNovoForm(false)
            router.refresh()
          }} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialEnquetes.map((enquete) => (
          <div key={enquete.id} className="bg-white rounded-[2rem] border border-border shadow-card p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${enquete.ativa ? 'bg-success/10 text-success border border-success/20' : 'bg-muted/10 text-muted border border-border'}`}>
                    {enquete.ativa ? 'Ativa' : 'Pausada'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted">{enquete.local_exibicao}</span>
                </div>
                <h3 className="text-xl font-black text-dark uppercase italic tracking-tight">{enquete.titulo}</h3>
              </div>
              <button 
                onClick={() => handleDelete(enquete.id)}
                disabled={loading}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {enquete.opcoes.map((opt: any) => {
                const total = enquete.total_votos || 1
                const perc = Math.round(((opt.votos || 0) / total) * 100)
                return (
                  <div key={opt.id} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                      <span className="text-dark/60">{opt.texto}</span>
                      <span className="text-primary italic">{perc}% ({opt.votos || 0})</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${perc}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted italic">
              <span>Total: {enquete.total_votos || 0} votos</span>
              <button className="text-primary hover:underline">Ver Detalhes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NovoEnqueteForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [local, setLocal] = useState('landing')
  const [opcoes, setOpcoes] = useState(['', ''])
  const [loading, setLoading] = useState(false)

  const handleAddOpcao = () => {
    if (opcoes.length < 10) setOpcoes([...opcoes, ''])
  }

  const handleRemoveOpcao = (idx: number) => {
    setOpcoes(opcoes.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!titulo || opcoes.some(o => !o)) {
      toast.error('Preencha o título e todas as opções.')
      return
    }
    setLoading(true)
    const res = await criarEnquete(titulo, local, opcoes)
    setLoading(false)
    
    if (res.success) {
      toast.success('Enquete criada com sucesso!')
      onSuccess()
    } else {
      toast.error('Erro ao criar: ' + res.error)
    }
  }

  return (
    <div className="bg-surface rounded-[2rem] border-2 border-primary/20 p-8 sm:p-10 space-y-8 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Título da Enquete</label>
            <input 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)}
              className="input h-14 rounded-xl border-2 font-bold" 
              placeholder="Ex: Qual sua opinião sobre o transporte público?" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Local de Exibição</label>
            <select 
              value={local} 
              onChange={e => setLocal(e.target.value)}
              className="input h-14 rounded-xl border-2 font-bold"
            >
              <option value="landing">Landing Page</option>
              <option value="noticias">Seção de Notícias</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary">Opções (Máximo 10)</label>
          <div className="space-y-2">
            {opcoes.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  value={opt} 
                  onChange={e => {
                    const newOps = [...opcoes]
                    newOps[i] = e.target.value
                    setOpcoes(newOps)
                  }}
                  className="input h-10 rounded-lg border text-xs font-bold" 
                  placeholder={`Opção ${i+1}`} 
                />
                <button onClick={() => handleRemoveOpcao(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <button onClick={handleAddOpcao} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">+ Adicionar Opção</button>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button onClick={onClose} className="text-xs font-black uppercase text-muted hover:text-dark">Cancelar</button>
        <button onClick={handleSave} disabled={loading} className="btn-primary h-12 px-10 rounded-xl bg-primary text-white font-black text-xs uppercase shadow-glow-cyan">
          {loading ? <Loader2 className="animate-spin" /> : 'Criar Enquete'}
        </button>
      </div>
    </div>
  )
}
