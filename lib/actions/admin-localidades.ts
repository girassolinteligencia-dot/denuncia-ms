'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { LocalidadePublica } from '@/types'

export interface ImportLocalidadeRow {
  nome?: string
  sigla?: string
  endereco?: string
  municipio?: string
  cnpj?: string
  telefone?: string
  ativo?: boolean | string | number | null
}

export interface ImportLocalidadeResult {
  row: number
  nome: string
  municipio: string
  action: 'created' | 'updated' | 'ignored' | 'error'
  error?: string
}

function normalizarLocalidade(input: Partial<LocalidadePublica>) {
  return {
    nome: input.nome?.trim(),
    sigla: input.sigla?.trim() || null,
    endereco: input.endereco?.trim() || null,
    municipio: input.municipio?.trim(),
    cnpj: input.cnpj?.replace(/\D/g, '') || null,
    telefone: input.telefone?.trim() || null,
    ativo: input.ativo ?? true,
    atualizado_em: new Date().toISOString(),
  }
}

function normalizarTexto(value: unknown) {
  return String(value || '').trim()
}

function normalizarAtivo(value: ImportLocalidadeRow['ativo']) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0

  const normalized = normalizarTexto(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (!normalized) return true
  return ['true', 'sim', 's', '1', 'ativo', 'ativa', 'yes', 'y'].includes(normalized)
}

function chaveTexto(value: string | null | undefined) {
  return normalizarTexto(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizarLinhaImportacao(row: ImportLocalidadeRow) {
  return normalizarLocalidade({
    nome: normalizarTexto(row.nome),
    sigla: normalizarTexto(row.sigla),
    endereco: normalizarTexto(row.endereco),
    municipio: normalizarTexto(row.municipio),
    cnpj: normalizarTexto(row.cnpj),
    telefone: normalizarTexto(row.telefone),
    ativo: normalizarAtivo(row.ativo),
  })
}

export async function listLocalidadesPublicas() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('localidades_publicas')
    .select('*')
    .order('nome', { ascending: true })

  if (error) return { success: false, error: error.message, data: [] }
  return { success: true, data: data as LocalidadePublica[] }
}

export async function saveLocalidadePublica(input: Partial<LocalidadePublica>) {
  const supabase = createAdminClient()
  const payload = normalizarLocalidade(input)

  if (!payload.nome || !payload.municipio) {
    return { success: false, error: 'Nome e município são obrigatórios.' }
  }

  const query = input.id
    ? supabase.from('localidades_publicas').update(payload).eq('id', input.id).select().single()
    : supabase.from('localidades_publicas').insert({ ...payload, criado_em: new Date().toISOString() }).select().single()

  const { data, error } = await query

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/localidades')
  revalidatePath('/denunciar')
  return { success: true, data: data as LocalidadePublica }
}

export async function deleteLocalidadePublica(id: string) {
  const supabase = createAdminClient()

  const { count, error: countError } = await supabase
    .from('denuncias')
    .select('*', { count: 'exact', head: true })
    .eq('localidade_publica_id', id)

  if (countError) return { success: false, error: countError.message }

  if ((count || 0) > 0) {
    const { error } = await supabase
      .from('localidades_publicas')
      .update({ ativo: false, atualizado_em: new Date().toISOString() })
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/localidades')
    revalidatePath('/denunciar')
    return { success: true, deactivated: true }
  }

  const { error } = await supabase
    .from('localidades_publicas')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/localidades')
  revalidatePath('/denunciar')
  return { success: true }
}

export async function importLocalidadesPublicas(rows: ImportLocalidadeRow[]) {
  const supabase = createAdminClient()
  const results: ImportLocalidadeResult[] = []

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, error: 'Nenhuma linha válida foi enviada para importação.', results }
  }

  if (rows.length > 2000) {
    return { success: false, error: 'O limite por importação é de 2.000 linhas.', results }
  }

  const { data: existentes, error: existingError } = await supabase
    .from('localidades_publicas')
    .select('*')

  if (existingError) return { success: false, error: existingError.message, results }

  const byCnpj = new Map<string, LocalidadePublica>()
  const byNomeMunicipio = new Map<string, LocalidadePublica>()

  for (const item of (existentes || []) as LocalidadePublica[]) {
    if (item.cnpj) byCnpj.set(item.cnpj.replace(/\D/g, ''), item)
    byNomeMunicipio.set(`${chaveTexto(item.nome)}|${chaveTexto(item.municipio)}`, item)
  }

  const seenInFile = new Set<string>()
  const now = new Date().toISOString()

  for (let index = 0; index < rows.length; index++) {
    const rawRow = rows[index]
    const rowNumber = index + 2
    const payload = normalizarLinhaImportacao(rawRow)
    const nome = payload.nome || ''
    const municipio = payload.municipio || ''
    const cnpj = payload.cnpj || ''
    const matchKey = cnpj || `${chaveTexto(nome)}|${chaveTexto(municipio)}`

    if (!nome || !municipio) {
      results.push({ row: rowNumber, nome, municipio, action: 'error', error: 'Nome e município são obrigatórios.' })
      continue
    }

    if (seenInFile.has(matchKey)) {
      results.push({ row: rowNumber, nome, municipio, action: 'ignored', error: 'Linha duplicada dentro do próprio arquivo.' })
      continue
    }
    seenInFile.add(matchKey)

    const existing = cnpj
      ? byCnpj.get(cnpj)
      : byNomeMunicipio.get(`${chaveTexto(nome)}|${chaveTexto(municipio)}`)

    if (existing) {
      const { data, error } = await supabase
        .from('localidades_publicas')
        .update({ ...payload, atualizado_em: now })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        results.push({ row: rowNumber, nome, municipio, action: 'error', error: error.message })
      } else {
        const updated = data as LocalidadePublica
        if (updated.cnpj) byCnpj.set(updated.cnpj, updated)
        byNomeMunicipio.set(`${chaveTexto(updated.nome)}|${chaveTexto(updated.municipio)}`, updated)
        results.push({ row: rowNumber, nome, municipio, action: 'updated' })
      }
      continue
    }

    const { data, error } = await supabase
      .from('localidades_publicas')
      .insert({ ...payload, criado_em: now, atualizado_em: now })
      .select()
      .single()

    if (error) {
      results.push({ row: rowNumber, nome, municipio, action: 'error', error: error.message })
    } else {
      const created = data as LocalidadePublica
      if (created.cnpj) byCnpj.set(created.cnpj, created)
      byNomeMunicipio.set(`${chaveTexto(created.nome)}|${chaveTexto(created.municipio)}`, created)
      results.push({ row: rowNumber, nome, municipio, action: 'created' })
    }
  }

  revalidatePath('/admin/localidades')
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
