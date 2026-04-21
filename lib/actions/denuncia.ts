'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { gerarProtocolo } from '@/lib/protocolo'
import { uploadArquivo } from '@/lib/storage'
import { gerarPDFDenuncia } from '@/lib/pdf'
import { dispatchWebhook } from '@/lib/webhook'
import { sendEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

import { formatarDocumento } from '@/lib/documento'

import type { SubmitDenunciaRequest } from '@/types'

/**
 * Registra uma nova denúncia no sistema
 */
export async function registrarDenuncia(formData: SubmitDenunciaRequest, arquivos: { name: string, type: string, buffer: Buffer }[]) {
  const supabase = createAdminClient()
  
  try {
    // 1. Validar OTP caso não seja anônima
    if (!formData.anonima && formData.email) {
      if (!formData.otpToken || formData.otpToken.length !== 6) {
        throw new Error('Código de segurança inválido ou não fornecido.')
      }
      
      const { data: otpData, error: otpError } = await supabase
        .from('auth_tokens')
        .select('*')
        .eq('email', formData.email)
        .eq('codigo', formData.otpToken)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        
      if (otpError || !otpData) {
        throw new Error('Código de segurança incorreto ou expirado. Solicite um novo!')
      }

      // Marcar OTP como usado
      await supabase
        .from('auth_tokens')
        .update({ is_used: true })
        .eq('id', otpData.id)
    }

    // 2. Gera Protocolo Atômico com Token de Segurança e Chave de Acesso
    const { protocolo, chaveAcesso } = await gerarProtocolo()
    const sessaoId = crypto.randomUUID()

    // 2. Busca Categoria e Integrações
    const { data: categoria } = await supabase
      .from('categorias')
      .select('*, integracoes_destino(*)')
      .eq('id', formData.categoria_id)
      .single()

    if (!categoria) throw new Error('Categoria não encontrada')

    // 3. Upload de Arquivos
    const linksArquivos = []
    for (const file of arquivos) {
      const upload = await uploadArquivo({
        file: file.buffer,
        fileName: file.name,
        contentType: file.type,
        bucket: 'denuncias',
        path: `denuncias/${sessaoId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      })
      linksArquivos.push(upload)
    }

    // 4. Gera PDF Final
    const pdfBuffer = await gerarPDFDenuncia({
      protocolo,
      categoria: categoria.label,
      titulo: formData.titulo || 'Sem Título',
      descricao: formData.descricao_original || 'Sem Descrição',
      local: `${formData.local || ''}, ${formData.numero || ''} - ${formData.bairro || ''}, ${formData.cidade || ''}${formData.cep ? ` - CEP: ${formData.cep}` : ''}`,
      data_ocorrido: formData.data_ocorrido || '',
      criado_em: new Date().toISOString(),
      anonima: formData.anonima,
      nome: formData.nome || '',
      email: formData.email || '',
      telefone: formData.telefone || '',
      orgao_nome: 'Ouvidoria Geral MS' // Placeholder dinâmico
    })

    // 5. Salva na Tabela Denúncias
    const { data: denuncia, error: dError } = await supabase
      .from('denuncias')
      .insert({
        protocolo,
        chave_acesso: chaveAcesso,
        categoria_id: formData.categoria_id,
        titulo: formData.titulo,
        descricao_original: formData.descricao_original,
        documento_final: '', // Será atualizado com a URL se necessário ou gerado on-the-fly
        local: formData.local,
        cep: formData.cep,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        data_ocorrido: formData.data_ocorrido,
        anonima: formData.anonima,
        denunciante_nome: formData.anonima ? null : formData.nome,
        denunciante_email: formData.anonima ? null : formData.email,
        denunciante_telefone: formData.anonima ? null : formData.telefone,
        denunciante_cpf: formData.anonima ? null : formData.cpf,
        status: 'recebida'
      })
      .select()
      .single()

    if (dError) throw dError

    // 6. Registra links dos arquivos
    if (linksArquivos.length > 0) {
      await supabase.from('arquivos_denuncia').insert(
        linksArquivos.map(l => ({
          denuncia_id: denuncia.id,
          url: l.url,
          bucket_path: l.bucketPath,
          tamanho_bytes: l.tamanhoBytes,
          tipo: 'foto'
        }))
      )
    }

    // 7. Dispara Integrações (Async)
    const integracoes = categoria.integracoes_destino || []
    
    // Preparar variáveis para os templates de e-mail
    const emailOrgaoText = await formatarDocumento('email_orgao', {
      protocolo,
      categoria: categoria.label,
      categoria_slug: categoria.slug,
      local: formData.local,
      anonima: formData.anonima,
      nome: formData.anonima ? undefined : formData.nome,
      email: formData.anonima ? undefined : formData.email,
      telefone: formData.anonima ? undefined : formData.telefone,
      orgao_nome: 'Ouvidoria Geral MS',
    })

    const emailDenuncianteText = await formatarDocumento('email_denunciante', {
      protocolo,
      categoria: categoria.label,
      categoria_slug: categoria.slug,
      local: formData.local,
      anonima: formData.anonima,
      nome: formData.anonima ? undefined : formData.nome,
      email: formData.anonima ? undefined : formData.email,
      telefone: formData.anonima ? undefined : formData.telefone,
      orgao_nome: 'Ouvidoria Geral MS',
    })

    // Se não houver integração específica, envia para o e-mail padrão do sistema
    if (integracoes.length === 0) {
      const defaultEmail = process.env.DEFAULT_DESTINY_EMAIL
      if (defaultEmail) {
        sendEmail({
          to: defaultEmail,
          subject: `[LOG CONTINGÊNCIA] NOVA DENÚNCIA: ${protocolo} - ${categoria.label}`,
          text: emailOrgaoText,
          attachments: [{ filename: `denuncia-${protocolo}.pdf`, content: pdfBuffer }]
        }).catch(err => console.error('Falha no e-mail de contingência:', err))
      }
    } else {
      for (const integracao of integracoes) {
        if (!integracao.ativo) continue

        // Webhook
        if (integracao.tipo === 'webhook' || integracao.tipo === 'ambos') {
          dispatchWebhook({
            url: integracao.webhook_url,
            payload: { protocolo, titulo: formData.titulo, status: 'recebida' },
            authType: integracao.webhook_auth_tipo,
            authDataCrypted: integracao.webhook_auth_dados,
            retryMax: integracao.webhook_retry_max
          }).catch(err => console.error('Falha no webhook:', err))
        }

        // E-mail
        if (integracao.tipo === 'email' || integracao.tipo === 'ambos') {
          const destinatarios = integracao.email_para || []
          if (destinatarios.length > 0) {
            sendEmail({
              to: destinatarios,
              subject: `NOVA DENÚNCIA: ${protocolo} - ${categoria.label}`,
              text: emailOrgaoText,
              attachments: [
                { filename: `denuncia-${protocolo}.pdf`, content: pdfBuffer }
              ]
            }).catch(err => console.error('Falha no e-mail:', err))
          }
        }
      }
    }

    // 8. Envia e-mail de confirmação para o cidadão
    if (!formData.anonima && formData.email) {
      sendEmail({
        to: formData.email,
        subject: `Denúncia Recebida: ${protocolo} - ${categoria.label}`,
        text: emailDenuncianteText,
      }).catch(err => console.error('Falha no e-mail de confirmação do cidadão:', err))
    }

    revalidatePath('/admin/denuncias')
    return { success: true, protocolo, chaveAcesso }

  } catch (err: unknown) {
    console.error('Erro ao processar denúncia:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
