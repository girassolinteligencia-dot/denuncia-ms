'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import type { StatusDenuncia } from '@/types'
import { decryptData } from '@/lib/encrypt'

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
        atualizado_em: new Date().toISOString()
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
 * Busca detalhes completos da denúncia incluindo arquivos, categoria e identidade descriptografada.
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
    if (!data) return { success: false, error: 'Denúncia não encontrada.' }

    // Busca dados de identidade criptografados (tabela separada por LGPD)
    const { data: identidade } = await supabase
      .from('identidades')
      .select('nome_enc, email_enc, telefone_enc')
      .eq('denuncia_id', id)
      .maybeSingle()

    // Descriptografa server-side antes de entregar ao painel
    let denunciante_nome: string | null = null
    let denunciante_email: string | null = null
    let denunciante_telefone: string | null = null

    if (identidade) {
      try {
        if (identidade.nome_enc)     denunciante_nome     = await decryptData(identidade.nome_enc)
        if (identidade.email_enc)    denunciante_email    = await decryptData(identidade.email_enc)
        if (identidade.telefone_enc) denunciante_telefone = await decryptData(identidade.telefone_enc)
      } catch (decryptErr) {
        console.error('[admin] Erro ao descriptografar identidade:', decryptErr)
      }
    }

    return {
      success: true,
      data: {
        ...data,
        denunciante_nome,
        denunciante_email,
        denunciante_telefone,
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Busca estatísticas consolidadas para o Dashboard
 */
export async function getDashboardStats() {
  const supabase = createAdminClient()

  try {
    const { data: counts, error } = await supabase
      .from('denuncias')
      .select('status')

    if (error) throw error

    const stats = {
      total: counts.length,
      recebida: counts.filter(d => d.status === 'recebida').length,
      em_analise: counts.filter(d => d.status === 'em_analise').length,
      resolvida: counts.filter(d => d.status === 'resolvida').length,
      arquivada: counts.filter(d => d.status === 'arquivada').length,
    }

    return { success: true, stats }
  } catch (err: any) {
    console.error('Erro ao buscar stats:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Busca as últimas atividades do log de auditoria
 */
export async function getRecentActivities() {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('log_auditoria')
      .select('*, usuario:profiles(nome)')
      .order('criado_em', { ascending: false })
      .limit(6)

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('Erro ao buscar atividades:', err)
    return { success: false, error: err.message }
  }
}
