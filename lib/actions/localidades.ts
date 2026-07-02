'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import type { LocalidadePublica } from '@/types'

export async function searchLocalidadesPublicas(search: string) {
  const supabase = createAdminClient()
  const termo = search.trim().replace(/[%_,]/g, ' ')
  const cnpj = termo.replace(/\D/g, '')

  if (termo.length < 3 && cnpj.length < 3) {
    return { success: true, data: [] as LocalidadePublica[] }
  }

  const filtros = [
    `nome.ilike.%${termo}%`,
    `sigla.ilike.%${termo}%`,
    `municipio.ilike.%${termo}%`,
  ]

  if (cnpj.length >= 3) {
    filtros.push(`cnpj.ilike.%${cnpj}%`)
  }

  const { data, error } = await supabase
    .from('localidades_publicas')
    .select('id, nome, sigla, endereco, municipio, cnpj, telefone, ativo, criado_em, atualizado_em')
    .eq('ativo', true)
    .or(filtros.join(','))
    .order('nome', { ascending: true })
    .limit(20)

  if (error) return { success: false, error: error.message, data: [] as LocalidadePublica[] }
  return { success: true, data: data as LocalidadePublica[] }
}
