import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

const ADMIN_ROLES = new Set([
  'superadmin',
  'admin',
  'moderador',
  'comunicador',
  'gestor_cupula',
])

const MASTER_ROLES = new Set(['superadmin', 'admin'])

export async function getCurrentAdminProfile() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nome, role, permissoes, ativo')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile: profile
      ? {
          ...profile,
          email: user.email,
          role: String(profile.role || '').toLowerCase(),
        }
      : null,
  }
}

export async function requireAdminPage() {
  const { profile } = await getCurrentAdminProfile()
  const role = profile?.role || ''
  const isActive = profile?.ativo !== false

  if (!profile) {
    const pathname = headers().get('x-pathname') || '/admin'
    redirect(`/login?next=${encodeURIComponent(pathname)}`)
  }

  if (!isActive || !ADMIN_ROLES.has(role)) {
    redirect('/login?error=sem-acesso')
  }

  return profile
}

export async function requireAdminAction(options?: {
  masterOnly?: boolean
  permission?: string
}) {
  const { profile } = await getCurrentAdminProfile()
  const role = profile?.role || ''
  const isActive = profile?.ativo !== false
  const permissions = Array.isArray(profile?.permissoes) ? profile.permissoes : []

  if (!profile || !isActive || !ADMIN_ROLES.has(role)) {
    throw new Error('Nao autorizado')
  }

  if (options?.masterOnly && !MASTER_ROLES.has(role)) {
    throw new Error('Permissao insuficiente')
  }

  if (
    options?.permission &&
    !MASTER_ROLES.has(role) &&
    !permissions.includes(options.permission)
  ) {
    throw new Error('Permissao insuficiente')
  }

  return profile
}
