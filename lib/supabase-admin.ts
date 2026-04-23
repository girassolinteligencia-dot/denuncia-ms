import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com Service Role.
 * ⚠️  USAR SOMENTE EM ROUTE HANDLERS E SERVER ACTIONS.
 * Nunca expor ao browser — bypassa RLS completamente.
 */
export function createAdminClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Limpeza automática da URL para evitar erros de "Invalid Path"
  if (supabaseUrl) {
    supabaseUrl = supabaseUrl.replace(/\/$/, '') // Remove barra final
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1$/, '') // Remove sufixo rest/v1 se o user colou errado
  }

  if (!supabaseUrl || !supabaseUrl.startsWith('https')) {
    throw new Error('URL do Supabase inválida ou não configurada (NEXT_PUBLIC_SUPABASE_URL)')
  }

  if (!supabaseKey) {
    throw new Error('Service Role Key do Supabase não configurada (SUPABASE_SERVICE_ROLE_KEY)')
  }

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
