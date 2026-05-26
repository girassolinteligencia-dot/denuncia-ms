'use client'
import { gerarEmailOrgao } from '@/lib/email-template'

interface Props {
  protocolo: string
  categoria: string
  titulo: string
  descricao: string
  local: string
  data_ocorrido: string
  anonima?: boolean
  nome: string
  email: string
  telefone: string
  cpf: string
  totalArquivos: number
  links?: string[]
}

export function EmailPreview(props: Props) {
  const html = gerarEmailOrgao({
    protocolo: 'PREVIEW',
    categoria: props.categoria,
    orgao: 'Órgão Competente',
    titulo: props.titulo || '(Título da denuncia)',
    descricao: props.descricao || '(Descrição da denuncia)',
    local: props.local || 'Não informado',
    data_ocorrido: props.data_ocorrido || new Date().toISOString(),
    anonima: props.anonima,
    nome: props.anonima ? undefined : (props.nome || '(Seu nome)'),
    email: props.anonima ? undefined : (props.email || '(Seu e-mail)'),
    telefone: props.anonima ? undefined : (props.telefone || '(Seu telefone)'),
    cpf: props.anonima ? undefined : (props.cpf || '(Seu CPF)'),
    totalArquivos: props.totalArquivos,
    links: props.links,
    criado_em: new Date().toISOString(),
    baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  })

  return (
    <div
      className="rounded-xl overflow-auto max-h-[600px] border border-border bg-[#f0f4f8]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
