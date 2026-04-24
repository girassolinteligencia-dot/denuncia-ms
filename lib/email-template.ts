// lib/email-template.ts
// Template profissional de e-mail para despacho aos órgãos
// Usado tanto no envio real quanto no preview do step 5

export interface EmailTemplateData {
  protocolo: string
  categoria: string
  orgao: string
  titulo: string
  descricao: string
  local: string
  data_ocorrido: string
  identificada?: boolean
  // Dados do denunciante (visíveis ao órgão)
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  // Arquivos
  totalArquivos: number
  criado_em: string
}

export function gerarEmailOrgao(d: EmailTemplateData): string {
  const dataFormatada = new Date(d.criado_em).toLocaleString('pt-BR', {
    timeZone: 'America/Campo_Grande',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const dataOcorrido = d.data_ocorrido
    ? new Date(d.data_ocorrido).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : 'Não informado'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Denúncia ${d.protocolo} — DenunciaMS</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0">
<tr><td align="center" style="padding: 0 16px">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:620px">

  <!-- HEADER -->
  <tr>
    <td style="background:#021691;padding:28px 32px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:0.7">Plataforma Oficial</p>
            <h1 style="margin:4px 0 0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px">DENUNCIA MS</h1>
          </td>
          <td align="right">
            <p style="margin:0;color:#ffffff;font-size:10px;opacity:0.6;text-transform:uppercase;letter-spacing:2px">Protocolo</p>
            <p style="margin:4px 0 0;color:#4ade80;font-size:16px;font-weight:900;letter-spacing:1px">${d.protocolo}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ALERTA OFICIAL -->
  <tr>
    <td style="background:#fef3c7;padding:14px 32px;border-bottom:1px solid #fde68a">
      <p style="margin:0;color:#92400e;font-size:12px;font-weight:700">
        ⚖️ DOCUMENTO OFICIAL — Esta denúncia foi registrada formalmente e requer resposta do órgão competente no prazo legal estabelecido pela LAI (Lei nº 12.527/2011).
      </p>
    </td>
  </tr>

  <!-- DESTINO -->
  <tr>
    <td style="padding:24px 32px 0">
      <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Órgão Destinatário</p>
      <p style="margin:4px 0 0;color:#021691;font-size:18px;font-weight:900">${d.orgao}</p>
      <p style="margin:4px 0 0;color:#6b7280;font-size:12px">Registrado em: ${dataFormatada} (Horário de Campo Grande)</p>
    </td>
  </tr>

  <!-- DIVISOR -->
  <tr><td style="padding:16px 32px"><hr style="border:none;border-top:1px solid #e5e7eb"></td></tr>

  <!-- CATEGORIA E TÍTULO -->
  <tr>
    <td style="padding:0 32px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e5e7eb">
            <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Categoria</p>
            <p style="margin:6px 0 0;color:#111827;font-size:14px;font-weight:800">${d.categoria}</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e5e7eb">
            <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Data do Ocorrido</p>
            <p style="margin:6px 0 0;color:#111827;font-size:14px;font-weight:800">${dataOcorrido}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- TÍTULO -->
  <tr>
    <td style="padding:16px 32px 0">
      <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Título da Denúncia</p>
      <p style="margin:6px 0 0;color:#111827;font-size:18px;font-weight:900;line-height:1.3">${d.titulo}</p>
    </td>
  </tr>

  <!-- LOCAL -->
  <tr>
    <td style="padding:12px 32px 0">
      <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Local do Ocorrido</p>
      <p style="margin:6px 0 0;color:#111827;font-size:14px;font-weight:600">${d.local || 'Não informado'}</p>
    </td>
  </tr>

  <!-- DESCRIÇÃO -->
  <tr>
    <td style="padding:16px 32px 0">
      <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Relato Completo</p>
      <div style="margin:8px 0 0;background:#f8fafc;border-left:4px solid #021691;border-radius:0 8px 8px 0;padding:16px">
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap">${d.descricao}</p>
      </div>
    </td>
  </tr>

  <!-- IDENTIFICAÇÃO DO DENUNCIANTE -->
  <tr>
    <td style="padding:16px 32px 0">
      <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Dados do Denunciante</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px">
        <tr>
          <td style="padding:4px 16px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${d.nome ? `<tr><td style="padding:4px 0"><p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase">Nome</p><p style="margin:2px 0 0;color:#111827;font-size:13px;font-weight:700">${d.nome}</p></td></tr>` : ''}
              ${d.email ? `<tr><td style="padding:4px 0"><p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase">E-mail</p><p style="margin:2px 0 0;color:#021691;font-size:13px;font-weight:700">${d.email}</p></td></tr>` : ''}
              ${d.telefone ? `<tr><td style="padding:4px 0"><p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase">WhatsApp / Telefone</p><p style="margin:2px 0 0;color:#111827;font-size:13px;font-weight:700">${d.telefone}</p></td></tr>` : ''}
              ${d.cpf ? `<tr><td style="padding:4px 0"><p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase">CPF</p><p style="margin:2px 0 0;color:#111827;font-size:13px;font-weight:700">${d.cpf}</p></td></tr>` : ''}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- EVIDÊNCIAS -->
  ${d.totalArquivos > 0 ? `
  <tr>
    <td style="padding:12px 32px 0">
      <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Evidências Anexadas</p>
      <p style="margin:6px 0 0;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px;color:#1d4ed8;font-size:13px;font-weight:700;display:inline-block">
        📎 ${d.totalArquivos} arquivo(s) em anexo
      </p>
    </td>
  </tr>` : ''}

  <!-- FOOTER -->
  <tr>
    <td style="padding:24px 32px;margin-top:16px">
      <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:20px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6">
              Documento oficial gerado pela plataforma <strong style="color:#021691">DENUNCIA MS</strong>.<br>
              Canal Independente de Ouvidoria — Mato Grosso do Sul.<br>
              Protocolo: <strong>${d.protocolo}</strong> | Verificação de integridade via hash criptográfico.
            </p>
          </td>
          <td align="right" style="vertical-align:bottom">
            <p style="margin:0;color:#021691;font-size:18px;font-weight:900">DNS</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function gerarEmailDenunciante(protocolo: string, chaveAcesso: string, nome: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px">
  <tr>
    <td style="background:#021691;padding:28px 32px">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900">DENUNCIA MS</h1>
      <p style="margin:4px 0 0;color:#ffffff;opacity:0.7;font-size:12px">Sua denúncia foi registrada com sucesso</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px">
      <p style="margin:0;color:#374151;font-size:15px">Olá, <strong>${nome.split(' ')[0]}</strong>!</p>
      <p style="margin:12px 0;color:#374151;font-size:14px;line-height:1.6">
        Sua denúncia foi registrada formalmente na plataforma <strong>DENUNCIA MS</strong> e encaminhada ao órgão competente.
        Guarde os dados abaixo para acompanhar o andamento.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
        <tr>
          <td width="48%" style="background:#f0f4ff;border-radius:8px;padding:16px;text-align:center">
            <p style="margin:0;color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Protocolo</p>
            <p style="margin:8px 0 0;color:#021691;font-size:18px;font-weight:900;letter-spacing:1px">${protocolo}</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background:#021691;border-radius:8px;padding:16px;text-align:center">
            <p style="margin:0;color:#ffffff;opacity:0.7;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Chave de Acesso</p>
            <p style="margin:8px 0 0;color:#4ade80;font-size:18px;font-weight:900;letter-spacing:3px">${chaveAcesso}</p>
          </td>
        </tr>
      </table>
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px">
        <p style="margin:0;color:#92400e;font-size:12px;font-weight:700">
          ⚠️ Atenção: Guarde estas credenciais. Elas são a única forma de consultar o status da sua denúncia e não podem ser recuperadas.
        </p>
      </div>
      <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;text-align:center">
        <strong>DENUNCIA MS</strong> — Canal Independente de Ouvidoria — Mato Grosso do Sul
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
