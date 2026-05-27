import { jsPDF } from 'jspdf'
import { getConfigsByPrefix } from './config'
import QRCode from 'qrcode'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PDFData {
  protocolo: string
  categoria: string
  categoria_slug?: string
  titulo: string
  descricao: string
  local: string
  cep?: string
  numero?: string
  bairro?: string
  cidade?: string
  municipio?: string
  data_ocorrido: string
  hora_ocorrido?: string
  autor_nome?: string
  testemunhas?: string
  servidor_publico?: 'sim' | 'nao'
  setor_servidor?: string
  agente_politico?: 'sim' | 'nao'
  cargo_agente?: string
  criado_em: string
  nome?: string
  email?: string
  telefone?: string
  anonima?: boolean
  status?: string
  sha256?: string
  orgao_nome: string
  arquivos?: { url: string; type: string; name: string }[]
  links?: string[]
}

// ─── Constantes de Cor ────────────────────────────────────────────────────────

const C = {
  primary:   [2,   22,  145] as [number, number, number], // #021691
  yellow:    [245, 200,  0 ] as [number, number, number], // #F5C800
  dark:      [17,  24,   39] as [number, number, number], // #111827
  muted:     [107, 114, 128] as [number, number, number], // #6B7280
  light:     [248, 250, 252] as [number, number, number], // #F8FAFC
  border:    [229, 231, 235] as [number, number, number], // #E5E7EB
  white:     [255, 255, 255] as [number, number, number],
  green:     [22,  163,  74] as [number, number, number], // #16A34A
  amber:     [146,  64,  14] as [number, number, number], // #92400E
  amberBg:   [254, 243, 199] as [number, number, number], // #FEF3C7
  red:       [185,  28,  28] as [number, number, number], // #B91C1C
}



// ─── Helpers de Layout ────────────────────────────────────────────────────────

function setColor(doc: jsPDF, rgb: [number,number,number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2])
}
function setFill(doc: jsPDF, rgb: [number,number,number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2])
}
function setDraw(doc: jsPDF, rgb: [number,number,number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2])
}

function drawSectionHeader(doc: jsPDF, num: number, title: string, subtitle: string, y: number): number {
  // Número badge
  setFill(doc, C.primary)
  doc.roundedRect(15, y, 8, 8, 1, 1, 'F')
  setColor(doc, C.white)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(String(num), 19, y + 5.5, { align: 'center' })

  // Título
  setColor(doc, C.primary)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 27, y + 6)

  // Subtítulo alinhado à direita
  setColor(doc, C.muted)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(subtitle.toUpperCase(), 195, y + 6, { align: 'right' })

  // Linha separadora
  setDraw(doc, C.border)
  doc.setLineWidth(0.3)
  doc.line(15, y + 11, 195, y + 11)

  return y + 18
}

function checkPageBreak(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 270) {
    doc.addPage()
    drawPageFooterBar(doc)
    return 20
  }
  return y
}

function drawPageFooterBar(doc: jsPDF) {
  const h = doc.internal.pageSize.getHeight()
  setFill(doc, C.border)
  doc.rect(0, h - 10, 210, 10, 'F')
  setColor(doc, C.muted)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.text('DENUNCIA MS — Ouvidoria Cívica Independente', 15, h - 4)
  doc.text(`Página ${(doc as any).internal.getCurrentPageInfo().pageNumber}`, 195, h - 4, { align: 'right' })
}

function drawBadge(doc: jsPDF, text: string, x: number, y: number, fill: [number,number,number], textColor: [number,number,number]): number {
  const w = doc.getTextWidth(text) + 8
  setFill(doc, fill)
  doc.roundedRect(x, y - 4, w, 6, 1, 1, 'F')
  setColor(doc, textColor)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(text, x + 4, y)
  return x + w + 4
}

function drawInfoBox(doc: jsPDF, label: string, value: string, x: number, y: number, width: number): number {
  setColor(doc, C.muted)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(label.toUpperCase(), x, y)
  setColor(doc, C.primary)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const lines = doc.splitTextToSize(value || '—', width)
  doc.text(lines, x, y + 5)
  return lines.length
}

// ─── Gerador Principal ────────────────────────────────────────────────────────

export async function gerarPDFDenuncia(data: PDFData): Promise<Buffer> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ident = await getConfigsByPrefix('identidade') as Record<string, string>
  const appName = ident['identidade.nome'] ? String(ident['identidade.nome']).toUpperCase() : 'DENUNCIA MS'
  const appUrl  = (process.env.NEXT_PUBLIC_APP_URL || 'denunciams.com.br').replace(/^https?:\/\//, '')

  const dataEmissao = new Date(data.criado_em).toLocaleString('pt-BR', {
    timeZone: 'America/Campo_Grande',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const dataOcorrido = data.data_ocorrido
    ? new Date(data.data_ocorrido).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })
    : 'Não informado'

  // ── PÁGINA 1 ────────────────────────────────────────────────────────────────

  // Cabeçalho azul
  setFill(doc, C.primary)
  doc.rect(0, 0, 210, 42, 'F')

  // Logo / "D" box
  setFill(doc, C.yellow)
  doc.roundedRect(12, 8, 16, 16, 2, 2, 'F')
  setColor(doc, C.primary)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('D', 20, 19.5, { align: 'center' })

  // Nome e subtítulo
  setColor(doc, C.white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(appName, 32, 15)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('OUVIDORIA CÍVICA INDEPENDENTE · MATO GROSSO DO SUL', 32, 20)

  // Badge DOCUMENTO OFICIAL (topo direita)
  setFill(doc, C.white)
  doc.roundedRect(148, 8, 47, 8, 1, 1, 'F')
  setColor(doc, C.primary)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('DOCUMENTO OFICIAL', 171.5, 13.3, { align: 'center' })

  // Emissão / Versão / Plataforma (direita)
  setColor(doc, C.white)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(`Emissão: ${dataEmissao}`, 195, 22, { align: 'right' })
  doc.text('Versão: 1.0 — Original', 195, 27, { align: 'right' })
  doc.text(`Plataforma: ${appUrl}`, 195, 32, { align: 'right' })

  // Linha amarela decorativa
  setFill(doc, C.yellow)
  doc.rect(0, 42, 210, 1.5, 'F')

  // Título "Registro Oficial de Denúncia"
  setColor(doc, C.primary)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Registro Oficial de Denúncia', 105, 56, { align: 'center' })
  setColor(doc, C.muted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('C A N A L   A N Ô N I M O   D E   O U V I D O R I A   C I D A D Ã', 105, 62, { align: 'center' })

  // Box do protocolo
  setFill(doc, C.light)
  setDraw(doc, C.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, 66, 180, 16, 2, 2, 'FD')
  setColor(doc, C.muted)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('NÚMERO DE PROTOCOLO', 20, 72)
  setColor(doc, C.primary)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(data.protocolo, 20, 79)
  // Badge de status
  const statusText = (data.status || 'recebida').toUpperCase().replace('_', ' ').replace('RECEBIDA', 'EM TRIAGEM').replace('EM ANALISE', 'EM ANÁLISE').replace('ENCAMINHADA', 'ENCAMINHADA').replace('RESOLVIDA', 'RESOLVIDA')
  drawBadge(doc, statusText, 155, 76, C.yellow, C.dark)

  // Alerta anônima
  let y = 88
  if (data.anonima) {
    setFill(doc, C.amberBg)
    setDraw(doc, [253, 230, 138])
    doc.roundedRect(15, y, 180, 14, 2, 2, 'FD')
    setColor(doc, C.amber)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('!   DENÚNCIA ANÔNIMA — IDENTIDADE PROTEGIDA', 20, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const alertText = 'A identidade do denunciante é resguardada por sigilo institucional, em conformidade com o art. 5º, inciso XXXIII, da Constituição Federal, e com a Lei nº 13.460/2017. É vedada qualquer tentativa de identificação do autor do relato.'
    const alertLines = doc.splitTextToSize(alertText, 168)
    doc.text(alertLines, 20, y + 10)
    y += 14 + 4
  } else {
    y += 4
  }

  // ── SEÇÃO 1 — Classificação Preliminar ──────────────────────────────────────
  y = checkPageBreak(doc, y, 35)
  y = drawSectionHeader(doc, 1, 'Classificação Preliminar', 'TRIAGEM AUTOMATIZADA', y)

  const colW = 56
  drawInfoBox(doc, 'Categoria', data.categoria, 18, y + 5, colW)
  drawInfoBox(doc, 'Gravidade', data.anonima ? 'Alta' : 'Média', 18 + colW + 6, y + 5, colW)
  drawInfoBox(doc, 'Esfera', 'Municipal / Estadual', 18 + (colW + 6) * 2, y + 5, colW)
  y += 16

  // ── SEÇÃO 2 — Identificação Temporal e Espacial ──────────────────────────────
  y = checkPageBreak(doc, y, 40)
  y = drawSectionHeader(doc, 2, 'Identificação Temporal e Espacial', 'FATO DENUNCIADO', y)

  drawInfoBox(doc, 'Data do Ocorrido', dataOcorrido, 18, y + 5, 60)
  drawInfoBox(doc, 'Horário Aproximado', data.hora_ocorrido || 'Não informado', 82, y + 5, 40)
  drawInfoBox(doc, 'Município', data.municipio || data.cidade || 'Não informado', 130, y + 5, 60)
  y += 16

  // Endereço completo
  const enderecoPartes = [data.local, data.numero, data.bairro].filter(Boolean).join(', ')
  const cepCidade = [data.cep ? `CEP ${data.cep}` : null, data.cidade].filter(Boolean).join(', ')
  const enderecoCompleto = [enderecoPartes, cepCidade].filter(Boolean).join(' — ')

  setFill(doc, C.light)
  setDraw(doc, C.border)
  doc.roundedRect(15, y, 180, 14, 1.5, 1.5, 'FD')
  setColor(doc, C.muted)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('ENDEREÇO COMPLETO', 20, y + 5)
  setColor(doc, C.dark)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text(enderecoCompleto || 'Não informado', 20, y + 11)
  y += 18

  // ── SEÇÃO 3 — Suposto Autor ──────────────────────────────────────────────────
  if (data.autor_nome) {
    y = checkPageBreak(doc, y, 50)
    y = drawSectionHeader(doc, 3, 'Suposto Autor da Conduta', 'IDENTIFICAÇÃO DECLARADA', y)

    setFill(doc, C.light)
    setDraw(doc, C.border)
    doc.roundedRect(15, y, 180, 36, 1.5, 1.5, 'FD')

    drawInfoBox(doc, 'Nome Completo', data.autor_nome, 20, y + 8, 80)
    drawInfoBox(doc, 'Cargo Declarado', data.cargo_agente || 'Não informado', 105, y + 8, 80)

    // Badges servidor / agente
    setColor(doc, C.muted)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('SERVIDOR PÚBLICO', 20, y + 20)
    drawBadge(doc, data.servidor_publico === 'sim' ? 'SIM' : 'NÃO', 20, y + 27,
      data.servidor_publico === 'sim' ? C.green : C.muted, C.white)

    setColor(doc, C.muted)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('AGENTE POLÍTICO', 70, y + 20)
    drawBadge(doc, data.agente_politico === 'sim' ? 'SIM' : 'NÃO', 70, y + 27,
      data.agente_politico === 'sim' ? C.green : C.muted, C.white)

    if (data.setor_servidor) {
      drawInfoBox(doc, 'Setor / Vinculação', data.setor_servidor, 105, y + 20, 80)
    }
    y += 40
  }

  // ── SEÇÃO 4 — Relato Circunstanciado ─────────────────────────────────────────
  y = checkPageBreak(doc, y, 30)
  y = drawSectionHeader(doc, 4, 'Relato Circunstanciado', 'NARRATIVA DO DENUNCIANTE', y)

  const relatoText = data.descricao || ''

  // Quebra o relato em parágrafos preservando quebras de linha do denunciante
  const paragrafos = relatoText.split(/\n+/).filter(p => p.trim())
  const lineHeight = 5.5
  const padding = 8

  let allLines: string[] = []
  for (const paragrafo of paragrafos) {
    const lines = doc.splitTextToSize(paragrafo, 166)
    allLines = [...allLines, ...lines, '']
  }
  // Remove última linha em branco extra
  if (allLines[allLines.length - 1] === '') allLines.pop()

  const relatoH = Math.max(allLines.length * lineHeight + padding * 2, 20)

  // Barra lateral azul + fundo claro
  setFill(doc, C.primary)
  doc.rect(15, y, 3, relatoH, 'F')
  setFill(doc, C.light)
  doc.rect(18, y, 177, relatoH, 'F')

  setColor(doc, C.dark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(allLines, 23, y + padding)
  y += relatoH + 6

  // ── SEÇÃO 5 — Testemunhas ────────────────────────────────────────────────────
  if (data.testemunhas && data.testemunhas.trim()) {
    const testemunhasList = data.testemunhas
      .split(/[\n,;]/)
      .map(t => t.trim())
      .filter(Boolean)

    y = checkPageBreak(doc, y, 20 + testemunhasList.length * 12)
    y = drawSectionHeader(doc, 5, 'Testemunhas Indicadas', `${testemunhasList.length.toString().padStart(2, '0')} PESSOAS APONTADAS`, y)

    const cardW = 85
    for (let i = 0; i < testemunhasList.length; i++) {
      const col = i % 2
      const xCard = 15 + col * (cardW + 10)
      if (col === 0 && i > 0) y += 14

      y = checkPageBreak(doc, y, 14)
      setFill(doc, C.light)
      setDraw(doc, C.border)
      doc.roundedRect(xCard, y, cardW, 12, 1.5, 1.5, 'FD')

      // Número
      setFill(doc, C.primary)
      doc.circle(xCard + 7, y + 6, 4, 'F')
      setColor(doc, C.white)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(String(i + 1), xCard + 7, y + 7.5, { align: 'center' })

      // Nome
      setColor(doc, C.dark)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      const nomeT = doc.splitTextToSize(testemunhasList[i], cardW - 18)
      doc.text(nomeT[0], xCard + 14, y + 5.5)

      // Papel (se tiver " — " separador)
      const partes = testemunhasList[i].split('—')
      if (partes.length > 1) {
        setColor(doc, C.primary)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        doc.text(partes[1].trim().toUpperCase(), xCard + 14, y + 10)
      }
    }
    // Se número ímpar, avançar linha
    if (testemunhasList.length % 2 !== 0) y += 14
    else y += 14
    y += 4
  }

  // ── SEÇÃO 6 — Evidências ─────────────────────────────────────────────────────
  const temLinks = data.links && data.links.length > 0
  const temArquivos = data.arquivos && data.arquivos.length > 0

  if (temLinks || temArquivos) {
    const totalEvidencias = (data.links?.length || 0) + (data.arquivos?.length || 0)
    y = checkPageBreak(doc, y, 20 + totalEvidencias * 14)
    y = drawSectionHeader(doc, 6, 'Evidências Apresentadas', `${String(totalEvidencias).padStart(2, '0')} ${totalEvidencias === 1 ? 'ITEM ANEXADO' : 'ITENS ANEXADOS'}`, y)

    // Links
    if (temLinks) {
      for (const link of data.links!) {
        y = checkPageBreak(doc, y, 14)
        setFill(doc, C.light)
        setDraw(doc, C.border)
        doc.roundedRect(15, y, 180, 12, 1.5, 1.5, 'FD')

        // Ícone play (simulado com triângulo) para vídeos; genérico para outros
        const isVideo = /instagram|youtube|youtu\.be|tiktok|vimeo/i.test(link)
        setFill(doc, C.primary)
        doc.roundedRect(18, y + 2, 8, 8, 1, 1, 'F')
        setColor(doc, C.white)
        doc.setFontSize(7)
        doc.text(isVideo ? '▶' : '🔗', 22, y + 7.5, { align: 'center' })

        setColor(doc, C.muted)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        doc.text(isVideo ? 'VÍDEO · LINK EXTERNO' : 'LINK EXTERNO', 29, y + 5)
        setColor(doc, C.primary)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const linkLine = doc.splitTextToSize(link, 158)
        doc.text(linkLine[0], 29, y + 9.5)
        y += 14
      }
    }

    // Arquivos
    if (temArquivos) {
      for (const arq of data.arquivos!) {
        y = checkPageBreak(doc, y, 14)
        setFill(doc, C.light)
        setDraw(doc, C.border)
        doc.roundedRect(15, y, 180, 12, 1.5, 1.5, 'FD')

        setFill(doc, C.muted)
        doc.roundedRect(18, y + 2, 8, 8, 1, 1, 'F')
        setColor(doc, C.white)
        doc.setFontSize(7)
        const tipoIcon = arq.type.startsWith('image/') ? '📷' : arq.type.startsWith('audio/') ? '🎵' : '📎'
        doc.text(tipoIcon, 22, y + 7.5, { align: 'center' })

        setColor(doc, C.muted)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        doc.text('ARQUIVO ANEXADO', 29, y + 5)
        setColor(doc, C.dark)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(arq.name, 29, y + 9.5)
        y += 14
      }
    }
    y += 4
  }

  // ── BLOCO DE INTEGRIDADE DOCUMENTAL ─────────────────────────────────────────
  y = checkPageBreak(doc, y, 58)

  setDraw(doc, C.border)
  doc.setLineWidth(0.3)
  doc.line(15, y, 195, y)
  y += 6

  // QR Code — gerado a partir da URL de verificação pública do protocolo
  const verificarUrl = `https://${appUrl}/acompanhar/${data.protocolo}`
  let qrYStart = y
  try {
    const qrDataUrl = await QRCode.toDataURL(verificarUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#021691', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
    // QR code posicionado à direita (32×32mm)
    doc.addImage(qrDataUrl, 'PNG', 158, y, 32, 32)
    setColor(doc, C.muted)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'bold')
    doc.text('VERIFICAR AUTENTICIDADE', 174, y + 34, { align: 'center' })
  } catch (err) {
    console.warn('[pdf] Falha ao gerar QR code:', err)
  }

  setColor(doc, C.primary)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('VALIDAÇÃO E INTEGRIDADE DOCUMENTAL', 15, y)
  y += 6

  setColor(doc, C.muted)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  const integridadeText = `Este documento foi gerado automaticamente pela plataforma ${appName} e possui validade como registro de manifestação cidadã, nos termos da Lei nº 13.460/2017. A integridade do conteúdo pode ser verificada mediante o hash criptográfico abaixo ou pelo QR Code ao lado.`
  const integridadeLines = doc.splitTextToSize(integridadeText, 138)
  doc.text(integridadeLines, 15, y)
  y += integridadeLines.length * 4.5 + 4

  // Box do hash
  if (data.sha256) {
    setFill(doc, C.primary)
    doc.roundedRect(15, y, 138, 12, 1.5, 1.5, 'F')
    setColor(doc, C.muted)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text('SHA-256 · HASH DE INTEGRIDADE', 20, y + 4.5)
    setColor(doc, C.yellow)
    doc.setFontSize(6.5)
    doc.setFont('courier', 'bold')
    // Quebra o hash em duas linhas de 32 chars para caber no box
    doc.text(data.sha256.slice(0, 34), 20, y + 9.5)
    if (data.sha256.length > 34) {
      doc.text(data.sha256.slice(34), 20, y + 13.5)
    }
    y += 18
  }

  // Garantir que y avance pelo menos até o fim do QR code
  y = Math.max(y, qrYStart + 38)

  // Rodapé final
  y += 4
  setDraw(doc, C.border)
  doc.line(15, y, 195, y)
  y += 5

  setColor(doc, C.primary)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(`${appName} · Plataforma Cívica Independente de Ouvidoria Digital · ${appUrl}`, 105, y, { align: 'center' })
  setFill(doc, C.yellow)
  const iniciativaW = doc.getTextWidth('INICIATIVA INDEPENDENTE') + 8
  doc.roundedRect(105 + doc.getTextWidth(`${appName} · Plataforma Cívica Independente de Ouvidoria Digital · ${appUrl}`) / 2 + 4, y - 4, iniciativaW, 6, 1, 1, 'F')
  setColor(doc, C.primary)
  doc.text('INICIATIVA INDEPENDENTE', 105 + doc.getTextWidth(`${appName} · Plataforma Cívica Independente de Ouvidoria Digital · ${appUrl}`) / 2 + 4 + iniciativaW / 2, y, { align: 'center' })

  y += 5
  setColor(doc, C.muted)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Em conformidade com a LGPD (Lei nº 13.709/2018), a Lei de Acesso à Informação (Lei nº 12.527/2011) e a Lei nº 13.460/2017.', 105, y, { align: 'center' })
  y += 4
  doc.text('Governança e Inteligência Cívica · Mato Grosso do Sul, Brasil', 105, y, { align: 'center' })

  // Número de página em todas as páginas
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const h = doc.internal.pageSize.getHeight()
    setFill(doc, C.border)
    doc.rect(0, h - 10, 210, 10, 'F')
    setColor(doc, C.muted)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(`${appName} — Ouvidoria Cívica Independente`, 15, h - 4)
    doc.text(`${data.protocolo}`, 105, h - 4, { align: 'center' })
    doc.text(`Página ${i} de ${totalPages}`, 195, h - 4, { align: 'right' })
  }

  // ── PÁGINAS DE IMAGENS ANEXADAS ──────────────────────────────────────────────
  if (data.arquivos && data.arquivos.length > 0) {
    const imagens = data.arquivos.filter(a => a.type.startsWith('image/'))
    for (const img of imagens) {
      try {
        const response = await fetch(img.url)
        if (!response.ok) continue
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const imgType = img.type.includes('jpeg') || img.type.includes('jpg') ? 'JPEG' : 'PNG'

        doc.addPage()
        setFill(doc, C.primary)
        doc.rect(0, 0, 210, 18, 'F')
        setColor(doc, C.white)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`ANEXO: ${img.name}`, 15, 11)
        doc.addImage(base64, imgType, 15, 25, 180, 0)
      } catch (err) {
        console.warn(`[pdf] Falha ao adicionar imagem ${img.name}:`, err)
      }
    }
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
