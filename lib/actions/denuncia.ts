'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { SubmitDenunciaRequest } from '@/types'
import { gerarProtocolo } from '@/lib/protocolo'
import { gerarPDFDenuncia } from '@/lib/pdf'
import { sendEmail } from '@/lib/email'
import { validarOTP } from './auth'
import { createHash } from 'crypto'

function sha256Buffer(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex')
}

export async function registrarDenuncia(formData: SubmitDenunciaRequest, arquivos: { name: string, type: string, content: string }[]) {
  const supabase = createAdminClient()
  console.log('[denuncia] Iniciando registro:', { categoria: formData.categoria_id, titulo: formData.titulo })

  try {
    // 1. Validação de E-mail e OTP
    if (!formData.email) return { success: false, error: 'O e-mail de identificação é obrigatório.' }
    
    console.log('[denuncia] Validando OTP para:', formData.email)
    const emailHash = createHash('sha256').update(formData.email.toLowerCase().trim()).digest('hex')
    
    const { data: banido } = await supabase
      .from('blacklist_usuarios')
      .select('id')
      .eq('email_hash', emailHash)
      .maybeSingle()

    if (banido) return { success: false, error: 'Acesso suspenso por violação dos termos.' }

    const otpValido = await validarOTP(formData.email, formData.otpToken || '')
    if (!otpValido) return { success: false, error: 'Código de verificação inválido ou expirado.' }

    // 2. Gerar Protocolo
    console.log('[denuncia] Gerando protocolo...')
    const { protocolo, chaveAcesso } = await gerarProtocolo()

    // 3. Upload de Arquivos
    const arquivosUrls: string[] = []
    if (arquivos && arquivos.length > 0) {
      console.log(`[denuncia] Fazendo upload de ${arquivos.length} arquivos...`)
      for (const file of arquivos) {
        try {
          const buffer = Buffer.from(file.content, 'base64')
          const ext = file.name.split('.').pop()
          const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
          
          const { error: uploadError } = await supabase.storage
            .from('denuncias')
            .upload(path, buffer, { contentType: file.type })

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('denuncias').getPublicUrl(path)
            arquivosUrls.push(urlData.publicUrl)
          }
        } catch (fErr) {
          console.error('[denuncia] Erro no arquivo:', file.name, fErr)
        }
      }
    }

    // 4. Buscar Categoria
    const { data: catData } = await supabase
      .from('categorias')
      .select('label, slug')
      .eq('id', formData.categoria_id)
      .single()

    // 5. Persistir Denúncia
    console.log('[denuncia] Salvando no banco de dados...')
    const localCompleto = [formData.local, formData.numero, formData.bairro, formData.cidade]
      .filter(Boolean).join(', ')

    const { data: denuncia, error: denErr } = await supabase
      .from('denuncias')
      .insert({
        protocolo,
        chave_acesso:       chaveAcesso,
        categoria_id:       formData.categoria_id,
        titulo:             formData.titulo,
        descricao_original: formData.descricao_original,
        local:              localCompleto || null,
        data_ocorrido:      formData.data_ocorrido || null,
        status:             'recebida',
      })
      .select('id, protocolo, criado_em')
      .single()

    if (denErr || !denuncia) {
      console.error('[denuncia] Erro ao salvar:', denErr)
      return { success: false, error: 'Erro ao persistir denúncia: ' + (denErr?.message || 'Erro desconhecido') }
    }

    // 6. Salvar Identidade (PII Criptografado)
    console.log('[denuncia] Salvando identidade criptografada...')
    if (formData.nome && formData.email) {
      const { encryptData } = await import('@/lib/encrypt')
      const { error: identErr } = await supabase.from('identidades').insert({
        denuncia_id:  denuncia.id,
        nome_enc:     await encryptData(formData.nome.trim()),
        email_enc:    await encryptData(formData.email.toLowerCase().trim()),
        email_hash:   emailHash,
        telefone_enc: formData.telefone ? await encryptData(formData.telefone.trim()) : null,
        cpf_enc:      formData.cpf ? await encryptData(formData.cpf.trim()) : null,
      })
      if (identErr) console.error('[denuncia] Erro ao salvar PII:', identErr)
    }

    // 7. Gerar PDF e Fila de Despacho (Não trava o retorno se falhar)
    console.log('[denuncia] Iniciando processos em segundo plano...')
    try {
      const pdfBuffer = await gerarPDFDenuncia({
        protocolo,
        categoria:     catData?.label || formData.categoria_id,
        titulo:        formData.titulo,
        descricao:     formData.descricao_original,
        local:         localCompleto,
        data_ocorrido: formData.data_ocorrido || '',
        criado_em:     denuncia.criado_em,
        orgao_nome:    'Denúncia MS'
      })

      const pdfPath = `oficial_${protocolo}.pdf`
      const { error: pdfUpErr } = await supabase.storage
        .from('relatos-oficiais')
        .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

      if (!pdfUpErr) {
        const { data: pdfUrlData } = supabase.storage.from('relatos-oficiais').getPublicUrl(pdfPath)
        await supabase.from('pdf_assinaturas').insert({
          denuncia_id: denuncia.id,
          protocolo,
          sha256:      createHash('sha256').update(pdfBuffer).digest('hex'),
          url_storage: pdfUrlData.publicUrl,
        })

        await supabase.from('despacho_queue').insert({
          denuncia_id: denuncia.id,
          pdf_base64:  pdfBuffer.toString('base64'),
          status:      'pendente',
        })
      }
    } catch (pdfErr) {
      console.error('[denuncia] Erro no processamento do PDF:', pdfErr)
    }

    // 8. Enviar E-mail (Async)
    console.log('[denuncia] Enviando e-mail de confirmação...')
    const { gerarEmailDenunciante } = await import('@/lib/email-template')
    sendEmail({
      to:      formData.email,
      subject: `[DenunciaMS] Protocolo ${protocolo} — Denúncia registrada`,
      html:    gerarEmailDenunciante(protocolo, chaveAcesso, formData.nome || 'Cidadão'),
      text:    `Protocolo: ${protocolo} | Chave: ${chaveAcesso}`,
    }).catch(e => console.error('[denuncia] Erro e-mail:', e))

    console.log('[denuncia] Sucesso absoluto:', protocolo)
    return { success: true, protocolo, chaveAcesso }

  } catch (err: any) {
    console.error('[denuncia] Erro crítico final:', err)
    return { success: false, error: 'Erro inesperado: ' + err.message }
  }
}
