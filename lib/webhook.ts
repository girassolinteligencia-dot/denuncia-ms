import { decryptData } from './encrypt'
import { createAdminClient } from './supabase-admin'
import { sendEmail } from './email'

interface WebhookParams {
  url: string
  payload: any
  authType?: 'none' | 'bearer' | 'basic' | 'apikey'
  authDataCrypted?: string
  timeout?: number
  retryMax?: number
}

export async function dispatchWebhook(params: WebhookParams): Promise<boolean> {
  const { url, payload, authType = 'none', authDataCrypted, timeout = 8000, retryMax = 3 } = params

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (authType !== 'none' && authDataCrypted) {
    try {
      const authRaw = await decryptData(authDataCrypted)
      if (authType === 'bearer') headers['Authorization'] = `Bearer ${authRaw}`
      else if (authType === 'basic') headers['Authorization'] = `Basic ${Buffer.from(authRaw).toString('base64')}`
      else if (authType === 'apikey') {
        const [name, val] = authRaw.split(':')
        if (name && val) headers[name.trim()] = val.trim()
      }
    } catch {
      throw new Error('Falha ao descriptografar credenciais do webhook')
    }
  }

  let attempt = 0
  while (attempt <= retryMax) {
    try {
      const controller = new AbortController()
      const tId = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(url, {
        method: 'POST', headers,
        body: JSON.stringify({ ...payload, _meta: { timestamp: new Date().toISOString(), attempt: attempt + 1 } }),
        signal: controller.signal,
      })
      clearTimeout(tId)
      if (res.ok) return true
      throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      attempt++
      if (attempt > retryMax) throw err
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
    }
  }
  return false
}

export async function processarFilaDespacho(limite = 10) {
  const supabase = createAdminClient()

  const { data: itens } = await supabase
    .from('despacho_queue')
    .select('id, denuncia_id, pdf_base64, tentativas, status, denuncias(id, protocolo, categoria_id, local)')
    .in('status', ['pendente', 'pendente_pdf', 'erro'])
    .lt('tentativas', 5)
    .order('criado_em', { ascending: true })
    .limit(limite)

  if (!itens || itens.length === 0) return { processados: 0, falhas: 0 }

  let processados = 0
  let falhas = 0

  for (const item of itens) {
    const den = item.denuncias as any
    if (!den) continue

    try {
      await supabase.from('despacho_queue')
        .update({ tentativas: item.tentativas + 1, status: 'processando' })
        .eq('id', item.id)

      // 1. Buscar informações de contato criptografadas
      let contatoHtml = ''
      let nomeExibicao = 'Não disponível'
      let emailExibicao = 'N/A'
      
      const { data: ident } = await supabase
        .from('identidades')
        .select('nome_enc, email_enc')
        .eq('denuncia_id', den.id)
        .single()
      
      if (ident) {
        try {
          const nomeCompleto = await decryptData(ident.nome_enc)
          const email = await decryptData(ident.email_enc)
          const primeiroNome = nomeCompleto.split(' ')[0]
          nomeExibicao = primeiroNome
          emailExibicao = email
          
          contatoHtml = `
            <tr>
              <td style="font-size:11px;font-weight:900;color:#888;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #f0f0f0;width:120px">Cidadão</td>
              <td style="font-size:14px;font-weight:700;color:#333;padding:12px 0;border-bottom:1px solid #f0f0f0">${primeiroNome}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:900;color:#888;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #f0f0f0;width:120px">E-mail de Contato</td>
              <td style="font-size:14px;font-weight:700;color:#333;padding:12px 0;border-bottom:1px solid #f0f0f0">${email}</td>
            </tr>
          `
        } catch (e) {
          console.error('Erro ao descriptografar identidade no despacho:', e)
        }
      }

      // 2. Buscar outros anexos (fotos, vídeos, etc)
      const { data: anexos } = await supabase
        .from('arquivos_denuncia')
        .select('url, bucket_path, tipo')
        .eq('denuncia_id', den.id)

      const emailAttachments: any[] = []
      
      // Adicionar o PDF principal
      if (item.pdf_base64) {
        emailAttachments.push({
          filename: `relatorio-denuncia-${den.protocolo}.pdf`,
          content: item.pdf_base64,
          encoding: 'base64',
          content_type: 'application/pdf',
        })
      }

      // Adicionar arquivos originais
      if (anexos && anexos.length > 0) {
        for (const anexo of anexos) {
          try {
            const { data: fileBuf, error: dlErr } = await supabase.storage
              .from('denuncias')
              .download(anexo.bucket_path)
            
            if (!dlErr && fileBuf) {
              const arrayBuffer = await fileBuf.arrayBuffer()
              emailAttachments.push({
                filename: anexo.bucket_path.split('_').slice(1).join('_') || anexo.bucket_path,
                content: Buffer.from(arrayBuffer)
              })
            }
          } catch (e) {
            console.error(`Erro ao baixar anexo ${anexo.bucket_path}:`, e)
          }
        }
      }

      // 3. Montar e enviar o e-mail com layout premium
      const htmlBody = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f9;padding:40px;margin:0">
          <div style="max-width:600px;background:white;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid #e1e8ed">
            <div style="background:#021691;padding:32px;text-align:center;color:white">
              <h1 style="margin:0;font-size:20px;text-transform:uppercase;font-style:italic;font-weight:900">Denúncia MS</h1>
              <p style="margin:8px 0 0;font-size:12px;opacity:0.8">Portal Independente de Ouvidoria</p>
            </div>
            <div style="padding:40px">
              <h2 style="font-weight:900;color:#111;margin-top:0">Nova Denúncia Recebida</h2>
              <p style="color:#666;font-size:14px;line-height:1.6">Uma nova irregularidade foi reportada através da plataforma e requer sua análise técnica.</p>
              
              <div style="background:#f0f4ff;border:2px dashed #021691;border-radius:12px;padding:20px;text-align:center;margin-bottom:30px">
                <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#021691;margin-bottom:8px">Número do Protocolo</div>
                <div style="font-size:24px;font-weight:900;color:#021691;letter-spacing:4px">${den.protocolo}</div>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-bottom:30px">
                <tr>
                  <td style="font-size:11px;font-weight:900;color:#888;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #f0f0f0;width:120px">Categoria</td>
                  <td style="font-size:14px;font-weight:700;color:#333;padding:12px 0;border-bottom:1px solid #f0f0f0">${den.categoria_id}</td>
                </tr>
                <tr>
                  <td style="font-size:11px;font-weight:900;color:#888;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #f0f0f0;width:120px">Localização</td>
                  <td style="font-size:14px;font-weight:700;color:#333;padding:12px 0;border-bottom:1px solid #f0f0f0">${den.local ?? 'Não informado'}</td>
                </tr>
                <tr>
                  <td style="font-size:11px;font-weight:900;color:#888;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #f0f0f0;width:120px">Identificação</td>
                  <td style="font-size:14px;font-weight:700;color:#333;padding:12px 0;border-bottom:1px solid #f0f0f0">Identificada</td>
                </tr>
                ${contatoHtml}
                <tr>
                  <td style="font-size:11px;font-weight:900;color:#888;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #f0f0f0;width:120px">Anexos</td>
                  <td style="font-size:14px;font-weight:700;color:#333;padding:12px 0;border-bottom:1px solid #f0f0f0">${emailAttachments.length} arquivo(s) incluindo PDF</td>
                </tr>
              </table>

              <div style="text-align:center">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display:inline-block;background:#021691;color:white;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px">Acessar Painel de Gestão</a>
              </div>
            </div>
            <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #f0f0f0">
              <p style="font-size:10px;color:#999;margin:0">Este é um e-mail automático enviado pela plataforma Denúncia MS.<br>Por favor, não responda a este endereço.</p>
            </div>
          </div>
        </div>
      `

      // Buscar e-mail de destino da integração por categoria
      const { data: integracao } = await supabase
        .from('integracoes_destino')
        .select('email_para')
        .eq('categoria_id', den.categoria_id)
        .eq('ativo', true)
        .eq('tipo', 'email')
        .limit(1)
        .maybeSingle()
      
      const destinoFinal = (integracao?.email_para && integracao.email_para.length > 0)
        ? integracao.email_para
        : [process.env.DEFAULT_DESTINY_EMAIL || 'ouvidoria@denunciams.com.br']

      // Buscar label da categoria para o assunto
      const { data: catInfo } = await supabase
        .from('categorias')
        .select('label')
        .eq('id', den.categoria_id)
        .single()

      await sendEmail({
        to:      destinoFinal,
        subject: `[Nova Denúncia] ${den.protocolo} — ${catInfo?.label || den.categoria_id}`,
        html:    htmlBody,
        text:    `Nova denúncia. Protocolo: ${den.protocolo}. Categoria: ${catInfo?.label || den.categoria_id}.`,
        attachments: emailAttachments
      })

      await supabase.from('despacho_queue')
        .update({ status: 'despachado', despachado_em: new Date().toISOString() })
        .eq('id', item.id)

      await supabase.from('denuncias').update({ status: 'em_analise' }).eq('id', item.denuncia_id)
      processados++

    } catch (err) {
      console.error(`[despacho] Falha item ${item.id}:`, err)
      falhas++
      await supabase.from('despacho_queue')
        .update({ status: item.tentativas + 1 >= 5 ? 'falha_definitiva' : 'erro', ultimo_erro: String(err) })
        .eq('id', item.id)
    }
  }

  return { processados, falhas }
}

