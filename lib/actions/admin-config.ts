'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

/**
 * Busca uma configuração do sistema pela chave
 */
export async function getSystemConfig(chave: string) {
  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from('sistema_config')
      .select('valor')
      .eq('chave', chave)
      .single()

    if (error) throw error
    return { 
      success: true, 
      valor: data.valor === 'true',
      valor_raw: data.valor 
    }
  } catch (error) {
    console.error(`Erro ao buscar config ${chave}:`, error)
    return { success: false, valor: false, valor_raw: '' }
  }
}

/**
 * Atualiza uma configuração do sistema
 */
export async function updateSystemConfig(chave: string, valor: boolean | string) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('sistema_config')
      .update({ 
        valor: String(valor),
        atualizado_em: new Date().toISOString()
      })
      .eq('chave', chave)

    if (error) throw error
    
    // Revalidar caminhos públicos para refletir mudança imediata
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error(`Erro ao atualizar config ${chave}:`, error)
    return { success: false, error: 'Falha ao atualizar configuração' }
  }
}

/**
 * Atualiza um campo do formulário de denuncia
 */
export async function updateConfigCampos(id: string, data: Record<string, any>) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('config_campos_formulario')
      .update(data)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/configuracoes/campos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar campo:', error)
    return { success: false }
  }
}

/**
 * Atualiza um template de documento (PDF/E-mail)
 */
export async function updateTemplate(id: string, data: Record<string, any>) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('config_templates')
      .update(data)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/configuracoes/templates')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar template:', error)
    return { success: false }
  }
}

/**
 * Atualiza políticas de tipos de arquivo
 */
export async function updateConfigTipoArquivo(id: string, data: Record<string, any>) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('config_tipos_arquivo')
      .update(data)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/configuracoes/arquivos')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar tipo de arquivo:', error)
    return { success: false }
  }
}
