'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const NEWSLETTER_TABLES = ['newsletter_inscricoes', 'newsletter_subscriptions'] as const
const SCHEMA_CACHE_ERROR_CODES = ['42P01', 'PGRST202', 'PGRST205'] as const

export async function assinarNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'E-mail inválido.' }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    let lastError: any = null
    let alreadyRegistered = false
    const emailLimpo = email.toLowerCase().trim()

    const rpcResult = await supabase.rpc('inscrever_newsletter', { p_email: emailLimpo })

    if (!rpcResult.error) {
      const payload = rpcResult.data as { success?: boolean; message?: string; already_registered?: boolean } | null

      if (payload?.success === false) {
        return { success: false, message: payload.message || 'Não foi possível processar sua assinatura.' }
      }

      return {
        success: true,
        message: payload?.message || 'Assinatura realizada com sucesso!',
      }
    }

    if (!SCHEMA_CACHE_ERROR_CODES.includes(rpcResult.error.code as any)) {
      throw rpcResult.error
    }

    for (const table of NEWSLETTER_TABLES) {
      const { error } = await supabase
        .from(table)
        .insert([{ email: emailLimpo }])

      if (!error) {
        lastError = null
        break
      }

      if (error.code === '23505') {
        alreadyRegistered = true
        lastError = null
        break
      }

      lastError = error

      if (!SCHEMA_CACHE_ERROR_CODES.includes(error.code as any)) break
    }

    if (alreadyRegistered) {
      return { success: true, message: 'Você já está inscrito em nosso boletim!' }
    }

    if (lastError) {
      console.error('Erro ao assinar newsletter:', lastError)
      return {
        success: false,
        message: SCHEMA_CACHE_ERROR_CODES.includes(lastError.code as any)
          ? 'O cadastro de newsletter precisa da migration do banco aplicada no Supabase.'
          : 'Ocorreu um erro ao processar sua assinatura.',
      }
    }

    return { success: true, message: 'Assinatura realizada com sucesso!' }
  } catch (error) {
    console.error('Erro catch newsletter:', error)
    return { success: false, message: 'Falha na conexão com o servidor.' }
  }
}
