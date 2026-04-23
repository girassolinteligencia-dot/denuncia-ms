import { NextResponse } from 'next/server'
import { limparArquivosOrfaos } from '@/lib/actions/cleanup'

/**
 * Endpoint para acionamento via Vercel Cron
 * curl -X GET "http://localhost:3000/api/cron/cleanup-storage" -H "Authorization: Bearer CRON_SECRET"
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  // Validação simples de segurança (Configurar CRON_SECRET no painel Vercel)
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const result = await limparArquivosOrfaos()
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
