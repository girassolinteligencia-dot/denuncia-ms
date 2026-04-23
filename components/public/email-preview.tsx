'use client'
import { gerarEmailOrgao } from '@/lib/email-template'

interface Props {
  protocolo: string
  categoria: string
  titulo: string
  descricao: string
  local: string
  data_ocorrido: string
  nome: string
  email: string
  telefone: string
  cpf: string
  totalArquivos: number
}

export function EmailPreview(props: Props) {
  const html = gerarEmailOrgao({
    protocolo: 'PREVIEW',
    categoria: props.categoria,
    orgao: 'Órgão Competente',
    titulo: props.titulo || '(Título da denúncia)',
    descricao: props.descricao || '(Descrição da denúncia)',
    local: props.local || 'Não informado',
    data_ocorrido: props.data_ocorrido || new Date().toISOString(),
    identificada: true,
    nome: props.nome || '(Seu nome)',
    email: props.email || '(Seu e-mail)',
    telefone: props.telefone || '(Seu telefone)',
    cpf: props.cpf || '(Seu CPF)',
    totalArquivos: props.totalArquivos,
    criado_em: new Date().toISOString(),
  })

  return (
    <div
      className="rounded-xl overflow-auto max-h-[600px] border border-border bg-[#f0f4f8]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
