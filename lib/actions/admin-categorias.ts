'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { Categoria } from '@/types'

/**
 * Atualiza uma categoria de denúncia
 */
export async function updateCategoria(id: string, updates: Partial<Categoria>) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('categorias')
      .update({
        label: updates.label,
        emoji: updates.emoji,
        slug: updates.slug,
        email_destino: updates.email_destino,
        instrucao_publica: updates.instrucao_publica,
        aviso_legal: updates.aviso_legal,
        ativo: updates.ativo,
        ordem: updates.ordem,
        bloco: updates.bloco,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/categorias')
    revalidatePath('/denunciar')
    return { success: true, data }
  } catch (err) {
    const error = err as Error
    console.error('Erro ao atualizar template:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cria uma nova categoria
 */
export async function createCategoria(categoria: Partial<Categoria>) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('categorias')
      .insert({
        ...categoria,
        slug: categoria.slug || categoria.label?.toLowerCase().replace(/\s+/g, '-'),
        ativo: true,
        ordem: 0 // Mock ordem inicial
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/categorias')
    revalidatePath('/denunciar')
    return { success: true, data }
  } catch (err) {
    const error = err as Error
    console.error('Erro ao criar categoria:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exclui uma categoria (Seguro)
 */
export async function deleteCategoria(id: string) {
  const supabase = createAdminClient()

  try {
    // Verificar se existem denúncias vinculadas
    const { count } = await supabase
      .from('denuncias')
      .select('*', { count: 'exact', head: true })
      .eq('categoria_id', id)

    if (count && count > 0) {
      return { success: false, error: 'Não é possível excluir uma categoria que já possui denúncias vinculadas. Desative-a em vez de excluir.' }
    }

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/categorias')
    revalidatePath('/denunciar')
    return { success: true }
  } catch (err) {
    const error = err as Error
    console.error('Erro ao excluir categoria:', error)
    return { success: false, error: error.message }
  }
}
