'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { ConfigTemplate, ConfigCampoFormulario } from '@/types'

/**
 * Atualiza os templates de documentos (PDF/E-mail)
 */
export async function updateTemplate(id: string, updates: Partial<ConfigTemplate>) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('config_templates')
      .update({
        conteudo: updates.conteudo,
        incluir_qrcode: updates.incluir_qrcode,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/configuracoes/templates')
    return { success: true }
  } catch (err) {
    const error = err as Error
    console.error('Erro ao atualizar template:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Atualiza as configurações dos campos do formulário
 */
export async function updateConfigCampos(id: string, updates: Partial<ConfigCampoFormulario>) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('config_campos_formulario')
      .update({
        label: updates.label,
        placeholder: updates.placeholder,
        obrigatorio: updates.obrigatorio,
        visivel: updates.visivel,
        ordem: updates.ordem,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/configuracoes/campos')
    revalidatePath('/denunciar')
    return { success: true }
  } catch (err) {
    const error = err as Error
    console.error('Erro ao atualizar campo:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Atualiza as configurações de tipos de arquivos permitidos
 */
export async function updateConfigTipoArquivo(id: string, updates: any) {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('config_tipos_arquivo')
      .update({
        ativo: updates.ativo,
        qtd_maxima: updates.qtd_maxima,
        tamanho_max_mb: updates.tamanho_max_mb,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/configuracoes/arquivos')
    revalidatePath('/denunciar')
    return { success: true }
  } catch (err) {
    const error = err as Error
    console.error('Erro ao atualizar tipo de arquivo:', error)
    return { success: false, error: error.message }
  }
}
