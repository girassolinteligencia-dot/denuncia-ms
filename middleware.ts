import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const IP_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
  'true-client-ip',
  'x-client-ip',
]

export async function middleware(request: NextRequest) {
  const isDenunciaRoute =
    request.nextUrl.pathname.startsWith('/api/denuncia') ||
    request.nextUrl.pathname.startsWith('/denunciar')

  if (isDenunciaRoute) {
    const requestHeaders = new Headers(request.headers)
    IP_HEADERS.forEach(h => requestHeaders.delete(h))

    const response = await updateSession(request)

    IP_HEADERS.forEach(h => response.headers.delete(h))

    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
