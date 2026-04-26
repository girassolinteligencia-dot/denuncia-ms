import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Atualizar a sessão (refresh token)
  let response = await updateSession(request)

  // 2. Criar um novo conjunto de headers para que possamos passar o pathname para os Server Components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Adicionar os headers ao response mantendo os cookies do updateSession
  const nextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Copiar cookies do response do updateSession para o novo response
  response.cookies.getAll().forEach(cookie => {
    nextResponse.cookies.set(cookie.name, cookie.value)
  })

  return nextResponse
}

// Configurar para rodar em todas as rotas exceto assets estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
