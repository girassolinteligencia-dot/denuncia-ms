import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com Service Role.
 * ⚠️  USAR SOMENTE EM ROUTE HANDLERS E SERVER ACTIONS.
 * Nunca expor ao browser — bypassa RLS completamente.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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
