import { createAdminClient } from '@/lib/supabase-admin'
import { randomBytes } from 'crypto'
import type { ConfigProtocolo } from '@/types'

/**
 * Gera o próximo número de protocolo usando transação atômica.
 * Formato: {PREFIXO}{SEP}{ANO}{SEP}{SEQUENCIAL_ZERO_PADDED}
 * Exemplo: DNS-2026-000001
 *
 * Usa UPDATE ... RETURNING para garantir atomicidade e evitar
 * duplicatas em cenários de alta concorrência.
 */
export async function gerarProtocolo(): Promise<{ protocolo: string, chaveAcesso: string }> {
  const supabase = createAdminClient()

  // Incrementa atomicamente e retorna o novo valor
  console.log('[protocolo] Chamando RPC incrementar_protocolo...')
  const { data, error } = await supabase.rpc('incrementar_protocolo')

  if (error) {
    console.error('[protocolo] Erro no RPC:', error)
    throw new Error(`Erro ao gerar protocolo: ${error.message}`)
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.error('[protocolo] RPC retornou dados vazios. Verifique a tabela config_protocolo.')
    throw new Error('Erro ao gerar protocolo: configuração de sequenciamento não encontrada no banco.')
  }

  const config = (Array.isArray(data) ? data[0] : data) as ConfigProtocolo
  console.log('[protocolo] Config obtida:', { prefixo: config.prefixo, seq: config.sequencia_atual })

  const ano = config.formato_ano === 'YYYY'
    ? new Date().getFullYear().toString()
    : new Date().getFullYear().toString().slice(-2)

  const seq = config.sequencia_atual
    .toString()
    .padStart(config.digitos_seq, '0')

  // Gera sufixo aleatório criptograficamente seguro (Salt)
  const salt = randomBytes(3).toString('hex').toUpperCase().slice(0, 4)
  
  // Gera Chave de Acesso única e segura para o cidadão
  const chaveAcesso = randomBytes(4).toString('hex').toUpperCase().slice(0, 6)

  const protocoloFinal = [config.prefixo, ano, seq, salt].join(config.separador)
  
  return { 
    protocolo: protocoloFinal, 
    chaveAcesso 
  }
}

/**
 * Formata um preview do protocolo com base na config atual.
 * Usado no painel admin para exibir preview em tempo real.
 */
export function formatarPreviewProtocolo(config: ConfigProtocolo): string {
  const ano = config.formato_ano === 'YYYY'
    ? new Date().getFullYear().toString()
    : new Date().getFullYear().toString().slice(-2)

  const seq = '1'.padStart(config.digitos_seq, '0')
  return [config.prefixo, ano, seq].join(config.separador)
}


