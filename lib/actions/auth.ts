'use server'
import { createHash, randomInt } from 'crypto'
import { createAdminClient } from '../supabase-admin'
import { sendEmail } from '../email'

function sha256(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function solicitarCodigoOTP(emailRaw: string, nome: string) {
  const supabase = createAdminClient()
  const emailNorm  = emailRaw.toLowerCase().trim()
  const emailHash  = sha256(emailNorm)

  const { count } = await supabase
    .from('auth_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('email_hash', emailHash)
    .eq('is_used', false)
    .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

  if ((count ?? 0) >= 3) {
    return { success: false, error: 'Muitas tentativas. Aguarde 10 minutos.' }
  }

  // Invalidate any previous unused tokens for this email before issuing a new one
  await supabase
    .from('auth_tokens')
    .update({ is_used: true })
    .eq('email_hash', emailHash)
    .eq('is_used', false)

  const codigo     = String(randomInt(100000, 999999))
  const codigoHash = sha256(codigo)
  const expiresAt  = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { error } = await supabase.from('auth_tokens').insert({
    email_hash:  emailHash,
    codigo:      codigoHash,
    expires_at:  expiresAt,
    is_used:     false,
  })

  if (error) {
    console.error('[OTP] Erro ao inserir token:', error)
    return { success: false, error: 'Erro interno. Tente novamente.' }
  }

  await sendEmail({
    to:      emailNorm,
    subject: 'Seu código de verificação — DenunciaMS',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:18px;color:#021691;margin-bottom:8px">Código de verificação</h2>
        <p style="color:#444;font-size:15px;line-height:1.6">
          Olá${nome ? `, ${nome.split(' ')[0]}` : ''}! Use o código abaixo para confirmar
          sua identidade. Válido por <strong>15 minutos</strong>.
        </p>
        <div style="background:#f0f4ff;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:40px;font-weight:700;letter-spacing:10px;color:#021691">${codigo}</span>
        </div>
        <p style="color:#888;font-size:13px">
          Se você não solicitou este código, ignore este e-mail.
        </p>
      </div>
    `,
    text: `Seu código DenunciaMS: ${codigo}. Válido por 15 minutos.`,
  })

  return { success: true }
}

export async function validarOTP(emailRaw: string, codigoDigitado: string): Promise<boolean> {
  const supabase   = createAdminClient()
  const emailNorm  = emailRaw.toLowerCase().trim()
  const emailHash  = sha256(emailNorm)
  const codigoHash = sha256(codigoDigitado.trim())

  // maybeSingle + order avoids PGRST116 error when multiple tokens exist for same email
  const { data } = await supabase
    .from('auth_tokens')
    .select('id, expires_at, is_used')
    .eq('email_hash', emailHash)
    .eq('codigo', codigoHash)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return false

  await supabase.from('auth_tokens').update({ is_used: true }).eq('id', data.id)
  return true
}

export async function verificarOTP(emailRaw: string, codigoDigitado: string): Promise<{ success: boolean; error?: string }> {
  const supabase   = createAdminClient()
  const emailNorm  = emailRaw.toLowerCase().trim()
  const emailHash  = sha256(emailNorm)
  const codigoHash = sha256(codigoDigitado.trim())

  const { data } = await supabase
    .from('auth_tokens')
    .select('id, expires_at, is_used')
    .eq('email_hash', emailHash)
    .eq('codigo', codigoHash)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!data) return { success: false, error: 'Código inválido ou expirado.' }
  return { success: true }
}
