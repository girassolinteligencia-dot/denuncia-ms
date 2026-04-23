import { NextRequest, NextResponse } from 'next/server'
import { processarFilaDespacho } from '@/lib/webhook'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-cron-secret')
  const secret = process.env.CRON_SECRET
  if (!secret || !auth || auth !== secret) {
    return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  }
  try {
    const resultado = await processarFilaDespacho(10)
    return NextResponse.json({ ok: true, ...resultado })
  } catch (err) {
    console.error('[worker/despacho]', err)
    return NextResponse.json({ ok: false, erro: String(err) }, { status: 500 })
  }
}
