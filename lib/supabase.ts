import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso no browser e em Server Components de leitura.
 * Utiliza a ANON KEY — sujeita às políticas de RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
