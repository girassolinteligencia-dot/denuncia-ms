import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Denuncia MS <onboarding@resend.dev>',
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

