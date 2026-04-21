// middleware.ts — RAIZ do projeto (não confundir com utils/supabase/middleware.ts)
// Arquivo NOVO — crie na raiz ao lado de next.config.js
//
// Responsabilidades:
//   1. Remove headers de IP antes de chegar nas API routes (LGPD Art. 5º)
//   2. Delega o refresh de sessão Supabase ao helper existente

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // seu helper existente

// Headers que expõem o IP real do visitante
const IP_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
  'true-client-ip',
  'x-client-ip',
  'x-cluster-client-ip',
]

export async function middleware(request: NextRequest) {
  // --- 1. Anonimizar IP em rotas de denúncia ---
  const isDenunciaRoute = request.nextUrl.pathname.startsWith('/api/denuncia')
    || request.nextUrl.pathname.startsWith('/denunciar')

  if (isDenunciaRoute) {
    // Clona os headers e remove identificadores de rede
    const headers = new Headers(request.headers)
    IP_HEADERS.forEach(h => headers.delete(h))

    // Reconstrói a request sem os headers de IP
    const anonRequest = new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      duplex: 'half',
    } as RequestInit)

    // Delega para o updateSession do Supabase com a request anonimizada
    return await updateSession(anonRequest as unknown as NextRequest)
  }

  // --- 2. Para todas as outras rotas: apenas refresh de sessão ---
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Exclui arquivos estáticos e rotas internas do Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
