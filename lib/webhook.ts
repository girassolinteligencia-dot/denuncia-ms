import { decryptData } from './encrypt'

interface WebhookParams {
  url: string
  payload: any
  headers?: Record<string, string>
  authType?: 'none' | 'bearer' | 'basic' | 'apikey'
  authDataCrypted?: string
  retryMax?: number
  timeout?: number
}

/**
 * Dispara um webhook com lógica de retry exponencial e timeout.
 */
export async function dispatchWebhook(params: WebhookParams): Promise<{ status: number; body: string }> {
  const { 
    url, 
    payload, 
    headers = {}, 
    authType = 'none', 
    authDataCrypted, 
    retryMax = 3, 
    timeout = 30000 
  } = params

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'DenunciaMS-Webhook-Dispatcher/1.0',
    ...headers,
  }

  // Descriptografa e aplica autenticação se necessário
  if (authType !== 'none' && authDataCrypted) {
    try {
      const authRaw = await decryptData(authDataCrypted)
      
      if (authType === 'bearer') {
        finalHeaders['Authorization'] = `Bearer ${authRaw}`
      } else if (authType === 'basic') {
        const encoded = Buffer.from(authRaw).toString('base64')
        finalHeaders['Authorization'] = `Basic ${encoded}`
      } else if (authType === 'apikey') {
        // Formato esperado em apikey: HeaderName:Value
        const [name, val] = authRaw.split(':')
        if (name && val) finalHeaders[name] = val
      }
    } catch (err) {
      console.error('Erro ao descriptografar credenciais do webhook:', err)
      throw new Error('Falha na autenticação do webhook')
    }
  }

  let attempt = 0
  let lastError: any = null

  while (attempt <= retryMax) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers: finalHeaders,
        body: JSON.stringify({
          ...payload,
          _meta: {
            timestamp: new Date().toISOString(),
            attempt: attempt + 1,
            version: '2.0'
          }
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const body = await response.text()

      if (response.ok) {
        return { status: response.status, body }
      }
      
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 100)}`)
    } catch (err: any) {
      lastError = err
      attempt++
      
      if (attempt <= retryMax) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Falha no disparo do webhook após retentativas')
}
