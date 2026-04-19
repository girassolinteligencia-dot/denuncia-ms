'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

/**
 * Salva as configurações da plataforma no banco de dados.
 */
export async function savePlatformConfigs(data: Record<string, any>) {
  const supabase = createAdminClient()

  // Prepara as inserções/updates
  const entries = Object.entries(data).map(([chave, valor]) => ({
    chave,
    valor, // O Supabase/Postgres converterá automaticamente para jsonb
    atualizado_em: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('plataforma_config')
    .upsert(entries, { onConflict: 'chave' })

  if (error) {
    console.error('Erro ao salvar configs:', error)
    return { success: false, error: error.message }
  }

  // Revalida os caminhos que dependem dessas configs
  revalidatePath('/admin/configuracoes')
  revalidatePath('/') // Portal público

  return { success: true }
}

/**
 * Salva a ordenação e visibilidade dos campos do formulário.
 */
export async function saveCamposFormulario(campos: any[]) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('config_campos_formulario')
    .upsert(campos)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/configuracoes/campos')
  return { success: true }
}

/**
 * Salva as políticas de anexo/arquivos.
 */
export async function savePoliticasArquivo(tipos: any[]) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('config_tipos_arquivo')
    .upsert(tipos)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/configuracoes/arquivos')
  return { success: true }
}

/**
 * Salva o padrão de protocolo.
 */
export async function saveProtocoloConfig(config: any) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('config_protocolo')
    .upsert(config)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/configuracoes/protocolo')
  return { success: true }
}
