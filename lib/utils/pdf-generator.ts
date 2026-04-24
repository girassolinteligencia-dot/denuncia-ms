import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DenunciaExportData {
  protocolo: string
  titulo: string
  categoria: string
  descricao: string
  local: string
  data_ocorrido: string | null
  criado_em: string
  status: string
  anonima: boolean
  nome?: string | null
  email?: string | null
  telefone?: string | null
}

export const generateDenunciaPDF = (denuncia: DenunciaExportData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Cores da Identidade
  const PRIMARY = [21, 53, 201] // #1535C9
  const SECONDARY = [245, 200, 0] // #F5C800
  const DARK = [17, 24, 39]
  const MUTED = [107, 114, 128]

  // --- HEADER ---
  // Marca do Megafone (Simulada com polígonos simples)
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.roundedRect(15, 15, 12, 12, 2, 2, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('!', 20.5, 23.5) // Pequeno ícone simbólico

  // Texto Logo
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DENUNCIA MS', 30, 22)
  
  doc.setFontSize(7)
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2])
  doc.text('MATO GROSSO DO SUL', 30, 26)

  // Título do Documento à Direita
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('RELATÓRIO DE OCORRÊNCIA CÍVICA', pageWidth - 15, 22, { align: 'right' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Protocolo: ${denuncia.protocolo}`, pageWidth - 15, 26, { align: 'right' })

  // Linha divisória
  doc.setDrawColor(229, 231, 235)
  doc.line(15, 35, pageWidth - 15, 35)

  // --- BODY ---
  
  // Título e Status
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  const splitTitle = doc.splitTextToSize(denuncia.titulo.toUpperCase(), pageWidth - 30)
  doc.text(splitTitle, 15, 48)
  
  const titleHeight = (splitTitle.length * 7)
  
  // Badge de Status
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.roundedRect(15, 48 + titleHeight, 35, 6, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.text(`STATUS: ${denuncia.status.toUpperCase()}`, 17, 52 + titleHeight)

  // Grid de Informações
  let currentY = 65 + titleHeight

  const drawInfoBox = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text(label.toUpperCase(), x, y)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK[0], DARK[1], DARK[2])
    doc.text(value, x, y + 5)
  }

  drawInfoBox('Categoria', denuncia.categoria, 15, currentY)
  drawInfoBox('Data da Ocorrência', denuncia.data_ocorrido ? format(new Date(denuncia.data_ocorrido), 'dd/MM/yyyy') : 'Não informada', 85, currentY)
  drawInfoBox('Localização', denuncia.local || 'Não informada', 145, currentY)

  currentY += 20

  // Identificação do Denunciante
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(15, currentY, pageWidth - 30, 25, 2, 2, 'F')
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(15, currentY, pageWidth - 30, 25, 2, 2, 'S')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
  doc.text('IDENTIFICAÇÃO DO CIDADÃO', 20, currentY + 7)

  if (denuncia.anonima) {
    doc.setFontSize(9)
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text('DENUNCIA REALIZADA SOB ANONIMATO (IDENTIDADE PROTEGIDA)', 20, currentY + 15)
  } else {
    doc.setFontSize(9)
    doc.setTextColor(DARK[0], DARK[1], DARK[2])
    doc.text(`Nome: ${denuncia.nome || 'N/A'}`, 20, currentY + 15)
    doc.text(`E-mail: ${denuncia.email || 'N/A'}`, 75, currentY + 15)
    doc.text(`Tel: ${denuncia.telefone || 'N/A'}`, 140, currentY + 15)
  }

  currentY += 35

  // Relato Detalhado
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  doc.text('RELATO DETALHADO', 15, currentY)
  
  doc.setDrawColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.setLineWidth(0.5)
  doc.line(15, currentY + 2, 25, currentY + 2)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const descriptionLines = doc.splitTextToSize(denuncia.descricao, pageWidth - 30)
  doc.text(descriptionLines, 15, currentY + 10)

  // --- FOOTER ---
  const footerY = doc.internal.pageSize.getHeight() - 25
  doc.setDrawColor(229, 231, 235)
  doc.line(15, footerY, pageWidth - 15, footerY)

  doc.setFontSize(7)
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
  doc.setFont('helvetica', 'italic')
  const footerText = 'Este documento é um registro gerado pela plataforma DENUNCIA MS. O conteúdo do relato é de inteira responsabilidade do denunciante conforme os Termos de Uso e a Lei de Acesso à Informação (Lei nº 12.527/2011). O DENUNCIA MS é uma plataforma cívica independente e não possui vínculo direto com a administração pública estadual.'
  const splitFooter = doc.splitTextToSize(footerText, pageWidth - 30)
  doc.text(splitFooter, 15, footerY + 5)

  doc.setFont('helvetica', 'bold')
  doc.text(`Documento emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, 15, footerY + 18)
  doc.text(`Validar em: denunciams.com.br/acompanhar`, pageWidth - 15, footerY + 18, { align: 'right' })

  // Salvar
  doc.save(`denuncia-${denuncia.protocolo}.pdf`)
}
