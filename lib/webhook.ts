import { decryptData } from './encrypt'
import { createAdminClient } from './supabase-admin'
import { sendEmail } from './email'

interface WebhookParams {
  url: string
  payload: any
  authType?: 'none' | 'bearer' | 'basic' | 'apikey'
  authDataCrypted?: string
  timeout?: number
  retryMax?: number
}

export async function dispatchWebhook(params: WebhookParams): Promise<boolean> {
  const { url, payload, authType = 'none', authDataCrypted, timeout = 8000, retryMax = 3 } = params

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (authType !== 'none' && authDataCrypted) {
    try {
      const authRaw = decryptData(authDataCrypted)
      if (authType === 'bearer') headers['Authorization'] = `Bearer ${authRaw}`
      else if (authType === 'basic') headers['Authorization'] = `Basic ${Buffer.from(authRaw).toString('base64')}`
      else if (authType === 'apikey') {
        const [name, val] = authRaw.split(':')
        if (name && val) headers[name.trim()] = val.trim()
      }
    } catch {
      throw new Error('Falha ao descriptografar credenciais do webhook')
    }
  }

  let attempt = 0
  while (attempt <= retryMax) {
    try {
      const controller = new AbortController()
      const tId = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(url, {
        method: 'POST', headers,
        body: JSON.stringify({ ...payload, _meta: { timestamp: new Date().toISOString(), attempt: attempt + 1 } }),
        signal: controller.signal,
      })
      clearTimeout(tId)
      if (res.ok) return true
      throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      attempt++
      if (attempt > retryMax) throw err
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
    }
  }
  return false
}

export async function processarFilaDespacho(limite = 10) {
  const supabase = createAdminClient()

  const { data: itens } = await supabase
    .from('despacho_queue')
    .select('id, denuncia_id, pdf_base64, tentativas, status, denuncias(protocolo, categoria_id, local, anonima)')
    .in('status', ['pendente', 'pendente_pdf', 'erro'])
    .lt('tentativas', 5)
    .order('criado_em', { ascending: true })
    .limit(limite)

  if (!itens || itens.length === 0) return { processados: 0, falhas: 0 }

  let processados = 0
  let falhas = 0

  for (const item of itens) {
    const den = item.denuncias as any
    if (!den) continue

    try {
      await supabase.from('despacho_queue')
        .update({ tentativas: item.tentativas + 1, status: 'processando' })
        .eq('id', item.id)

      await sendEmail({
        to:      den.orgao_destino_email,
        subject: `[DenunciaMS] ${den.protocolo} — ${den.categoria_id}`,
        html: `<div style="font-family:sans-serif;padding:24px">
          <h2 style="color:#021691">Nova Denúncia — ${den.protocolo}</h2>
          <p>Categoria: ${den.categoria_id}</p>
          <p>Local: ${den.local ?? 'Não informado'}</p>
          <p>Tipo: ${den.anonima ? 'Anônima' : 'Identificada'}</p>
        </div>`,
        text: `Nova denúncia. Protocolo: ${den.protocolo}`,
        attachments: item.pdf_base64 ? [{
          filename: `denuncia-${den.protocolo}.pdf`,
          content: item.pdf_base64,
          encoding: 'base64',
          content_type: 'application/pdf',
        }] : undefined,
      })

      await supabase.from('despacho_queue')
        .update({ status: 'despachado', despachado_em: new Date().toISOString() })
        .eq('id', item.id)

      await supabase.from('denuncias').update({ status: 'em_analise' }).eq('id', item.denuncia_id)
      processados++

    } catch (err) {
      console.error(`[despacho] Falha item ${item.id}:`, err)
      falhas++
      await supabase.from('despacho_queue')
        .update({ status: item.tentativas + 1 >= 5 ? 'falha_definitiva' : 'erro', ultimo_erro: String(err) })
        .eq('id', item.id)
    }
  }

  return { processados, falhas }
}
