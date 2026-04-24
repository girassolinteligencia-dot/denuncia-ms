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
        icon_name: updates.icon_name,
        slug: updates.slug,
        email_destino: updates.email_destino,
        instrucao_publica: updates.instrucao_publica,
        aviso_legal: updates.aviso_legal,
        template_descricao: updates.template_descricao,
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
    const error = err as any
    console.error('Erro ao atualizar categoria:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cria uma nova categoria
 */
export async function createCategoria(categoria: Partial<Categoria>) {
  const supabase = createAdminClient()

  try {
    // Remove o ID se for uma string vazia para o Supabase gerar um novo UUID
    const { id, ...saveData } = categoria
    
    // Fallback de slug se ainda estiver vazio
    const finalSlug = saveData.slug || saveData.label?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `cat-${Date.now()}`

    const { data, error } = await supabase
      .from('categorias')
      .insert({
        ...saveData,
        slug: finalSlug,
        ativo: true,
        ordem: saveData.ordem || 0,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'Já existe uma categoria com este Identificador Único (Slug). Escolha outro.' }
      }
      throw error
    }

    revalidatePath('/admin/categorias')
    revalidatePath('/denunciar')
    return { success: true, data }
  } catch (err) {
    const error = err as any
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
