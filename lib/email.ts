'use server'

import { Resend } from 'resend'

// Inicialização lazy para evitar erros se importado no cliente acidentalmente
let resendInstance: Resend | null = null

function getResend() {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      // No servidor, isso deve estar configurado.
      // Se chegar aqui no cliente, retornamos um proxy ou falhamos silenciosamente para não quebrar o app
      if (typeof window !== 'undefined') {
        console.warn('[Email] Tentativa de inicializar Resend no cliente bloqueada.')
        return null
      }
      throw new Error('RESEND_API_KEY não configurada no servidor.')
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

interface EmailParams {
  to: string | string[]
  subject: string
  text: string
  html?: string
  attachments?: { filename: string; content: Buffer }[]
}

/**
 * Envia e-mail via Resend com suporte a anexos.
 */
export async function sendEmail(params: EmailParams) {
  const { to, subject, text, html, attachments } = params

  try {
    const resend = getResend()
    if (!resend) throw new Error('Serviço de e-mail indisponível no cliente.')

    const fromEmail = process.env.EMAIL_FROM || 'Denuncia MS <onboarding@resend.dev>'
    
    console.log(`[Email] Tentando enviar para: ${to} via ${fromEmail}`)

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || text,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
      }))
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Falha ao enviar e-mail:', error)
    throw error
  }
}

