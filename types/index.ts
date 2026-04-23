export type UserRole = 'superadmin' | 'admin' | 'moderador' | 'gestor_cupula'

export interface Profile {
  id: string
  nome: string
  role: UserRole
  criado_em: string
}

export interface PlataformaConfig {
  id: string
  chave: string
  valor: unknown
  atualizado_em: string
  atualizado_por: string | null
}

export interface ConfigTipoArquivo {
  id: string
  tipo: 'foto' | 'audio' | 'video' | 'pdf' | 'documento'
  ativo: boolean
  qtd_maxima: number
  tamanho_max_mb: number
  duracao_max_seg: number | null
  atualizado_em: string
}

export type TipoTemplate = 'cabecalho' | 'rodape' | 'email_orgao' | 'email_denunciante'

export interface ConfigTemplate {
  id: string
  tipo: TipoTemplate
  conteudo: string
  variaveis_disponiveis: VariavelTemplate[]
  incluir_qrcode: boolean
  atualizado_em: string
  atualizado_por: string | null
}

export interface VariavelTemplate {
  chave: string
  descricao: string
}

export interface ConfigProtocolo {
  id: string
  prefixo: string
  separador: string
  formato_ano: 'YYYY' | 'YY'
  digitos_seq: 4 | 5 | 6
  sequencia_atual: number
  resetado_em: string | null
}

export type VisibilidadeCampo = 'obrigatorio' | 'opcional' | 'oculto'

export interface ConfigCampoFormulario {
  id: string
  campo: string
  label: string
  placeholder: string | null
  obrigatorio: boolean
  visivel: boolean
  validacao_regex: string | null
  ordem: number
  atualizado_em: string
}

export interface Categoria {
  id: string
  slug: string
  label: string
  bloco: string
  emoji: string | null
  instrucao_publica: string | null
  aviso_legal: string | null
  template_descricao: { topico: string; placeholder: string }[]
  email_destino?: string
  ativo: boolean
  ordem: number
  criado_em: string
  atualizado_em: string
}

export type TipoIntegracao = 'email' | 'webhook' | 'ambos'
export type PrioridadeEmail = 'normal' | 'urgente' | 'confidencial'
export type TipoAuthWebhook = 'none' | 'bearer' | 'basic' | 'apikey'
export type MetodoWebhook = 'POST' | 'PUT'

export interface IntegracaoDestino {
  id: string
  categoria_id: string
  tipo: TipoIntegracao
  email_para: string[] | null
  webhook_url: string | null
  webhook_metodo: MetodoWebhook
  webhook_auth_tipo: TipoAuthWebhook
  webhook_auth_dados: unknown | null
  webhook_retry_max: number
  ativo: boolean
}

export type StatusDenuncia =
  | 'recebida'
  | 'em_analise'
  | 'encaminhada'
  | 'resolvida'
  | 'arquivada'

export interface Denuncia {
  id: string
  protocolo: string
  chave_acesso?: string
  categoria_id: string
  titulo: string
  descricao_original: string
  documento_final: string
  local: string | null
  cep: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  data_ocorrido: string | null
  status: StatusDenuncia,
  criado_em: string
  atualizado_em: string
  arquivos?: ArquivoDenuncia[]
  // Virtual fields — populated server-side by getDenunciaDetalhes (decrypted PII)
  denunciante_nome?: string | null
  denunciante_email?: string | null
  denunciante_telefone?: string | null
}

export interface ArquivoDenuncia {
  id: string
  denuncia_id: string
  tipo: string
  url: string
  bucket_path: string
  tamanho_bytes: number | null
  criado_em: string
}

export interface IdentidadeDenuncia {
  id: string
  denuncia_id: string
  nome_enc: string | null
  email_enc: string | null
  email_hash: string | null
  telefone_enc: string | null
  cpf_enc: string | null
  criado_em: string
}

export interface PdfAssinatura {
  id: string
  denuncia_id: string
  protocolo: string
  sha256: string
  gerado_em: string
}

export type StatusDespacho =
  | 'pendente'
  | 'pendente_pdf'
  | 'processando'
  | 'despachado'
  | 'erro'
  | 'falha_definitiva'

export interface DespachoQueue {
  id: string
  denuncia_id: string
  pdf_base64: string | null
  tentativas: number
  status: StatusDespacho
  ultimo_erro: string | null
  criado_em: string
  despachado_em: string | null
}

export type StatusIntegracao = 'sucesso' | 'falha' | 'pendente'

export interface LogIntegracao {
  id: string
  denuncia_id: string
  integracao_id: string
  tipo: TipoIntegracao
  status: StatusIntegracao
  resposta_body: string | null
  tentativa: number
  disparado_em: string
}

export interface LogAuditoria {
  id: string
  usuario_id: string
  acao: string
  tabela: string
  registro_id: string | null
  valor_anterior: unknown | null
  valor_novo: unknown | null
  criado_em: string
}

export interface AuditIdentidade {
  id: number
  tabela: string
  operacao: string
  registro_id: string | null
  usuario_id: string | null
  role_usado: string | null
  acessado_em: string
}

export interface SubmitDenunciaRequest {
  categoria_id: string
  titulo: string
  descricao_original: string
  local?: string
  cep?: string
  numero?: string
  bairro?: string
  cidade?: string
  data_ocorrido?: string,
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  otpToken?: string
}

export interface ConsultaProtocoloResponse {
  protocolo: string
  status: StatusDenuncia
  categoria: string
  titulo: string
  criado_em: string
  atualizado_em: string
  historico: { status: StatusDenuncia; alterado_em: string }[]
}
