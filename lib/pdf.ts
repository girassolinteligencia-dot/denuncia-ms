import { jsPDF } from 'jspdf'
import { getConfigsByPrefix } from './config'
import { formatarDocumento } from './documento'

interface PDFData {
  protocolo: string
  categoria: string
  titulo: string
  descricao: string
  local: string
  data_ocorrido: string
  criado_em: string
  anonima: boolean
  nome?: string
  email?: string
  telefone?: string
  orgao_nome: string
}

/**
 * Gera o documento PDF da denúncia baseado nos templates do Módulo 0.
 */
export async function gerarPDFDenuncia(data: PDFData): Promise<Buffer> {
  const doc = new jsPDF()
  
  // 1. Busca configurações de identidade e templates
  const ident = await getConfigsByPrefix('identidade') as Record<string, string>

  const primaryColor = '#021691'

  // Formata o conteúdo usando o motor de templates (lib/documento.ts)
  const cabecalho = await formatarDocumento('cabecalho', {
    protocolo: data.protocolo,
    categoria: data.categoria,
    data_envio: new Date(data.criado_em).toLocaleDateString('pt-BR'),
    hora_envio: new Date(data.criado_em).toLocaleTimeString('pt-BR'),
    orgao_nome: data.orgao_nome,
    local: data.local,
    anonima: !!data.anonima,
  })

  const rodape = await formatarDocumento('rodape', {
    protocolo: data.protocolo,
    app_nome: ident['identidade.nome'] || 'DENUNCIA MS',
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'denunciams.com.br',
    data_envio: new Date(data.criado_em).toLocaleDateString('pt-BR'),
    hora_envio: new Date(data.criado_em).toLocaleTimeString('pt-BR'),
    nome: data.nome,
    email: data.email,
    anonima: data.anonima
  })

  // 2. Desenha o PDF
  // Header Blue Bar
  doc.setFillColor(primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  const appName = ident['identidade.nome'] ? String(ident['identidade.nome']).toUpperCase() : 'DENUNCIA MS'
  doc.text(appName, 15, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('DOCUMENTO OFICIAL DE OUVIDORIA DIGITAL', 15, 30)

  // Protocolo Badge
  doc.setFillColor(245, 200, 0) // Accent Yellow
  doc.rect(140, 15, 55, 12, 'F')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(data.protocolo, 145, 23)

  // Conteúdo - Cabeçalho Configurado
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(11)
  const cabecalhoLines = doc.splitTextToSize(cabecalho, 180)
  doc.text(cabecalhoLines, 15, 60)

  // Divider
  let y = 60 + (cabecalhoLines.length * 6) + 10
  doc.setDrawColor(200, 200, 200)
  doc.line(15, y, 195, y)

  // Corpo da Denúncia
  y += 15
  doc.setFont('helvetica', 'bold')
  doc.text('RELATO DO CIDADÃO:', 15, y)
  
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  const relatoLines = doc.splitTextToSize(data.descricao, 180)
  doc.text(relatoLines, 15, y)

  // Rodapé
  y = 270
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  const rodapeLines = doc.splitTextToSize(rodape, 180)
  doc.text(rodapeLines, 15, y)

  // Retorna como buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
