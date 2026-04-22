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

  try {
    if (!formData.anonima && formData.email) {
      const otpValido = await validarOTP(formData.email, formData.otpToken || '')
      if (!otpValido) return { success: false, error: 'Código de verificação inválido ou expirado.' }
    }

    const { protocolo, chaveAcesso } = await gerarProtocolo()

    // Upload de arquivos para o Storage (Server-side)
    const arquivosUrls: string[] = []
    if (arquivos && arquivos.length > 0) {
      for (const file of arquivos) {
        const buffer = Buffer.from(file.content, 'base64')
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        
        const { error: uploadError } = await supabase.storage
          .from('denuncias')
          .upload(path, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          console.error('[upload] Erro no servidor:', uploadError)
          throw new Error(`Erro ao salvar arquivo ${file.name}`)
        }

        const { data: urlData } = supabase.storage.from('denuncias').getPublicUrl(path)
        arquivosUrls.push(urlData.publicUrl)
      }
    }

    // Busca dados da categoria para o documento final
    const { data: catData } = await supabase
      .from('categorias')
      .select('label, slug')
      .eq('id', formData.categoria_id)
      .single()

    // Monta o documento final com template real
    const { montarDocumentoFinal, construirVariaveis } = await import('@/lib/documento')
    const localCompleto = [formData.local, formData.numero, formData.bairro, formData.cidade]
      .filter(Boolean).join(', ')
    const variaveis = construirVariaveis({
      protocolo,
      categoriaNome: catData?.label || formData.categoria_id,
      categoriaSlug: catData?.slug || '',
      orgaoNome:     'DenunciaMS',
      local:         localCompleto,
      anonima:       formData.anonima ?? false,
      nome:          formData.nome,
      email:         formData.email,
      telefone:      formData.telefone,
    })
    const documentoFinal = montarDocumentoFinal({
      cabecalho: `DENUNCIA MS — Protocolo: ${protocolo}\nCategoria: ${catData?.label || formData.categoria_id}\nData: ${variaveis.data_envio} às ${variaveis.hora_envio}\nLocal: ${localCompleto || 'Não informado'}\nIdentificação: ${formData.anonima ? 'Anônima' : formData.nome || '-'}`,
      corpo:     formData.descricao_original,
      rodape:    `Denúncia registrada oficialmente pela plataforma DenunciaMS.\nHash de integridade disponível no painel administrativo.\nMato Grosso do Sul — ${variaveis.data_envio}`,
      variaveis,
    })

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
        anonima:            formData.anonima ?? false,
        documento_final:    documentoFinal,
        status:             'recebida',
      })
      .select('id, protocolo, criado_em')
      .single()

    if (denErr || !denuncia) {
      console.error('[denuncia] Erro ao persistir:', denErr)
      return { success: false, error: 'Não foi possível registrar a denúncia no banco de dados.' }
    }

    // Registrar arquivos no banco se houver URLs
    if (arquivosUrls.length > 0) {
      await supabase.from('arquivos_denuncia').insert(
        arquivosUrls.map(url => ({
          denuncia_id: denuncia.id,
          url,
          tipo: url.match(/\.(pdf)$/i) ? 'pdf' : url.match(/\.(mp3|wav|ogg|m4a)$/i) ? 'audio' : 'foto',
          bucket_path: url.split('/').pop() || '',
        }))
      )
    }

    if (!formData.anonima && formData.nome && formData.email) {
      const { encryptData } = await import('@/lib/encrypt')
      await supabase.from('identidades').insert({
        denuncia_id:  denuncia.id,
        nome_enc:     await encryptData(formData.nome.trim()),
        email_enc:    await encryptData(formData.email.toLowerCase().trim()),
        email_hash:   createHash('sha256').update(formData.email.toLowerCase().trim()).digest('hex'),
        telefone_enc: formData.telefone ? await encryptData(formData.telefone.trim()) : null,
        cpf_enc:      formData.cpf ? await encryptData(formData.cpf.trim()) : null,
      })
    }

    try {
      const pdfBuffer = await gerarPDFDenuncia({
        protocolo,
        categoria:     formData.categoria_id,
        titulo:        formData.titulo,
        descricao:     formData.descricao_original,
        local:         [formData.local, formData.numero, formData.bairro, formData.cidade].filter(Boolean).join(', '),
        data_ocorrido: formData.data_ocorrido || '',
        anonima:       formData.anonima,
        criado_em:     denuncia.criado_em,
        orgao_nome:    'Denúncia MS'
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

    // E-mail profissional para o denunciante
    if (formData.email) {
      const { gerarEmailDenunciante } = await import('@/lib/email-template')
      sendEmail({
        to:      formData.email,
        subject: `[DenunciaMS] Protocolo ${protocolo} — Denúncia registrada com sucesso`,
        html:    gerarEmailDenunciante(protocolo, chaveAcesso, formData.nome || 'Cidadão'),
        text:    `Protocolo: ${protocolo} | Chave: ${chaveAcesso}`,
      }).catch(e => console.error('[denuncia] Erro ao enviar e-mail denunciante:', e))
    }

    return { success: true, protocolo, chaveAcesso }
  } catch (err) {
    console.error('[denuncia] Erro crítico:', err)
    return { success: false, error: (err as Error).message }
  }
}


