'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { StatusDenuncia } from '@/types'

/**
 * Atualiza o status de uma denúncia e registra no log de auditoria
 */
export async function updateDenunciaStatus(id: string, novoStatus: StatusDenuncia, observacaoAdmin?: string) {
  const supabase = createAdminClient()

  try {
    // 1. Obter status atual para o log
    const { data: atual } = await supabase
      .from('denuncias')
      .select('status, protocolo')
      .eq('id', id)
      .single()

    if (!atual) throw new Error('Denúncia não encontrada')

    // 2. Atualizar o status
    const { error } = await supabase
      .from('denuncias')
      .update({
        status: novoStatus,
        atualizado_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    // 3. Registrar Transição no Log (Histórico)
    // Nota: Em uma implementação completa, teríamos uma tabela para histórico de status.
    // Aqui registraremos no log_auditoria
    await supabase.from('log_auditoria').insert({
      acao: 'UPDATE_STATUS',
      tabela: 'denuncias',
      registro_id: id,
      valor_anterior: { status: atual.status },
      valor_novo: { status: novoStatus, obs: observacaoAdmin },
      ip: 'ADMIN_PANEL'
    })

    revalidatePath('/admin/denuncias')
    revalidatePath(`/admin/denuncias/${id}`)
    revalidatePath(`/acompanhar/${atual.protocolo}`)
    
    return { success: true }
  } catch (err: any) {
    console.error('Erro ao atualizar status:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Busca detalhes completos da denúncia incluindo arquivos e categoria
 */
export async function getDenunciaDetalhes(id: string) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select('*, categorias(*), arquivos_denuncia(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
