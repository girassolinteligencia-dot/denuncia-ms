// =====================================================
// DENUNCIA MS — Tipagens TypeScript Globais
// =====================================================

// ─────────────────────────────────────────────────────────
// Roles e Auth
// ─────────────────────────────────────────────────────────

export type UserRole = 'superadmin' | 'admin' | 'moderador'

export interface Profile {
  id: string
  nome: string
  role: UserRole
  criado_em: string
}

// ─────────────────────────────────────────────────────────
// Configuração Central (Módulo 0)
// ─────────────────────────────────────────────────────────

export interface PlataformaConfig {
  id: string
  chave: string
  valor: unknown // jsonb — tipado nos helpers específicos
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
  chave: string       // ex: "{{protocolo}}"
  descricao: string   // ex: "Número do protocolo"
}

export interface ConfigProtocolo {
  id: string
  prefixo: string       // padrão: "DNS"
  separador: string     // padrão: "-"
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

// ─────────────────────────────────────────────────────────
// Categorias e Integrações
// ─────────────────────────────────────────────────────────

export interface TopicoDescricao {
  topico: string
  placeholder: string
}

export interface Categoria {
  id: string
  slug: string
  label: string
  bloco: string
  emoji: string | null
  instrucao_publica: string | null
  aviso_legal: string | null
  template_descricao: TopicoDescricao[]
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
  // e-mail
  email_para: string[] | null
  email_cc: string[] | null
  email_bcc: string[] | null
  email_assunto_template: string | null
  prioridade: PrioridadeEmail
  // webhook
  webhook_url: string | null
  webhook_metodo: MetodoWebhook
  webhook_headers: Record<string, string> | null
  webhook_auth_tipo: TipoAuthWebhook
  webhook_auth_dados: unknown | null  // criptografado em repouso
  webhook_body_template: string | null
  webhook_timeout: number
  webhook_retry_max: number
  // controle
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

// ─────────────────────────────────────────────────────────
// Denúncias
// ─────────────────────────────────────────────────────────

export type StatusDenuncia =
  | 'recebida'
  | 'em_analise'
  | 'encaminhada'
  | 'resolvida'
  | 'arquivada'

export interface Denuncia {
  id: string
  protocolo: string
  categoria_id: string
  titulo: string
  descricao_original: string
  documento_final: string
  local: string | null
  data_ocorrido: string | null
  status: StatusDenuncia
  anonima: boolean
  denunciante_nome: string | null
  denunciante_email: string | null
  denunciante_telefone: string | null
  denunciante_cpf: string | null
  denunciante_id: string | null
  cabecalho_snapshot: string | null
  rodape_snapshot: string | null
  protocolo_config_snapshot: ConfigProtocolo | null
  criado_em: string
  atualizado_em: string
  // joins opcionais
  categoria?: Categoria
  arquivos?: ArquivoDenuncia[]
}

export interface ArquivoDenuncia {
  id: string
  denuncia_id: string
  tipo: ConfigTipoArquivo['tipo']
  url: string
  bucket_path: string
  tamanho_bytes: number | null
  ordem: number
  criado_em: string
}

// ─────────────────────────────────────────────────────────
// Log de Integrações
// ─────────────────────────────────────────────────────────

export type StatusIntegracao = 'sucesso' | 'falha' | 'pendente'

export interface LogIntegracao {
  id: string
  denuncia_id: string
  integracao_id: string
  tipo: TipoIntegracao
  status: StatusIntegracao
  resposta_http: number | null
  resposta_body: string | null
  tentativa: number
  disparado_em: string
}

// ─────────────────────────────────────────────────────────
// Auditoria
// ─────────────────────────────────────────────────────────

export interface LogAuditoria {
  id: string
  usuario_id: string
  acao: string
  tabela: string
  registro_id: string | null
  valor_anterior: unknown | null
  valor_novo: unknown | null
  ip: string | null
  criado_em: string
  // join opcional
  usuario?: Profile
}

// ─────────────────────────────────────────────────────────
// Notícias e Banners
// ─────────────────────────────────────────────────────────

export interface Noticia {
  id: string
  titulo: string
  slug: string
  conteudo: string
  categoria: string | null
  imagem_url: string | null
  autor_id: string | null
  publicado: boolean
  publicado_em: string | null
  criado_em: string
}

export type PosicaoBanner = 'topo' | 'lateral' | 'rodape'

export interface Banner {
  id: string
  posicao: PosicaoBanner
  imagem_url: string
  link_url: string | null
  ativo: boolean
  ordem: number
}

// ─────────────────────────────────────────────────────────
// API — Request/Response Helpers
// ─────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  code?: string
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

export interface SubmitDenunciaRequest {
  categoria_id: string
  titulo: string
  descricao_original: string
  local?: string
  data_ocorrido?: string
  anonima: boolean
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  arquivos_ids?: string[]  // IDs dos uploads já realizados
}

export interface SubmitDenunciaResponse {
  protocolo: string
  mensagem: string
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

// ─────────────────────────────────────────────────────────
// Formulário Público — Steps
// ─────────────────────────────────────────────────────────

export interface FormStep1Data {
  categoria_id: string
  titulo: string
  local: string
  data_ocorrido: string
  anonima: boolean
  nome: string
  email: string
  telefone: string
  cpf: string
}

export interface FormStep2Data {
  descricao_original: string
  topicos: Record<string, string>  // { "topico_slug": "texto digitado" }
}

export interface FormStep3Data {
  arquivos: File[]
  arquivos_uploaded: { id: string; url: string; tipo: string }[]
}

export interface FormCompleto extends FormStep1Data, FormStep2Data, FormStep3Data {}
