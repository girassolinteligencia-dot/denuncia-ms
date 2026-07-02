'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { CargoPublico, TipoCargoPublico } from '@/types'

export interface ImportCargoRow {
  nome?: string
  tipo?: string
  setor?: string
  ativo?: boolean | string | number | null
}

export interface ImportCargoResult {
  row: number
  nome: string
  tipo: TipoCargoPublico | ''
  action: 'created' | 'updated' | 'ignored' | 'error'
  error?: string
}

const VALID_TYPES: TipoCargoPublico[] = ['servidor_publico', 'agente_politico', 'ambos']

function normalizarTexto(value: unknown) {
  return String(value || '').trim()
}

function chaveTexto(value: string | null | undefined) {
  return normalizarTexto(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizarTipo(value: unknown): TipoCargoPublico {
  const normalized = chaveTexto(String(value || 'ambos')).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  const aliases: Record<string, TipoCargoPublico> = {
    servidor: 'servidor_publico',
    servidor_publico: 'servidor_publico',
    funcionario_publico: 'servidor_publico',
    agente: 'agente_politico',
    politico: 'agente_politico',
    agente_politico: 'agente_politico',
    ambos: 'ambos',
    todos: 'ambos',
  }

  return aliases[normalized] || 'ambos'
}

function normalizarAtivo(value: ImportCargoRow['ativo']) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0

  const normalized = chaveTexto(String(value || ''))
  if (!normalized) return true
  return ['true', 'sim', 's', '1', 'ativo', 'ativa', 'yes', 'y'].includes(normalized)
}

function normalizarCargo(input: Partial<CargoPublico> | ImportCargoRow) {
  return {
    nome: normalizarTexto(input.nome),
    tipo: normalizarTipo(input.tipo),
    setor: normalizarTexto(input.setor) || null,
    ativo: normalizarAtivo(input.ativo),
    atualizado_em: new Date().toISOString(),
  }
}

export async function listCargosPublicos() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cargos_publicos')
    .select('*')
    .order('nome', { ascending: true })

  if (error) return { success: false, error: error.message, data: [] }
  return { success: true, data: data as CargoPublico[] }
}

export async function saveCargoPublico(input: Partial<CargoPublico>) {
  const supabase = createAdminClient()
  const payload = normalizarCargo(input)

  if (!payload.nome) return { success: false, error: 'Nome do cargo é obrigatório.' }

  const query = input.id
    ? supabase.from('cargos_publicos').update(payload).eq('id', input.id).select().single()
    : supabase.from('cargos_publicos').insert({ ...payload, criado_em: new Date().toISOString() }).select().single()

  const { data, error } = await query

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/cargos')
  revalidatePath('/denunciar')
  return { success: true, data: data as CargoPublico }
}

export async function deleteCargoPublico(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('cargos_publicos')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/cargos')
  revalidatePath('/denunciar')
  return { success: true }
}

export async function importCargosPublicos(rows: ImportCargoRow[]) {
  const supabase = createAdminClient()
  const results: ImportCargoResult[] = []

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, error: 'Nenhuma linha válida foi enviada para importação.', results }
  }

  if (rows.length > 2000) {
    return { success: false, error: 'O limite por importação é de 2.000 linhas.', results }
  }

  const { data: existentes, error: existingError } = await supabase
    .from('cargos_publicos')
    .select('*')

  if (existingError) return { success: false, error: existingError.message, results }

  const byNomeTipo = new Map<string, CargoPublico>()
  for (const item of (existentes || []) as CargoPublico[]) {
    byNomeTipo.set(`${chaveTexto(item.nome)}|${item.tipo}`, item)
  }

  const seenInFile = new Set<string>()
  const now = new Date().toISOString()

  for (let index = 0; index < rows.length; index++) {
    const rawRow = rows[index]
    const rowNumber = index + 2
    const payload = normalizarCargo(rawRow)
    const nome = payload.nome || ''
    const tipo = payload.tipo
    const matchKey = `${chaveTexto(nome)}|${tipo}`

    if (!nome) {
      results.push({ row: rowNumber, nome, tipo, action: 'error', error: 'Nome do cargo é obrigatório.' })
      continue
    }

    if (!VALID_TYPES.includes(tipo)) {
      results.push({ row: rowNumber, nome, tipo: '', action: 'error', error: 'Tipo inválido.' })
      continue
    }

    if (seenInFile.has(matchKey)) {
      results.push({ row: rowNumber, nome, tipo, action: 'ignored', error: 'Linha duplicada dentro do próprio arquivo.' })
      continue
    }
    seenInFile.add(matchKey)

    const existing = byNomeTipo.get(matchKey)
    if (existing) {
      const { data, error } = await supabase
        .from('cargos_publicos')
        .update({ ...payload, atualizado_em: now })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        results.push({ row: rowNumber, nome, tipo, action: 'error', error: error.message })
      } else {
        const updated = data as CargoPublico
        byNomeTipo.set(`${chaveTexto(updated.nome)}|${updated.tipo}`, updated)
        results.push({ row: rowNumber, nome, tipo, action: 'updated' })
      }
      continue
    }

    const { data, error } = await supabase
      .from('cargos_publicos')
      .insert({ ...payload, criado_em: now, atualizado_em: now })
      .select()
      .single()

    if (error) {
      results.push({ row: rowNumber, nome, tipo, action: 'error', error: error.message })
    } else {
      const created = data as CargoPublico
      byNomeTipo.set(`${chaveTexto(created.nome)}|${created.tipo}`, created)
      results.push({ row: rowNumber, nome, tipo, action: 'created' })
    }
  }

  revalidatePath('/admin/cargos')
  revalidatePath('/denunciar')

  return {
    success: !results.some((item) => item.action === 'error'),
    results,
    summary: {
      created: results.filter((item) => item.action === 'created').length,
      updated: results.filter((item) => item.action === 'updated').length,
      ignored: results.filter((item) => item.action === 'ignored').length,
      errors: results.filter((item) => item.action === 'error').length,
    },
  }
}
