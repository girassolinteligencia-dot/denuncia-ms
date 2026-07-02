'use client'

import React, { useMemo, useState } from 'react'
import { Building2, CheckCircle2, Edit2, MapPin, Phone, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { LocalidadePublica } from '@/types'
import { deleteLocalidadePublica, saveLocalidadePublica } from '@/lib/actions/admin-localidades'

const emptyLocalidade: Partial<LocalidadePublica> = {
  nome: '',
  sigla: '',
  endereco: '',
  municipio: '',
  cnpj: '',
  telefone: '',
  ativo: true,
}

export function LocalidadesManager({ initialLocalidades }: { initialLocalidades: LocalidadePublica[] }) {
  const [localidades, setLocalidades] = useState(initialLocalidades)
  const [searchTerm, setSearchTerm] = useState('')
  const [editing, setEditing] = useState<Partial<LocalidadePublica> | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return localidades

    return localidades.filter((item) =>
      item.nome.toLowerCase().includes(term) ||
      item.sigla?.toLowerCase().includes(term) ||
      item.municipio.toLowerCase().includes(term) ||
      item.cnpj?.includes(term.replace(/\D/g, ''))
    )
  }, [localidades, searchTerm])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return

    setLoading(true)
    const result = await saveLocalidadePublica(editing)
    setLoading(false)

    if (!result.success || !result.data) {
      toast.error(result.error || 'Erro ao salvar localidade')
      return
    }

    setLocalidades((prev) => {
      const exists = prev.some((item) => item.id === result.data!.id)
      const next = exists
        ? prev.map((item) => item.id === result.data!.id ? result.data! : item)
        : [...prev, result.data!]

      return next.sort((a, b) => a.nome.localeCompare(b.nome))
    })
    setEditing(null)
    toast.success('Localidade salva com sucesso')
  }

  const handleToggleActive = async (item: LocalidadePublica) => {
    const result = await saveLocalidadePublica({ ...item, ativo: !item.ativo })
    if (!result.success || !result.data) {
      toast.error(result.error || 'Erro ao atualizar status')
      return
    }

    setLocalidades((prev) => prev.map((row) => row.id === item.id ? result.data! : row))
    toast.success(`Localidade ${result.data.ativo ? 'ativada' : 'desativada'}`)
  }

  const handleDelete = async (item: LocalidadePublica) => {
    if (!confirm(`Excluir "${item.nome}"? Se já houver denúncias vinculadas, ela será apenas desativada.`)) return

    const result = await deleteLocalidadePublica(item.id)
    if (!result.success) {
      toast.error(result.error || 'Erro ao excluir localidade')
      return
    }

    if (result.deactivated) {
      setLocalidades((prev) => prev.map((row) => row.id === item.id ? { ...row, ativo: false } : row))
      toast.success('Localidade desativada porque já possui histórico')
    } else {
      setLocalidades((prev) => prev.filter((row) => row.id !== item.id))
      toast.success('Localidade excluída')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por nome, sigla, município ou CNPJ..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="input pl-10 h-11 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyLocalidade)}
          className="btn-primary w-full sm:w-auto gap-2 h-11 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} />
          Nova Localidade
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className={`bg-white border rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card-md transition-all ${item.ativo ? 'border-border' : 'border-dashed opacity-60'}`}>
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 size={21} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-dark text-sm sm:text-base">{item.nome}</h3>
                  {item.sigla && (
                    <span className="text-[10px] bg-primary-50 text-primary px-2 py-0.5 rounded font-black uppercase">
                      {item.sigla}
                    </span>
                  )}
                  {!item.ativo && (
                    <span className="text-[9px] bg-red-50 text-error border border-red-100 px-2 py-0.5 rounded font-black uppercase">
                      Inativa
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-col gap-1 text-[11px] text-muted font-bold">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {item.municipio}{item.endereco ? ` - ${item.endereco}` : ''}
                  </span>
                  {(item.cnpj || item.telefone) && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {[item.cnpj ? `CNPJ ${item.cnpj}` : null, item.telefone].filter(Boolean).join(' | ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
              <button
                type="button"
                onClick={() => handleToggleActive(item)}
                className={`p-2 rounded-lg transition-all ${item.ativo ? 'text-success hover:bg-green-50' : 'text-muted hover:bg-surface'}`}
                title={item.ativo ? 'Desativar' : 'Ativar'}
              >
                {item.ativo ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setEditing(item)}
                className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-all"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-card p-12 text-center">
            <p className="text-muted text-sm italic">Nenhuma localidade encontrada.</p>
          </div>
        )}
      </div>

      {editing && (
        <>
          <div className="fixed inset-0 bg-dark/20 backdrop-blur-sm z-[100]" onClick={() => setEditing(null)} />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[101] animate-slide-left border-l border-border flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border bg-surface flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-extrabold text-dark uppercase tracking-tighter italic">Localidade Pública</h2>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Cadastro para seleção na denúncia</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-border rounded-full transition-colors" title="Fechar">
                <XCircle size={20} className="text-muted" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="label label-required">Nome</label>
                <input className="input h-11" value={editing.nome || ''} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Sigla</label>
                  <input className="input h-11 uppercase" value={editing.sigla || ''} onChange={(e) => setEditing({ ...editing, sigla: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="label label-required">Município</label>
                  <input className="input h-11" value={editing.municipio || ''} onChange={(e) => setEditing({ ...editing, municipio: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Endereço</label>
                <input className="input h-11" value={editing.endereco || ''} onChange={(e) => setEditing({ ...editing, endereco: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">CNPJ</label>
                  <input className="input h-11" inputMode="numeric" value={editing.cnpj || ''} onChange={(e) => setEditing({ ...editing, cnpj: e.target.value })} />
                </div>
                <div>
                  <label className="label">Telefone</label>
                  <input className="input h-11" value={editing.telefone || ''} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} />
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border flex items-center justify-between">
                <span className="text-[10px] font-black text-dark uppercase tracking-widest">Ativa para seleção</span>
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, ativo: !(editing.ativo ?? true) })}
                  className={`w-12 h-6 rounded-full relative transition-all ${(editing.ativo ?? true) ? 'bg-primary' : 'bg-border'}`}
                  title={(editing.ativo ?? true) ? 'Desativar' : 'Ativar'}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${(editing.ativo ?? true) ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="pt-4 pb-8">
                <button type="submit" disabled={loading} className="btn-primary w-full h-14 gap-3 shadow-xl">
                  <CheckCircle2 size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">{loading ? 'Salvando...' : 'Salvar Localidade'}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
