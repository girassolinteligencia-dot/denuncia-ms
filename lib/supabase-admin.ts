import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com Service Role.
 * ⚠️  USAR SOMENTE EM ROUTE HANDLERS E SERVER ACTIONS.
 * Nunca expor ao browser — bypassa RLS completamente.
 */
export function createAdminClient() {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseKey) {
    throw new Error('Chave Supabase não configurada')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
