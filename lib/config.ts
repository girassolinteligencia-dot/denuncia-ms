import { createAdminClient } from '@/lib/supabase-admin'

// Cache em memória com TTL de 30 segundos
interface CacheEntry {
  valor: unknown
  expira_em: number
}
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30_000

/**
 * Lê uma configuração da tabela `plataforma_config` com cache em memória.
 * @param chave - A chave da configuração (ex: 'tipos_arquivo', 'protocolo')
 * @param fallback - Valor padrão caso a chave não exista no banco
 */
export async function getConfig<T = unknown>(
  chave: string,
  fallback?: T
): Promise<T> {
  const agora = Date.now()
  const cached = cache.get(chave)

  if (cached && cached.expira_em > agora) {
    return cached.valor as T
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('plataforma_config')
    .select('valor')
    .eq('chave', chave)
    .single()

  if (error || !data) {
    if (fallback !== undefined) return fallback
    throw new Error(`Configuração '${chave}' não encontrada no banco`)
  }

  const valor = data.valor as T
  cache.set(chave, { valor, expira_em: agora + CACHE_TTL_MS })
  return valor
}

/**
 * Salva ou atualiza uma configuração na tabela `plataforma_config`.
 * Invalida o cache da chave alterada.
 */
export async function setConfig(
  chave: string,
  valor: unknown,
  usuarioId: string
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('plataforma_config')
    .upsert(
      { chave, valor, atualizado_em: new Date().toISOString(), atualizado_por: usuarioId },
      { onConflict: 'chave' }
    )

  if (error) {
    throw new Error(`Erro ao salvar configuração '${chave}': ${error.message}`)
  }

  // Invalida o cache
  cache.delete(chave)
}

/**
 * Invalida todo o cache de configurações.
 * Útil após atualizações em lote no painel admin.
 */
export function invalidateConfigCache(): void {
  cache.clear()
}

/**
 * Lê todas as configurações de um namespace (prefixo de chave).
 * Exemplo: getConfigsByPrefix('notificacoes') retorna todas as chaves que começam com 'notificacoes.'
 */
export async function getConfigsByPrefix(prefixo: string): Promise<Record<string, unknown>> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('plataforma_config')
    .select('chave, valor')
    .like('chave', `${prefixo}%`)

  if (error) {
    throw new Error(`Erro ao buscar configurações com prefixo '${prefixo}': ${error.message}`)
  }

  return Object.fromEntries((data ?? []).map(({ chave, valor }) => [chave, valor]))
}
