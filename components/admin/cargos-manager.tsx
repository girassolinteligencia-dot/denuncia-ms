'use client'

import React, { useMemo, useRef, useState } from 'react'
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, Download, Edit2, FileSpreadsheet, Plus, Search, Trash2, Upload, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { CargoPublico, TipoCargoPublico } from '@/types'
import {
  deleteCargoPublico,
  importCargosPublicos,
  listCargosPublicos,
  saveCargoPublico,
  type ImportCargoResult,
  type ImportCargoRow,
} from '@/lib/actions/admin-cargos'

const emptyCargo: Partial<CargoPublico> = {
  nome: '',
  tipo: 'ambos',
  setor: '',
  ativo: true,
}

const tipoLabel: Record<TipoCargoPublico, string> = {
  servidor_publico: 'Servidor Público',
  agente_politico: 'Agente Político',
  ambos: 'Ambos',
}

type PapaParseResult = {
  data?: Record<string, unknown>[]
  errors?: { message?: string }[]
}

type PapaParser = {
  parse: (
    text: string,
    config: {
      header: boolean
      skipEmptyLines: 'greedy'
      transformHeader: (header: string) => string
      complete: (result: PapaParseResult) => void
    }
  ) => void
}

export function CargosManager({ initialCargos }: { initialCargos: CargoPublico[] }) {
  const [cargos, setCargos] = useState(initialCargos)
  const [searchTerm, setSearchTerm] = useState('')
  const [editing, setEditing] = useState<Partial<CargoPublico> | null>(null)
  const [loading, setLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const [importRows, setImportRows] = useState<ImportCargoRow[]>([])
  const [importResult, setImportResult] = useState<{ summary?: { created: number; updated: number; ignored: number; errors: number }, results: ImportCargoResult[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return cargos

    return cargos.filter((item) =>
      item.nome.toLowerCase().includes(term) ||
      item.tipo.toLowerCase().includes(term) ||
      item.setor?.toLowerCase().includes(term)
    )
  }, [cargos, searchTerm])

  const importValidation = useMemo(() => {
    const errors: string[] = []
    const invalidRows = new Set<number>()
    const seen = new Set<string>()

    importRows.forEach((row, index) => {
      const nome = String(row.nome || '').trim()
      const tipo = String(row.tipo || 'ambos').trim().toLowerCase()
      const key = `${nome.toLowerCase()}|${tipo}`

      if (!nome) {
        errors.push(`Linha ${index + 2}: nome é obrigatório.`)
        invalidRows.add(index)
      }
      if (key && seen.has(key)) {
        errors.push(`Linha ${index + 2}: duplicada dentro do arquivo.`)
        invalidRows.add(index)
      }
      if (key) seen.add(key)
    })

    return {
      total: importRows.length,
      valid: Math.max(0, importRows.length - invalidRows.size),
      errors,
    }
  }, [importRows])

  const resetImport = () => {
    setImportFileName('')
    setImportRows([])
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const normalizeHeader = (header: string) => {
    const normalized = header
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const aliases: Record<string, keyof ImportCargoRow> = {
      cargo: 'nome',
      funcao: 'nome',
      nome_cargo: 'nome',
      area: 'setor',
      setor_area: 'setor',
      status: 'ativo',
      ativa: 'ativo',
    }

    return aliases[normalized] || normalized
  }

  const downloadTemplate = () => {
    const csv = [
      'nome,tipo,setor,ativo',
      'Fiscal,servidor_publico,Administrativo,true',
      'Professor,servidor_publico,Educação,true',
      'Vereador,agente_politico,Legislativo,true',
      'Secretário Municipal,agente_politico,Administrativo,true',
      'Diretor Escolar,ambos,Educação,true',
    ].join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo_cargos_publicos.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Envie um arquivo CSV usando o modelo baixado.')
      event.target.value = ''
      return
    }

    const text = await file.text()
    const PapaModule = await import('papaparse') as unknown as ({ default?: PapaParser } & PapaParser)
    const Papa = PapaModule.default || PapaModule

    Papa.parse(text, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: normalizeHeader,
      complete: (result: PapaParseResult) => {
        if (result.errors?.length) {
          toast.error('Erro ao ler CSV', { description: result.errors[0]?.message || 'Verifique o arquivo e tente novamente.' })
          return
        }

        const rows = (result.data || [])
          .map((row: Record<string, unknown>) => ({
            nome: String(row.nome || '').trim(),
            tipo: String(row.tipo || 'ambos').trim(),
            setor: String(row.setor || '').trim(),
            ativo: row.ativo === undefined || row.ativo === null || row.ativo === '' ? true : String(row.ativo).trim(),
          }))
          .filter((row: ImportCargoRow) => Object.values(row).some((value) => String(value || '').trim()))

        setImportRows(rows)
        setImportFileName(file.name)
        setImportResult(null)
        setImportOpen(true)
      },
    })
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return

    setLoading(true)
    const result = await saveCargoPublico(editing)
    setLoading(false)

    if (!result.success || !result.data) {
      toast.error(result.error || 'Erro ao salvar cargo')
      return
    }

    setCargos((prev) => {
      const exists = prev.some((item) => item.id === result.data!.id)
      const next = exists
        ? prev.map((item) => item.id === result.data!.id ? result.data! : item)
        : [...prev, result.data!]

      return next.sort((a, b) => a.nome.localeCompare(b.nome))
    })
    setEditing(null)
    toast.success('Cargo salvo com sucesso')
  }

  const handleToggleActive = async (item: CargoPublico) => {
    const result = await saveCargoPublico({ ...item, ativo: !item.ativo })
    if (!result.success || !result.data) {
      toast.error(result.error || 'Erro ao atualizar status')
      return
    }

    setCargos((prev) => prev.map((row) => row.id === item.id ? result.data! : row))
    toast.success(`Cargo ${result.data.ativo ? 'ativado' : 'desativado'}`)
  }

  const handleDelete = async (item: CargoPublico) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return

    const result = await deleteCargoPublico(item.id)
    if (!result.success) {
      toast.error(result.error || 'Erro ao excluir cargo')
      return
    }

    setCargos((prev) => prev.filter((row) => row.id !== item.id))
    toast.success('Cargo excluído')
  }

  const handleConfirmImport = async () => {
    if (importValidation.errors.length > 0) {
      toast.error('Corrija o arquivo antes de importar.')
      return
    }

    setImporting(true)
    const result = await importCargosPublicos(importRows)
    setImporting(false)

    if (!result.success && !result.results?.length) {
      toast.error(result.error || 'Erro ao importar cargos')
      return
    }

    setImportResult({ summary: result.summary, results: result.results || [] })

    const refreshed = await listCargosPublicos()
    if (refreshed.success && refreshed.data) {
      setCargos(refreshed.data)
    }

    if (result.summary?.errors) {
      toast.warning('Importação concluída com erros')
    } else {
      toast.success('Importação concluída')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por cargo, tipo ou setor..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="input pl-10 h-11 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
          <button type="button" onClick={downloadTemplate} className="w-full sm:w-auto h-11 px-4 rounded-xl border border-border bg-white text-dark hover:bg-surface transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
            <Download size={16} />
            Baixar Modelo
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto h-11 px-4 rounded-xl border border-border bg-white text-dark hover:bg-surface transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
            <Upload size={16} />
            Importar CSV
          </button>
          <button type="button" onClick={() => setEditing(emptyCargo)} className="btn-primary w-full sm:w-auto gap-2 h-11 text-xs font-black uppercase tracking-widest">
            <Plus size={18} />
            Novo Cargo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className={`bg-white border rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card-md transition-all ${item.ativo ? 'border-border' : 'border-dashed opacity-60'}`}>
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BriefcaseBusiness size={21} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-dark text-sm sm:text-base">{item.nome}</h3>
                  <span className="text-[10px] bg-primary-50 text-primary px-2 py-0.5 rounded font-black uppercase">
                    {tipoLabel[item.tipo]}
                  </span>
                  {!item.ativo && (
                    <span className="text-[9px] bg-red-50 text-error border border-red-100 px-2 py-0.5 rounded font-black uppercase">Inativo</span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-muted font-bold">{item.setor || 'Sem setor vinculado'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
              <button type="button" onClick={() => handleToggleActive(item)} className={`p-2 rounded-lg transition-all ${item.ativo ? 'text-success hover:bg-green-50' : 'text-muted hover:bg-surface'}`} title={item.ativo ? 'Desativar' : 'Ativar'}>
                {item.ativo ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </button>
              <button type="button" onClick={() => setEditing(item)} className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all" title="Editar">
                <Edit2 size={18} />
              </button>
              <button type="button" onClick={() => handleDelete(item)} className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-card p-12 text-center">
            <p className="text-muted text-sm italic">Nenhum cargo encontrado.</p>
          </div>
        )}
      </div>

      {editing && (
        <>
          <div className="fixed inset-x-0 bottom-0 top-16 sm:top-20 bg-dark/20 backdrop-blur-sm z-[60]" onClick={() => setEditing(null)} />
          <div className="fixed right-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-full max-w-md bg-white shadow-2xl z-[80] animate-slide-left border-l border-border flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border bg-surface flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-extrabold text-dark uppercase tracking-tighter italic">Cargo Público</h2>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Cadastro para autocomplete da denúncia</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-border rounded-full transition-colors" title="Fechar">
                <XCircle size={20} className="text-muted" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="label label-required">Nome do cargo</label>
                <input className="input h-11" value={editing.nome || ''} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} required />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input h-11 bg-white" value={editing.tipo || 'ambos'} onChange={(e) => setEditing({ ...editing, tipo: e.target.value as TipoCargoPublico })}>
                  <option value="ambos">Ambos</option>
                  <option value="servidor_publico">Servidor Público</option>
                  <option value="agente_politico">Agente Político</option>
                </select>
              </div>
              <div>
                <label className="label">Setor</label>
                <input className="input h-11" value={editing.setor || ''} onChange={(e) => setEditing({ ...editing, setor: e.target.value })} />
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border flex items-center justify-between">
                <span className="text-[10px] font-black text-dark uppercase tracking-widest">Ativo para autocomplete</span>
                <button type="button" onClick={() => setEditing({ ...editing, ativo: !(editing.ativo ?? true) })} className={`w-12 h-6 rounded-full relative transition-all ${(editing.ativo ?? true) ? 'bg-primary' : 'bg-border'}`} title={(editing.ativo ?? true) ? 'Desativar' : 'Ativar'}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${(editing.ativo ?? true) ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="pt-4 pb-8">
                <button type="submit" disabled={loading} className="btn-primary w-full h-14 gap-3 shadow-xl">
                  <CheckCircle2 size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">{loading ? 'Salvando...' : 'Salvar Cargo'}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {importOpen && (
        <>
          <div className="fixed inset-x-0 bottom-0 top-16 sm:top-20 bg-dark/20 backdrop-blur-sm z-[60]" onClick={() => setImportOpen(false)} />
          <div className="fixed right-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-full max-w-2xl bg-white shadow-2xl z-[80] animate-slide-left border-l border-border flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border bg-surface flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-extrabold text-dark uppercase tracking-tighter italic">Importar Cargos</h2>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{importFileName || 'Arquivo CSV'}</p>
              </div>
              <button onClick={() => setImportOpen(false)} className="p-2 hover:bg-border rounded-full transition-colors" title="Fechar">
                <XCircle size={20} className="text-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted">Linhas</p>
                  <p className="text-2xl font-black text-dark">{importValidation.total}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-700">Válidas</p>
                  <p className="text-2xl font-black text-green-700">{importValidation.valid}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Atualizar</p>
                  <p className="text-2xl font-black text-amber-700">auto</p>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-700">Erros</p>
                  <p className="text-2xl font-black text-red-700">{importValidation.errors.length}</p>
                </div>
              </div>

              {importValidation.errors.length > 0 && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Corrija antes de importar</p>
                  </div>
                  <div className="space-y-1 text-xs font-bold text-red-700">
                    {importValidation.errors.slice(0, 8).map((error) => <p key={error}>{error}</p>)}
                    {importValidation.errors.length > 8 && <p>Mais {importValidation.errors.length - 8} erro(s)...</p>}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-surface px-4 py-3 border-b border-border flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-dark">Prévia das primeiras linhas</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-muted uppercase text-[9px] tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Setor</th>
                        <th className="px-4 py-3">Ativo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importRows.slice(0, 10).map((row, index) => (
                        <tr key={`${row.nome}-${index}`} className="font-bold text-dark">
                          <td className="px-4 py-3 min-w-[220px]">{row.nome}</td>
                          <td className="px-4 py-3">{row.tipo || 'ambos'}</td>
                          <td className="px-4 py-3">{row.setor || '-'}</td>
                          <td className="px-4 py-3">{String(row.ativo ?? true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {importResult && (
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Resultado da importação</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-black">
                    <span>Criados: {importResult.summary?.created || 0}</span>
                    <span>Atualizados: {importResult.summary?.updated || 0}</span>
                    <span>Ignorados: {importResult.summary?.ignored || 0}</span>
                    <span>Erros: {importResult.summary?.errors || 0}</span>
                  </div>
                  {(importResult.summary?.errors || 0) > 0 && (
                    <div className="space-y-1 text-xs font-bold text-error">
                      {importResult.results.filter((item) => item.action === 'error').slice(0, 6).map((item) => (
                        <p key={`${item.row}-${item.nome}`}>Linha {item.row}: {item.error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-white flex flex-col sm:flex-row gap-2 justify-end shrink-0">
              <button type="button" onClick={resetImport} className="h-11 px-5 rounded-xl border border-border bg-white text-dark hover:bg-surface transition-all text-xs font-black uppercase tracking-widest">Limpar</button>
              <button type="button" onClick={handleConfirmImport} disabled={importing || importRows.length === 0 || importValidation.errors.length > 0} className="btn-primary h-11 px-6 text-xs font-black uppercase tracking-widest disabled:opacity-40">
                {importing ? 'Importando...' : 'Confirmar Importação'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
