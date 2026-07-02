'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import type { CargoPublico, TipoCargoPublico } from '@/types'

export async function searchCargosPublicos(search: string, tipo?: Exclude<TipoCargoPublico, 'ambos'>) {
  const supabase = createAdminClient()
  const termo = search.trim().replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ')

  if (termo.length < 3) {
    return { success: true, data: [] as CargoPublico[] }
  }

  let query = supabase
    .from('cargos_publicos')
    .select('id, nome, tipo, setor, ativo, criado_em, atualizado_em')
    .eq('ativo', true)
    .or(`nome.ilike.%${termo}%,setor.ilike.%${termo}%`)
    .order('nome', { ascending: true })
    .limit(20)

  if (tipo) {
    query = query.in('tipo', [tipo, 'ambos'])
  }

  const { data, error } = await query

  if (error) return { success: false, error: error.message, data: [] as CargoPublico[] }
  return { success: true, data: data as CargoPublico[] }
}
