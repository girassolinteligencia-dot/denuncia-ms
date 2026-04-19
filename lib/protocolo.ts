import { createAdminClient } from '@/lib/supabase-admin'
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
  const { data, error } = await supabase.rpc('incrementar_protocolo')

  if (error || !data) {
    throw new Error(`Erro ao gerar protocolo: ${error?.message ?? 'resposta vazia'}`)
  }

  const config = data as ConfigProtocolo
  const ano = config.formato_ano === 'YYYY'
    ? new Date().getFullYear().toString()
    : new Date().getFullYear().toString().slice(-2)

  const seq = config.sequencia_atual
    .toString()
    .padStart(config.digitos_seq, '0')

  // Gera sufixo aleatório para segurança (Salt)
  const salt = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  // Gera Chave de Acesso única para o cidadão
  const chaveAcesso = Math.random().toString(36).substring(2, 8).toUpperCase()

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
