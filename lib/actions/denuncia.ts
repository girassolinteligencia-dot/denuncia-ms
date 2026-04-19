'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { gerarProtocolo } from '@/lib/protocolo'
import { uploadArquivo } from '@/lib/storage'
import { gerarPDFDenuncia } from '@/lib/pdf'
import { dispatchWebhook } from '@/lib/webhook'
import { sendEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

/**
 * Registra uma nova denúncia no sistema
 */
export async function registrarDenuncia(formData: any, arquivos: { name: string, type: string, buffer: Buffer }[]) {
  const supabase = createAdminClient()
  
  try {
    // 1. Gera Protocolo Atômico
    const protocolo = await gerarProtocolo()
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
        sessaoId,
        tipo: 'foto', // Simplificado para o exemplo
      })
      linksArquivos.push(upload)
    }

    // 4. Gera PDF Final
    const pdfBuffer = await gerarPDFDenuncia({
      protocolo,
      categoria: categoria.label,
      titulo: formData.titulo,
      descricao: formData.descricao_original,
      local: formData.local,
      data_ocorrido: formData.data_ocorrido,
      criado_em: new Date().toISOString(),
      anonima: formData.anonima,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      orgao_nome: 'Ouvidoria Geral MS' // Placeholder dinâmico
    })

    // 5. Salva na Tabela Denúncias
    const { data: denuncia, error: dError } = await supabase
      .from('denuncias')
      .insert({
        protocolo,
        categoria_id: formData.categoria_id,
        titulo: formData.titulo,
        descricao_original: formData.descricao_original,
        documento_final: '', // Será atualizado com a URL se necessário ou gerado on-the-fly
        local: formData.local,
        data_ocorrido: formData.data_ocorrido,
        anonima: formData.anonima,
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
    const integracao = categoria.integracoes_destino?.[0]
    if (integracao && integracao.ativo) {
      
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
        sendEmail({
          to: integracao.email_para,
          subject: `NOVA DENÚNCIA: ${protocolo} - ${categoria.label}`,
          text: `Uma nova denúncia foi registrada sob o protocolo ${protocolo}.`,
          attachments: [
            { filename: `denuncia-${protocolo}.pdf`, content: pdfBuffer }
          ]
        }).catch(err => console.error('Falha no e-mail:', err))
      }
    }

    revalidatePath('/admin/denuncias')
    return { success: true, protocolo }

  } catch (err: any) {
    console.error('Erro ao processar denúncia:', err)
    return { success: false, error: err.message }
  }
}
