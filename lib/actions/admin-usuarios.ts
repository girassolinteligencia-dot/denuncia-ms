'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { UserRole, Profile } from '@/types'

/**
 * Busca todos os usuários/perfis do sistema
 */
export async function getUsuarios() {
  const supabase = createAdminClient()

  try {
    const { data: usuarios, error } = await supabase
      .from('profiles')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) throw error
    return { success: true, data: usuarios as Profile[] }
  } catch (err: any) {
    console.error('Erro ao buscar usuários:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Atualiza o papel (role) de um usuário
 */
export async function updateUsuarioRole(id: string, role: UserRole) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Remove/Deleta um perfil de usuário
 * Nota: Isso não deleta da tabela auth.users (requer admin auth api), 
 * mas remove o perfil e impede o acesso se o RLS checar a tabela profiles.
 */
export async function deleteUsuario(id: string) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
