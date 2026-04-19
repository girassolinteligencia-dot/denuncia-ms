/**
 * Monta o documento final de uma denúncia substituindo variáveis dinâmicas
 * nos templates de cabeçalho e rodapé configurados no Módulo 0.
 *
 * Variáveis suportadas: {{protocolo}}, {{categoria}}, {{data_envio}},
 * {{hora_envio}}, {{local}}, {{orgao_nome}}, {{nome}}, {{email}},
 * {{app_nome}}, {{app_url}}, {{anonima}}
 */

export interface VariaveisDocumento {
  protocolo: string
  categoria: string
  categoria_slug: string
  data_envio: string     // DD/MM/YYYY
  hora_envio: string     // HH:mm
  local: string
  orgao_nome: string
  anonima: boolean
  nome?: string
  email?: string
  telefone?: string
  app_nome: string
  app_url: string
}

/**
 * Substitui todas as variáveis {{chave}} em um template.
 */
export function substituirVariaveis(
  template: string,
  variaveis: VariaveisDocumento
): string {
  let resultado = template

  // Substituições diretas
  const substituicoes: Record<string, string> = {
    '{{protocolo}}': variaveis.protocolo,
    '{{categoria}}': variaveis.categoria,
    '{{categoria_slug}}': variaveis.categoria_slug,
    '{{data_envio}}': variaveis.data_envio,
    '{{hora_envio}}': variaveis.hora_envio,
    '{{local}}': variaveis.local || 'Não informado',
    '{{orgao_nome}}': variaveis.orgao_nome,
    '{{nome}}': variaveis.nome || '',
    '{{email}}': variaveis.email || '',
    '{{telefone}}': variaveis.telefone || '',
    '{{app_nome}}': variaveis.app_nome,
    '{{app_url}}': variaveis.app_url,
    '{{anonima}}': variaveis.anonima ? 'Anônimo' : (variaveis.nome || ''),
  }

  for (const [chave, valor] of Object.entries(substituicoes)) {
    resultado = resultado.replaceAll(chave, valor)
  }

  // Bloco condicional {{#unless anonima}} ... {{/unless}}
  if (variaveis.anonima) {
    resultado = resultado.replace(/\{\{#unless anonima\}\}[\s\S]*?\{\{\/unless\}\}/g, '')
  } else {
    resultado = resultado
      .replace(/\{\{#unless anonima\}\}/g, '')
      .replace(/\{\{\/unless\}\}/g, '')
  }

  return resultado.trim()
}

/**
 * Monta o documento final completo:
 * [CABEÇALHO] + [CORPO] + [RODAPÉ]
 */
export function montarDocumentoFinal(params: {
  cabecalho: string
  corpo: string
  rodape: string
  variaveis: VariaveisDocumento
}): string {
  const cabecalhoRenderizado = substituirVariaveis(params.cabecalho, params.variaveis)
  const rodapeRenderizado = substituirVariaveis(params.rodape, params.variaveis)

  return [
    cabecalhoRenderizado,
    '',
    '─'.repeat(60),
    '',
    params.corpo,
    '',
    '─'.repeat(60),
    '',
    rodapeRenderizado,
  ].join('\n')
}

/**
 * Constrói as variáveis de documento a partir dos dados da denúncia.
 */
export function construirVariaveis(params: {
  protocolo: string
  categoriaNome: string
  categoriaSlug: string
  orgaoNome: string
  local: string
  anonima: boolean
  nome?: string
  email?: string
  telefone?: string
}): VariaveisDocumento {
  const agora = new Date()
  const brasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))

  const pad = (n: number) => n.toString().padStart(2, '0')
  const data_envio = `${pad(brasilia.getDate())}/${pad(brasilia.getMonth() + 1)}/${brasilia.getFullYear()}`
  const hora_envio = `${pad(brasilia.getHours())}:${pad(brasilia.getMinutes())}`

  return {
    protocolo: params.protocolo,
    categoria: params.categoriaNome,
    categoria_slug: params.categoriaSlug,
    data_envio,
    hora_envio,
    local: params.local,
    orgao_nome: params.orgaoNome,
    anonima: params.anonima,
    nome: params.nome,
    email: params.email,
    telefone: params.telefone,
    app_nome: process.env.NEXT_PUBLIC_APP_NAME ?? 'DENUNCIA MS',
    app_url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  }
}

/**
 * Busca o template no banco (via caches) e formata com as variáveis
 */
export async function formatarDocumento(
  tipo: 'cabecalho' | 'rodape',
  variaveis: Partial<VariaveisDocumento>
): Promise<string> {
  const { getConfigsByPrefix } = await import('./config')
  const configs = await getConfigsByPrefix('config_templates')
  
  const template = configs[`config_templates.${tipo}`] || (tipo === 'cabecalho' ? 'Protocolo: {{protocolo}}' : 'Gerado em: {{data_envio}}')
  
  // Como substituirVariaveis espera VariaveisDocumento completo, fazemos o merge com defaults
  const varsCompletas = construirVariaveis({
    protocolo: variaveis.protocolo || '',
    categoriaNome: variaveis.categoria || '',
    categoriaSlug: variaveis.categoria_slug || '',
    orgaoNome: variaveis.orgao_nome || '',
    local: variaveis.local || '',
    anonima: !!variaveis.anonima,
    nome: variaveis.nome,
    email: variaveis.email,
    telefone: variaveis.telefone
  })

  return substituirVariaveis(template, varsCompletas)
}

