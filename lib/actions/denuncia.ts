'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { gerarProtocolo } from '@/lib/protocolo'
import { gerarPDFDenuncia } from '@/lib/pdf'
import { sendEmail } from '@/lib/email'
import { uploadArquivo } from '@/lib/storage'
import { validarOTP } from './auth'
import { createHash } from 'crypto'

function sha256Buffer(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex')
}

export async function registrarDenuncia(formData: any, arquivos: any[]) {
  const supabase = createAdminClient()

  if (!formData.anonima && formData.email) {
    const otpValido = await validarOTP(formData.email, formData.otpToken)
    if (!otpValido) throw new Error('Código de verificação inválido ou expirado.')
  }

  const { protocolo, chaveAcesso } = await gerarProtocolo()

  const arquivosUrls: string[] = []
  for (const arquivo of arquivos) {
    const url = await uploadArquivo(arquivo, protocolo)
    if (url) arquivosUrls.push(url)
  }

  const { data: denuncia, error: denErr } = await supabase
    .from('denuncias')
    .insert({
      protocolo,
      chave_acesso: chaveAcesso,
      categoria_id: formData.categoria_id,
      titulo:       formData.titulo,
      descricao_original: formData.descricao_original,
      local:        formData.local,
      cep:          formData.cep,
      bairro:       formData.bairro,
      cidade:       formData.cidade,
      data_ocorrido: formData.data_ocorrido,
      anonima:      formData.anonima ?? true,
      status:       'recebida',
    })
    .select('id, protocolo, criado_em')
    .single()

  if (denErr || !denuncia) {
    console.error('[denuncia] Erro ao persistir:', denErr)
    throw new Error('Não foi possível registrar a denúncia. Tente novamente.')
  }

  if (!formData.anonima && formData.nome && formData.email) {
    const { encryptData } = await import('@/lib/encrypt')
    await supabase.from('identidades').insert({
      denuncia_id: denuncia.id,
      nome_enc:    encryptData(formData.nome.trim()),
      email_enc:   encryptData(formData.email.toLowerCase().trim()),
      email_hash:  createHash('sha256').update(formData.email.toLowerCase().trim()).digest('hex'),
    })
  }

  try {
    const pdfBuffer = await gerarPDFDenuncia({
      protocolo,
      categoria:  formData.categoria_id,
      descricao:  formData.descricao_original,
      local:      formData.local,
      anonima:    formData.anonima,
      criado_em:  denuncia.criado_em,
    })

    const pdfHash = sha256Buffer(pdfBuffer)

    await supabase.from('pdf_assinaturas').insert({
      denuncia_id: denuncia.id,
      protocolo,
      sha256:      pdfHash,
      gerado_em:   new Date().toISOString(),
    })

    await supabase.from('despacho_queue').insert({
      denuncia_id: denuncia.id,
      pdf_base64:  pdfBuffer.toString('base64'),
      tentativas:  0,
      status:      'pendente',
      criado_em:   new Date().toISOString(),
    })

  } catch (pdfErr) {
    console.error('[denuncia] Erro no PDF:', pdfErr)
    await supabase.from('despacho_queue').insert({
      denuncia_id: denuncia.id,
      tentativas:  0,
      status:      'pendente_pdf',
      criado_em:   new Date().toISOString(),
    })
  }

  if (!formData.anonima && formData.email) {
    await sendEmail({
      to:      formData.email,
      subject: `Sua denúncia foi registrada — Protocolo ${protocolo}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#021691">Denúncia registrada com sucesso</h2>
          <div style="background:#f0f4ff;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
            <span style="font-size:28px;font-weight:700;letter-spacing:4px;color:#021691">${protocolo}</span>
          </div>
          <p style="color:#888;font-size:13px">Guarde este número para acompanhar o andamento da sua denúncia.</p>
        </div>
      `,
      text: `Protocolo da sua denúncia: ${protocolo}`,
    }).catch(e => console.error('[denuncia] Erro ao enviar e-mail:', e))
  }

  return { success: true, protocolo, chaveAcesso }
}
