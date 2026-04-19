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
