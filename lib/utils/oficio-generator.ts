import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DenunciaParaOficio } from '@/lib/actions/admin-oficios'

// Paleta DENUNCIA MS
const AZUL: [number, number, number]  = [21, 53, 201]
const AMARELO: [number, number, number] = [245, 200, 0]
const DARK: [number, number, number]  = [17, 24, 39]
const MUTED: [number, number, number] = [107, 114, 128]
const LIGHT: [number, number, number] = [243, 244, 246]
const WHITE: [number, number, number] = [255, 255, 255]

function calcularHashSimples(texto: string): string {
  // Hash FNV-1a 64-bit simulado em JS (sem crypto, roda no browser)
  let h1 = 0x811c9dc5
  let h2 = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193)
    h2 = Math.imul(h2 ^ c, 0x01000193) ^ (i & 0xff)
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0')
  return `${toHex(h1)}${toHex(h2)}${toHex(h1 ^ h2)}${toHex(h2 ^ h1)}`
    .toUpperCase()
    .replace(/(.{8})/g, '$1-')
    .slice(0, 47)
}

function adicionarCabecalho(doc: jsPDF, denuncia: DenunciaParaOficio, paginaAtual: number, totalPaginas: number) {
  const W = doc.internal.pageSize.getWidth()

  // Faixa azul no topo
  doc.setFillColor(...AZUL)
  doc.rect(0, 0, W, 28, 'F')

  // Linha amarela abaixo da faixa
  doc.setFillColor(...AMARELO)
  doc.rect(0, 28, W, 2.5, 'F')

  // Logo textual: DENUNCIA MS
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('DENUNCIA', 14, 13)

  doc.setTextColor(...AMARELO)
  doc.setFontSize(16)
  doc.text('MS', 14 + doc.getTextWidth('DENUNCIA '), 13)

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('denunciams.com.br', 14, 19)
  doc.text('Plataforma Cívica de Transparência — Mato Grosso do Sul', 14, 24)

  // Número do ofício (direita)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...WHITE)
  doc.text(denuncia.numero_oficio, W - 14, 13, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`Pág. ${paginaAtual} de ${totalPaginas}`, W - 14, 19, { align: 'right' })

  const emitidoEm = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  doc.text(`Emitido em: ${emitidoEm}`, W - 14, 24, { align: 'right' })
}

function adicionarRodape(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  doc.setFillColor(...AZUL)
  doc.rect(0, H - 14, W, 14, 'F')

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.text(
    'Este documento é um registro oficial gerado pela plataforma DENUNCIA MS. O conteúdo é de responsabilidade do denunciante, conforme a Lei nº 12.527/2011 (LAI).',
    W / 2, H - 8, { align: 'center', maxWidth: W - 28 }
  )
  doc.setFont('helvetica', 'normal')
  doc.text('denunciams.com.br  ·  Mato Grosso do Sul, Brasil', W / 2, H - 4, { align: 'center' })
}

function secaoTitulo(doc: jsPDF, titulo: string, y: number): number {
  doc.setFillColor(...AZUL)
  doc.rect(14, y, 3, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...AZUL)
  doc.text(titulo.toUpperCase(), 20, y + 4)
  doc.setDrawColor(...LIGHT)
  doc.setLineWidth(0.3)
  doc.line(14, y + 6, doc.internal.pageSize.getWidth() - 14, y + 6)
  return y + 11
}

function campoLinha(doc: jsPDF, label: string, valor: string, x: number, y: number, largura: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(label.toUpperCase(), x, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK)
  const linhas = doc.splitTextToSize(valor || '—', largura)
  doc.text(linhas, x, y + 4.5)
  return linhas.length * 4.5
}

function bloco(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setFillColor(...LIGHT)
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')
}

function linhaAssinatura(doc: jsPDF, label: string, x: number, y: number, w: number) {
  doc.setDrawColor(...DARK)
  doc.setLineWidth(0.4)
  doc.line(x, y, x + w, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(label, x, y + 4)
}

export function gerarOficioLote(denuncias: DenunciaParaOficio[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const total = denuncias.length
  const MARGEM = 14
  const INICIO_CONTEUDO = 38

  denuncias.forEach((denuncia, idx) => {
    if (idx > 0) doc.addPage()

    const pagina = idx + 1
    adicionarCabecalho(doc, denuncia, pagina, total)
    adicionarRodape(doc)

    let y = INICIO_CONTEUDO

    // ── TÍTULO DO DOCUMENTO ──────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...DARK)
    doc.text('OFÍCIO DE DENÚNCIA', W / 2, y + 4, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('Para entrega manual aos órgãos de controle', W / 2, y + 10, { align: 'center' })
    y += 18

    // ── BLOCO: IDENTIFICAÇÃO ─────────────────────────────────────────
    y = secaoTitulo(doc, 'Identificação do Registro', y)
    bloco(doc, MARGEM, y, W - MARGEM * 2, 24)
    y += 3

    const colW = (W - MARGEM * 2 - 8) / 3
    campoLinha(doc, 'Número do Ofício', denuncia.numero_oficio, MARGEM + 4, y, colW)
    campoLinha(doc, 'Protocolo', denuncia.protocolo, MARGEM + 4 + colW + 4, y, colW)

    const dataRegistro = format(new Date(denuncia.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    campoLinha(doc, 'Data de Registro', dataRegistro, MARGEM + 4 + (colW + 4) * 2, y, colW)
    y += 12

    const dataOcorrido = denuncia.data_ocorrido
      ? format(new Date(denuncia.data_ocorrido), 'dd/MM/yyyy', { locale: ptBR })
      : 'Não informada'
    campoLinha(doc, 'Data da Ocorrência', dataOcorrido, MARGEM + 4, y, colW)
    campoLinha(doc, 'Categoria', denuncia.categoria, MARGEM + 4 + colW + 4, y, colW)
    campoLinha(doc, 'Status', denuncia.status.replace('_', ' ').toUpperCase(), MARGEM + 4 + (colW + 4) * 2, y, colW)
    y += 15

    // ── BLOCO: LOCALIZAÇÃO ───────────────────────────────────────────
    y = secaoTitulo(doc, 'Localização da Ocorrência', y)
    bloco(doc, MARGEM, y, W - MARGEM * 2, 14)
    y += 3

    const col2W = (W - MARGEM * 2 - 8) / 2
    const enderecoCompleto = [denuncia.local, denuncia.bairro].filter(Boolean).join(', ') || '—'
    campoLinha(doc, 'Endereço', enderecoCompleto, MARGEM + 4, y, col2W)
    campoLinha(doc, 'Município', denuncia.municipio || '—', MARGEM + 4 + col2W + 4, y, col2W)
    y += 14

    // ── BLOCO: DENUNCIANTE ───────────────────────────────────────────
    y = secaoTitulo(doc, 'Denunciante', y)
    bloco(doc, MARGEM, y, W - MARGEM * 2, 11)
    y += 3
    const identLabel = denuncia.anonima
      ? 'DENÚNCIA REALIZADA SOB ANONIMATO — IDENTIDADE PROTEGIDA PELA PLATAFORMA'
      : 'Dados disponíveis no sistema mediante autenticação administrativa'
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(identLabel, MARGEM + 4, y + 4)
    y += 14

    // ── BLOCO: RELATO ────────────────────────────────────────────────
    y = secaoTitulo(doc, 'Relato', y)

    const descLines = doc.splitTextToSize(denuncia.descricao_original || '—', W - MARGEM * 2 - 8)
    const descAltura = Math.max(20, descLines.length * 4.2 + 8)
    bloco(doc, MARGEM, y, W - MARGEM * 2, descAltura)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...DARK)
    doc.text(descLines, MARGEM + 4, y + 6)
    y += descAltura + 6

    // ── BLOCO: INTEGRIDADE ───────────────────────────────────────────
    y = secaoTitulo(doc, 'Integridade do Documento', y)
    bloco(doc, MARGEM, y, W - MARGEM * 2, 17)
    y += 3

    const hashBase = `${denuncia.protocolo}|${denuncia.numero_oficio}|${denuncia.descricao_original}|${denuncia.criado_em}`
    const hash = calcularHashSimples(hashBase)
    const geradoEm = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })

    doc.setFont('courier', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK)
    doc.text(`Hash SHA-like: ${hash}`, MARGEM + 4, y + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(`Gerado em: ${geradoEm}  ·  Verificar em: denunciams.com.br/acompanhar  ·  Protocolo: ${denuncia.protocolo}`, MARGEM + 4, y + 11)
    y += 22

    // ── BLOCO: RESPONSÁVEL PELO ENCAMINHAMENTO ───────────────────────
    const espacoRestante = H - 14 - y
    if (espacoRestante < 42) y = H - 14 - 42  // garante que não sobrepõe o rodapé

    y = secaoTitulo(doc, 'Responsável pelo Encaminhamento', y)
    bloco(doc, MARGEM, y, W - MARGEM * 2, 35)
    y += 6

    const assSW = (W - MARGEM * 2 - 16) / 2

    linhaAssinatura(doc, 'Assinatura', MARGEM + 4, y + 10, assSW)
    linhaAssinatura(doc, 'Nome completo', MARGEM + 4, y + 24, assSW)
    linhaAssinatura(doc, 'Data: ___/___/______', MARGEM + 4 + assSW + 8, y + 10, assSW)
  })

  const timestamp = format(new Date(), 'yyyyMMdd-HHmm')
  doc.save(`oficios-denuncia-${timestamp}.pdf`)
}
