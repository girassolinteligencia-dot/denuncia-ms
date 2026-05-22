import type { Profile, UserRole } from '@/types'

export const FULL_ADMIN_PERMISSIONS = [
  'dashboard',
  'denuncias',
  'categorias',
  'comunicacao',
  'conteudo',
  'usuarios',
  'configuracoes',
  'seguranca',
  'saude',
  'integracoes',
  'logs',
  'noticias',
  'banners',
  'enquetes',
  'privacidade',
]

export const FULL_ADMIN_EMAILS = [
  'plataformainteligente@gmail.com',
  'paulofernandogarciacardoso@gmail.com',
  'paulofernandogarcardoso@gmail.com',
  'pastygomez@gmail.com',
]

export function normalizeRole(role?: string | null) {
  const normalized = String(role || '').trim().toLowerCase()
  return normalized === 'superadm' ? 'superadmin' : normalized
}

export function isFullAdminRole(role?: string | null) {
  const normalized = normalizeRole(role)
  return normalized === 'superadmin' || normalized === 'admin' || normalized === 'administrador'
}

export function isFullAdminEmail(email?: string | null) {
  return FULL_ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase())
}

export function hasAdminPermission(
  profile: Pick<Profile, 'role' | 'email' | 'permissoes'> | null | undefined,
  permission: string,
) {
  if (!profile) return false
  if (isFullAdminRole(profile.role) || isFullAdminEmail(profile.email)) return true
  return Array.isArray(profile.permissoes) && profile.permissoes.includes(permission)
}

export function getPermissionsForRole(role: UserRole | string) {
  const normalized = normalizeRole(role)

  if (normalized === 'superadmin' || normalized === 'admin') {
    return FULL_ADMIN_PERMISSIONS
  }

  if (normalized === 'moderador') {
    return ['dashboard', 'denuncias', 'categorias', 'comunicacao']
  }

  if (normalized === 'comunicador') {
    return ['dashboard', 'comunicacao', 'conteudo', 'noticias', 'banners', 'enquetes']
  }

  if (normalized === 'gestor_cupula') {
    return ['dashboard', 'denuncias', 'categorias', 'seguranca', 'saude', 'integracoes']
  }

  return []
}
