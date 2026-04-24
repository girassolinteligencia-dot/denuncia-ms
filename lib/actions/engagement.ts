'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/email'

export async function registrarVoto(voto: string, comentario?: string) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('pesquisas_satisfacao')
      .insert([{ voto, comentario }])

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[engagement] Erro ao registrar voto:', err)
    return { success: false, error: err.message }
  }
}

export async function inscreverNewsletter(email: string) {
  const supabase = createAdminClient()
  const emailLimpo = email.toLowerCase().trim()
  
  try {
    const { error } = await supabase
      .from('newsletter_inscricoes')
      .insert([{ email: emailLimpo }])

    if (error) {
      if (error.code === '23505') { 
        return { success: true, message: 'Este e-mail já está em nossa base!' }
      }
      throw error
    }

    // Disparar E-mail de Boas-vindas
    try {
      await sendEmail({
        to: emailLimpo,
        subject: '🟢 Bem-vindo à Rede de Inteligência Cívica — DENUNCIA MS',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fcfcfc;border:1px solid #eee;border-radius:24px;overflow:hidden">
            <div style="background:#021691;padding:40px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px;font-style:italic;text-transform:uppercase;font-weight:900">DENUNCIA MS</h1>
              <p style="color:#4ecdc4;margin:10px 0 0 0;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Governança e Transparência</p>
            </div>
            
            <div style="padding:40px">
              <h2 style="color:#1a1a1a;margin-bottom:20px;font-size:20px">Seu apoio fortalece Mato Grosso do Sul.</h2>
              <p style="color:#444;line-height:1.7;font-size:15px">
                Olá! É um prazer ter você em nossa rede. A partir de agora, você receberá atualizações exclusivas sobre o impacto das denuncias cívicas e os resultados das nossas pesquisas de opinião pública.
              </p>
              
              <div style="background:#fff;border:2px border-style:dashed;border-color:#eee;padding:25px;border-radius:16px;margin:30px 0">
                <h3 style="color:#021691;margin-top:0;font-size:16px;text-transform:uppercase">O que fazemos?</h3>
                <p style="color:#666;font-size:14px;margin-bottom:0">
                  Somos uma plataforma <strong>independente</strong>. Nosso objetivo é dar voz ao cidadão, transformando denuncias em dados de inteligência que são encaminhados diretamente aos órgãos de controle competentes.
                </p>
              </div>

              <div style="text-align:center;margin-top:40px">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://denuncia-ms.vercel.app'}" 
                   style="display:inline-block;background:#021691;color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;box-shadow:0 10px 20px rgba(2, 22, 145, 0.2)">
                   Visitar Plataforma
                </a>
              </div>

              <hr style="border:none;border-top:1px solid #eee;margin:40px 0" />
              
              <p style="font-size:12px;color:#999;line-height:1.6;text-align:center">
                <strong>Privacidade:</strong> Seus dados são tratados com sigilo absoluto, em conformidade com a LGPD.<br />
                Este é um e-mail automático. Para falar com a ouvidoria, escreva para: <strong>denunciams.ouvidoria@gmail.com</strong>
              </p>
            </div>
          </div>
        `,
        text: `Bem-vindo à DENUNCIA MS. Acompanhe a transparência de Mato Grosso do Sul em nosso site.`
      })
    } catch (emailErr) {
      console.warn('[newsletter] Falha ao enviar e-mail de boas-vindas:', emailErr)
      // Não interrompemos o sucesso da inscrição se apenas o e-mail falhou
    }

    return { success: true }
  } catch (err: any) {
    console.error('[engagement] Erro ao inscrever newsletter:', err)
    return { success: false, error: err.message }
  }
}
