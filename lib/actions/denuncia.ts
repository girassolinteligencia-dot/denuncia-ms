'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { SubmitDenunciaRequest } from '@/types'
import { gerarProtocolo } from '@/lib/protocolo'
import { gerarPDFDenuncia } from '@/lib/pdf'
import { sendEmail } from '@/lib/email'
import { validarOTP, verificarOTP } from './auth'
import { createHash } from 'crypto'
import { encryptData } from '@/lib/encrypt'
import { gerarEmailDenunciante, gerarEmailOrgao } from '@/lib/email-template'

export async function uploadArquivoDenuncia(name: string, type: string, contentBase64: string) {
  const supabase = createAdminClient()
  try {
    const buffer = Buffer.from(contentBase64, 'base64')
    const ext = name.split('.').pop()
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('denuncias')
      .upload(path, buffer, { contentType: type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('denuncias').getPublicUrl(path)
    
    return { 
      success: true, 
      url: urlData.publicUrl, 
      bucket_path: path, 
      size: buffer.length 
    }
  } catch (err: any) {
    console.error('[upload] Erro:', err)
    return { success: false, error: err.message }
  }
}

export async function registrarDenuncia(
  formData: SubmitDenunciaRequest, 
  arquivosVinculados: { name: string, type: string, url: string, bucket_path: string, size: number }[]
) {
  const supabase = createAdminClient()
  const emailNorm = formData.email?.toLowerCase().trim()
  const emailHash = emailNorm ? createHash('sha256').update(emailNorm).digest('hex') : ''

  console.log('[denuncia] Iniciando registro:', { categoria: formData.categoria_id, titulo: formData.titulo })

  try {
    // 1. Validações Iniciais
    if (!emailNorm) return { success: false, error: 'E-mail de identificação é obrigatório.' }
    if (!formData.telefone) return { success: false, error: 'O número de telefone/WhatsApp é obrigatório.' }
    if (!formData.cpf) return { success: false, error: 'O CPF é obrigatório para a identificação oficial.' }
    
    const { data: banido } = await supabase
      .from('blacklist_usuarios')
      .select('id')
      .eq('email_hash', emailHash)
      .maybeSingle()

    if (banido) return { success: false, error: 'Acesso suspenso por violação dos termos.' }

    // 2. Validar OTP (O código agora é consumido apenas se passar por aqui)
    const otpCheck = await verificarOTP(emailNorm, formData.otpToken || '')
    if (!otpCheck.success) {
      return { success: false, error: 'Código de verificação inválido ou já utilizado. Solicite um novo.' }
    }

    // 3. Gerar Protocolo
    const { protocolo, chaveAcesso } = await gerarProtocolo()

    // 4. Buscar Categoria para o PDF e Destinatário
    const { data: catData } = await supabase
      .from('categorias')
      .select('label, email_destino')
      .eq('id', formData.categoria_id)
      .single()

    // 5. Inserir Registro Principal (Atomicidade)
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
        cep:                formData.cep || null,
        numero:             formData.numero || null,
        bairro:             formData.bairro || null,
        cidade:             formData.cidade || null,
        municipio:          formData.municipio || null,
        latitude:           formData.latitude || null,
        longitude:          formData.longitude || null,
        data_ocorrido:      formData.data_ocorrido || null,
        status:             'recebida',
      })
      .select('id, criado_em')
      .single()

    if (denErr || !denuncia) {
      throw new Error(`Erro no Banco: ${denErr?.message || 'Falha ao criar registro'}`)
    }

    // Marca OTP como usado apenas após insert bem-sucedido
    await validarOTP(emailNorm, formData.otpToken || '')

    // 6. Processamento em Segundo Plano (Non-blocking para o usuário)
    try {
      // Arquivos
      if (arquivosVinculados.length > 0) {
        const insertData = arquivosVinculados.map(f => {
          let tipoSimplificado = 'documento'
          if (f.type.startsWith('image/')) tipoSimplificado = 'foto'
          else if (f.type.startsWith('audio/')) tipoSimplificado = 'audio'
          else if (f.type.startsWith('video/')) tipoSimplificado = 'video'
          else if (f.type.includes('pdf')) tipoSimplificado = 'pdf'

          return {
            denuncia_id: denuncia.id,
            tipo: tipoSimplificado,
            url: f.url,
            bucket_path: f.bucket_path,
            tamanho_bytes: f.size,
            name: f.name
          }
        })
        await supabase.from('arquivos_denuncia').insert(insertData)
      }

      // Identidade (PII)
      await supabase.from('identidades').insert({
        denuncia_id:  denuncia.id,
        nome_enc:     await encryptData(formData.nome?.trim() || 'Cidadão'),
        email_enc:    await encryptData(emailNorm),
        email_hash:   emailHash,
        telefone_enc: formData.telefone ? await encryptData(formData.telefone.trim()) : null,
        cpf_enc:      formData.cpf ? await encryptData(formData.cpf.trim()) : null,
      })

      // PDF & Fila
      const pdfBuffer = await gerarPDFDenuncia({
        protocolo,
        categoria:     catData?.label || 'Geral',
        titulo:        formData.titulo,
        descricao:     formData.descricao_original,
        local:         localCompleto,
        data_ocorrido: formData.data_ocorrido || '',
        criado_em:     denuncia.criado_em,
        orgao_nome:    'Denuncia MS',
        arquivos:      arquivosVinculados
      })

      const pdfPath = `oficial_${protocolo}.pdf`
      const { data: upData } = await supabase.storage
        .from('relatos-oficiais')
        .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

      if (upData) {
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

      // 1. E-mail para o CIDADÃO (Confirmando recebimento)
      sendEmail({
        to:      emailNorm,
        subject: `[DenunciaMS] Protocolo ${protocolo} — Denuncia registrada`,
        html:    gerarEmailDenunciante(protocolo, chaveAcesso, formData.nome || 'Cidadão'),
        text:    `Protocolo: ${protocolo} | Chave: ${chaveAcesso}`,
      }).catch(e => console.error('[email] Erro ao notificar cidadão:', e))

      // 2. E-mail para o ÓRGÃO DESTINATÁRIO (Se houver email_destino na categoria)
      if (catData?.email_destino) {
        // Prepara anexos (PDF oficial + arquivos da denuncia)
        const emailAttachments: any[] = [
          {
            filename: `denuncia_${protocolo}.pdf`,
            content:  pdfBuffer
          }
        ]

        const MAX_EMAIL_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB limite
        let currentSize = pdfBuffer.length

        // Tenta baixar e anexar cada arquivo vinculado respeitando limite
        for (const f of arquivosVinculados) {
          try {
            if (currentSize + f.size > MAX_EMAIL_SIZE_BYTES) {
              console.warn(`[email] Anexo ${f.name} ignorado. Limite de 20MB atingido.`)
              continue
            }

            const fileRes = await fetch(f.url)
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer()
              const contentBuffer = Buffer.from(arrayBuffer)
              
              if (currentSize + contentBuffer.length > MAX_EMAIL_SIZE_BYTES) {
                console.warn(`[email] Anexo ${f.name} ignorado após download. Limite atingido.`)
                continue
              }

              emailAttachments.push({
                filename: f.name,
                content: contentBuffer
              })
              currentSize += contentBuffer.length
            }
          } catch (e) {
            console.warn(`[email] Erro ao baixar anexo ${f.name} para o email:`, e)
          }
        }

        sendEmail({
          to:      catData.email_destino,
          subject: `[OFICIAL] Nova Denúncia — Protocolo ${protocolo} — ${catData.label}`,
          text:    `Uma nova denúncia foi registrada para sua área. Protocolo: ${protocolo}.\n\nOs documentos e provas seguem em anexo.`,
          html: gerarEmailOrgao({
            protocolo,
            categoria: catData.label,
            orgao: catData.label,
            titulo: formData.titulo,
            descricao: formData.descricao_original,
            local: localCompleto,
            data_ocorrido: formData.data_ocorrido || new Date().toISOString(),
            nome: formData.nome,
            email: emailNorm,
            telefone: formData.telefone,
            cpf: formData.cpf,
            totalArquivos: arquivosVinculados.length,
            criado_em: denuncia.criado_em,
            baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://denuncia-ms.vercel.app'
          }),
          attachments: emailAttachments
        }).catch(e => console.error('[email] Erro ao notificar destinatário:', e))
      }

    } catch (bgErr) {
      console.error('[denuncia] Erro em processo secundário (não crítico):', bgErr)
    }

    return { success: true, protocolo, chaveAcesso }

  } catch (err: any) {
    console.error('[denuncia] ERRO CRÍTICO:', err)
    return { success: false, error: err.message || 'Falha técnica ao processar denuncia.' }
  }
}
