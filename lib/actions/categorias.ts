'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { encryptData } from '@/lib/encrypt'

/**
 * Salva ou atualiza uma categoria.
 */
export async function saveCategoria(data: any) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('categorias')
    .upsert(data)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categorias')
  return { success: true }
}

/**
 * Salva as configurações de integração de uma categoria.
 */
export async function saveIntegracaoDestino(data: any) {
  const supabase = createAdminClient()

  // Se houver dados de autenticação de webhook, precisamos criptografar
  if (data.webhook_auth_dados && data.webhook_auth_tipo !== 'none') {
    data.webhook_auth_dados = await encryptData(data.webhook_auth_dados)
  }

  const { data: existings } = await supabase
    .from('integracoes_destino')
    .select('id')
    .eq('categoria_id', data.categoria_id)

  if (existings && existings.length > 0) {
    // Auto-repair: apagar duplicatas se o bug anterior as gerou
    if (existings.length > 1) {
      const idsToDelete = existings.slice(1).map(e => e.id)
      await supabase.from('integracoes_destino').delete().in('id', idsToDelete)
    }
    
    if (!data.id) {
      data.id = existings[0].id
    }
  }

  const { error } = await supabase
    .from('integracoes_destino')
    .upsert(data)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/categorias/${data.categoria_id}/integracao`)
  revalidatePath('/admin/integracoes')
  
  return { success: true }
}

/**
 * Deleta uma categoria.
 */
export async function deleteCategoria(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categorias')
  return { success: true }
}
