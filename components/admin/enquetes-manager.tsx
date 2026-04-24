'use client'

import React, { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Lock, Timer, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { setPesquisaSatisfacaoAtiva, criarEnquete, deletarEnquete, atualizarEnquete } from '@/lib/actions/enquetes'

export function EnquetesManager({ 
  initialEnquetes, 
  satisfacaoAtiva 
}: { 
  initialEnquetes: any[], 
  satisfacaoAtiva: boolean 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSatisfacaoAtiva, setIsSatisfacaoAtiva] = useState(satisfacaoAtiva)
  const [showNovoForm, setShowNovoForm] = useState(false)
  const [enqueteParaEditar, setEnqueteParaEditar] = useState<any>(null)

  const handleEncerrar = async (id: string) => {
    if (!confirm('Deseja encerrar esta enquete agora? Ninguém mais poderá votar.')) return
    setLoading(true)
    const res = await atualizarEnquete(id, { encerrada_manualmente: true, ativa: false })
    setLoading(false)
    if (res.success) {
      toast.success('Enquete encerrada com sucesso!')
      router.refresh()
    } else {
      toast.error('Erro ao encerrar: ' + res.error)
    }
  }

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
                <div className="flex gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${enquete.ativa ? 'bg-success/10 text-success border border-success/20' : 'bg-muted/10 text-muted border border-border'}`}>
                    {enquete.ativa ? 'Ativa' : 'Encerrada'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted">{enquete.local_exibicao}</span>
                </div>
                <h3 className="text-xl font-black text-dark uppercase italic tracking-tight leading-tight">{enquete.titulo}</h3>
              </div>
              <div className="flex gap-2">
                {enquete.ativa && !enquete.encerrada_manualmente && (
                  <button 
                    onClick={() => handleEncerrar(enquete.id)}
                    title="Encerrar agora"
                    className="text-amber-500 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                  >
                    <Lock size={18} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(enquete.id)}
                  disabled={loading}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest text-muted">
                 {enquete.data_expiracao && (
                   <span className="flex items-center gap-1 border border-border px-2 py-1 rounded-lg">
                      <Timer size={10} /> Expira em: {new Date(enquete.data_expiracao).toLocaleString()}
                   </span>
                 )}
                 {enquete.limite_votos && (
                   <span className="flex items-center gap-1 border border-border px-2 py-1 rounded-lg">
                      <Target size={10} /> Meta: {enquete.limite_votos} votos
                   </span>
                 )}
            </div>

            <div className="space-y-3">
              {(enquete.opcoes || []).map((opt: any) => {
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
              <button 
                onClick={() => setEnqueteParaEditar(enquete)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                Editar Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {enqueteParaEditar && (
        <NovoEnqueteForm 
          enquete={enqueteParaEditar}
          onClose={() => setEnqueteParaEditar(null)} 
          onSuccess={() => {
            setEnqueteParaEditar(null)
            router.refresh()
          }} 
        />
      )}
    </div>
  )
}

function NovoEnqueteForm({ 
  onClose, 
  onSuccess, 
  enquete 
}: { 
  onClose: () => void, 
  onSuccess: () => void, 
  enquete?: any 
}) {
  const [titulo, setTitulo] = useState(enquete?.titulo || '')
  const [local, setLocal] = useState(enquete?.local_exibicao || 'landing')
  const [ativa, setAtiva] = useState(enquete?.ativa ?? true)
  const [opcoes, setOpcoes] = useState<string[]>(enquete?.opcoes?.map((o: any) => o.texto) || ['', ''])
  const [dataExpiracao, setDataExpiracao] = useState(enquete?.data_expiracao ? new Date(enquete.data_expiracao).toISOString().slice(0, 16) : '')
  const [limiteVotos, setLimiteVotos] = useState(enquete?.limite_votos || '')
  const [loading, setLoading] = useState(false)

  const handleAddOpcao = () => {
    if (opcoes.length < 10) setOpcoes([...opcoes, ''])
  }

  const handleRemoveOpcao = (idx: number) => {
    setOpcoes(opcoes.filter((_, i) => i !== idx))
  }

  const moveOpcao = (idx: number, direction: 'up' | 'down') => {
    const newOps = [...opcoes]
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= opcoes.length) return
    [newOps[idx], newOps[targetIdx]] = [newOps[targetIdx], newOps[idx]]
    setOpcoes(newOps)
  }

  const handleSave = async () => {
    if (!titulo || opcoes.some(o => !o)) {
      toast.error('Preencha o título e todas as opções.')
      return
    }
    setLoading(true)
    
    const res = enquete 
      ? await atualizarEnquete(enquete.id, {
          titulo,
          local,
          ativa,
          data_expiracao: dataExpiracao || null,
          limite_votos: limiteVotos ? Number(limiteVotos) : null,
          opcoes: opcoes.map((texto, i) => ({ texto, ordem: i }))
        })
      : await criarEnquete({
          titulo,
          local,
          opcoes,
          dataExpiracao: dataExpiracao || undefined,
          limiteVotos: limiteVotos ? Number(limiteVotos) : undefined
        })

    setLoading(false)
    
    if (res.success) {
      toast.success(enquete ? 'Enquete atualizada!' : 'Enquete criada!')
      onSuccess()
    } else {
      toast.error('Erro ao salvar: ' + res.error)
    }
  }

  return (
    <div className="bg-surface rounded-[2rem] border-2 border-primary/20 p-8 sm:p-10 space-y-8 animate-slide-up shadow-2xl relative">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="text-xl font-black text-dark uppercase italic">{enquete ? 'Editar Enquete' : 'Nova Enquete'}</h3>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black uppercase text-muted">Status:</label>
          <button 
            onClick={() => setAtiva(!ativa)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${ativa ? 'bg-success/10 text-success border-success/20' : 'bg-red-50 text-red-500 border-red-100'}`}
          >
            {ativa ? 'Ativa (Publicada)' : 'Pausada (Oculta)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Título / Pergunta</label>
            <input 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)}
              className="input h-14 rounded-xl border-2 font-bold" 
              placeholder="Ex: Qual sua opinião sobre o transporte público?" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Prazo de Expiração</label>
              <input 
                type="datetime-local"
                value={dataExpiracao} 
                onChange={e => setDataExpiracao(e.target.value)}
                className="input h-14 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Meta de Votos</label>
              <input 
                type="number"
                value={limiteVotos} 
                onChange={e => setLimiteVotos(e.target.value)}
                className="input h-14 rounded-xl border-2 font-bold"
                placeholder="Ex: 500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Local de Exibição</label>
            <select 
              value={local} 
              onChange={e => setLocal(e.target.value)}
              className="input h-14 rounded-xl border-2 font-bold"
            >
              <option value="landing">Landing Page (Home)</option>
              <option value="noticias">Seção de Notícias</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary">Opções e Ordem</label>
          <div className="space-y-2">
            {opcoes.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="flex flex-col gap-0.5">
                   <button onClick={() => moveOpcao(i, 'up')} className="text-muted hover:text-primary disabled:opacity-20" disabled={i === 0} title="Subir">
                      <Plus size={12} className="rotate-45" />
                   </button>
                </div>
                <input 
                  value={opt} 
                  onChange={e => {
                    const newOps = [...opcoes]
                    newOps[i] = e.target.value
                    setOpcoes(newOps)
                  }}
                  className="input h-10 rounded-lg border text-xs font-bold flex-1" 
                  placeholder={`Opção ${i+1}`} 
                />
                <button onClick={() => handleRemoveOpcao(i)} className="text-red-400 hover:text-red-600 px-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button onClick={handleAddOpcao} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">+ Adicionar Resposta</button>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button onClick={onClose} className="text-xs font-black uppercase text-muted hover:text-dark">Descartar</button>
        <button onClick={handleSave} disabled={loading} className="btn-primary h-12 px-10 rounded-xl bg-primary text-white font-black text-xs uppercase shadow-glow-cyan">
          {loading ? <Loader2 className="animate-spin" /> : enquete ? 'Salvar Alterações' : 'Publicar Enquete'}
        </button>
      </div>
    </div>
  )
}
