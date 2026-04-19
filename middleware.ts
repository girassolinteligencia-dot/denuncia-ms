import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  moderador: 1,
  admin: 2,
  superadmin: 3,
}

const ROUTE_PERMISSIONS: Record<string, UserRole> = {
  '/admin/configuracoes': 'superadmin',
  '/admin/usuarios': 'superadmin',
  '/admin/logs': 'superadmin',
  '/admin/categorias': 'admin',
  '/admin/integracoes': 'admin',
  '/admin/noticias': 'admin',
  '/admin/banners': 'admin',
  // rotas base — qualquer role admin
  '/admin': 'moderador',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apenas rotas /admin precisam de proteção
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redireciona para login se não autenticado
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Busca o role do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userRole = profile.role as UserRole
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0

  // Verifica permissão para a rota mais específica
  const rotaPermissao = encontrarRotaPermissao(pathname)
  const nivelNecessario = ROLE_HIERARCHY[rotaPermissao] ?? 1

  if (userLevel < nivelNecessario) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

function encontrarRotaPermissao(pathname: string): UserRole {
  // Encontra a rota mais específica que corresponde ao pathname
  const rotas = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length)

  for (const rota of rotas) {
    if (pathname.startsWith(rota)) {
      return ROUTE_PERMISSIONS[rota]
    }
  }

  return 'moderador'
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
