'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { LocalidadePublica } from '@/types'

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

