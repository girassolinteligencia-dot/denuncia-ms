'use server'

import { createAdminClient } from '../supabase-admin'
import { sendEmail } from '../email'

export async function solicitarCodigoOTP(email: string, nome: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'E-mail inválido fornecido.' }
  }

  try {
    const supabase = createAdminClient()

    // Gera um código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Calcula 15 minutos no futuro ISO string
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Insere no banco
    const { error: dbError } = await supabase
      .from('auth_tokens')
      .insert({
        email,
        codigo,
        expires_at: expiresAt
      })

    if (dbError) {
      console.error('Erro ao salvar token OTP no banco:', dbError)
      return { success: false, error: 'Falha interna ao gerar código de segurança.' }
    }

    // Dispara via Resend
    const conteudoHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333;">
         <h2 style="color: #0E7490;">Código de Segurança - Plataforma DenunciaMS</h2>
         <p>Olá, ${nome}.</p>
         <p>Você (ou alguém) está tentando se identificar para protocolar uma denúncia na nossa plataforma.</p>
         <p>Este é o seu código de segurança único (válido por 15 minutos):</p>
         <div style="background-color: #F1F5F9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 5px;">${codigo}</strong>
         </div>
         <p style="font-size: 12px; color: #666;">Atenção: A Equipe da plataforma DenunciaMS resguarda seu sigilo. Jamais compartilhe este número com terceiros.</p>
      </div>
    `

    try {
      await sendEmail({
        to: email,
        subject: 'Código de Validação de Identidade - DenunciaMS',
        html: conteudoHtml,
        text: `Seu código de validação é: ${codigo}. Não compartilhe com ninguém.`
      })
    } catch (emailError) {
       console.error('Erro disparando e-mail do resend:', emailError)
       return { success: false, error: 'O sistema gerou o código, mas a operadora de e-mail falhou em enviá-lo.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Erro na solicitação de OTP:', err)
    return { success: false, error: 'Erro não mapeado durante o envio de e-mail.' }
  }
}
