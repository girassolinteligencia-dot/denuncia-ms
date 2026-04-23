'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export async function registrarVoto(voto: string, comentario?: string) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('pesquisas_satisfacao')
      .insert([{ voto, comentario }])

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[engagement] Erro ao registrar voto:', err)
    return { success: false, error: err.message }
  }
}

export async function inscreverNewsletter(email: string) {
  const supabase = createAdminClient()
  try {
    // Tenta inserir, se já existir o UNIQUE email vai dar erro (que trataremos como sucesso de "já inscrito" ou erro real)
    const { error } = await supabase
      .from('newsletter_inscricoes')
      .insert([{ email: email.toLowerCase().trim() }])

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: true, message: 'Este e-mail já está em nossa base!' }
      }
      throw error
    }
    return { success: true }
  } catch (err: any) {
    console.error('[engagement] Erro ao inscrever newsletter:', err)
    return { success: false, error: err.message }
  }
}
