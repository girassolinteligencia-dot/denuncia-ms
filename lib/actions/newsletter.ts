'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function assinarNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'E-mail inválido.' }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Tentar inserir o e-mail
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert([{ email }])

    if (error) {
      // Se o erro for de duplicidade (23505), avisamos que já está cadastrado
      if (error.code === '23505') {
        return { success: true, message: 'Você já está inscrito em nosso boletim!' }
      }
      console.error('Erro ao assinar newsletter:', error)
      return { success: false, message: 'Ocorreu um erro ao processar sua assinatura.' }
    }

    return { success: true, message: 'Assinatura realizada com sucesso!' }
  } catch (error) {
    console.error('Erro catch newsletter:', error)
    return { success: false, message: 'Falha na conexão com o servidor.' }
  }
}
