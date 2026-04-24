'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createHash } from 'crypto'
import type { Enquete } from '@/types'

/**
 * Registra um voto em uma enquete validando o IP do usuário
 */
export async function votarEnquete(enqueteId: string, opcaoId: string) {
  const supabase = createAdminClient()
  const ip = headers().get('x-forwarded-for') || '127.0.0.1'
  const ipHash = createHash('sha256').update(ip + process.env.ENCRYPTION_KEY).digest('hex')

  try {
    const { error } = await supabase
      .from('enquete_votos')
      .insert([{ enquete_id: enqueteId, opcao_id: opcaoId, ip_hash: ipHash }])

    if (error) {
      if (error.code === '23505') { // Unique violation (IP já votou)
        return { success: false, error: 'Você já participou desta enquete!' }
      }
      throw error
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[polls] Erro ao votar:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Busca a enquete ativa para um local específico e retorna os resultados
 */
export async function getEnqueteAtiva(local: 'landing' | 'noticias') {
  const supabase = createAdminClient()
  try {
    const { data: enquete, error } = await supabase
      .from('enquetes')
      .select(`
        id, 
        titulo, 
        descricao, 
        local_exibicao,
        ativa,
        data_expiracao,
        limite_votos,
        encerrada_manualmente,
        criado_em,
        opcoes:enquete_opcoes(id, texto, ordem),
        votos:enquete_votos(opcao_id)
      `)
      .eq('local_exibicao', local)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!enquete) return null

    const totalVotos = enquete.votos.length
    
    // Determinar Status em tempo real
    let statusAtual: 'ativa' | 'encerrada' | 'expirada' | 'limite_atingido' = 'ativa'
    
    if (enquete.encerrada_manualmente) {
      statusAtual = 'encerrada'
    } else if (enquete.data_expiracao && new Date(enquete.data_expiracao) < new Date()) {
      statusAtual = 'expirada'
    } else if (enquete.limite_votos && totalVotos >= enquete.limite_votos) {
      statusAtual = 'limite_atingido'
    } else if (!enquete.ativa) {
      statusAtual = 'encerrada'
    }

    // Processar resultados para o Dashboard
    const resultados = enquete.opcoes.map((opt: any) => {
      const votosOpt = enquete.votos.filter((v: any) => v.opcao_id === opt.id).length
      return {
        ...opt,
        votos: votosOpt,
        percentual: totalVotos > 0 ? Math.round((votosOpt / totalVotos) * 100) : 0
      }
    })

    const ip = headers().get('x-forwarded-for') || '127.0.0.1'
    const ipHash = createHash('sha256').update(ip + (process.env.ENCRYPTION_KEY || 'default')).digest('hex')
    
    const { data: votoExistente } = await supabase
      .from('enquete_votos')
      .select('id')
      .eq('enquete_id', enquete.id)
      .eq('ip_hash', ipHash)
      .maybeSingle()

    return {
      ...enquete,
      status_atual: statusAtual,
      opcoes: resultados,
      totalVotos,
      jaVotou: !!votoExistente
    } as Enquete
  } catch (err) {
    console.error('[polls] Erro ao buscar enquete:', err)
    return null
  }
}

/**
 * Cria uma nova enquete com suas opções
 */
export async function criarEnquete(data: { 
  titulo: string, 
  local: string, 
  opcoes: string[],
  dataExpiracao?: string,
  limiteVotos?: number
}) {
  const supabase = createAdminClient()
  
  try {
    // 1. Inserir Enquete
    const { data: enquete, error: eErr } = await supabase
      .from('enquetes')
      .insert([{ 
        titulo: data.titulo, 
        local_exibicao: data.local, 
        ativa: true,
        data_expiracao: data.dataExpiracao || null,
        limite_votos: data.limiteVotos || null
      }])
      .select()
      .single()

    if (eErr) throw eErr

    // 2. Inserir Opções
    const opcoesData = data.opcoes.map((texto, index) => ({
      enquete_id: enquete.id,
      texto,
      ordem: index
    }))

    const { error: oErr } = await supabase
      .from('enquete_opcoes')
      .insert(opcoesData)

    if (oErr) throw oErr

    revalidatePath('/')
    revalidatePath('/admin/enquetes')
    revalidatePath('/admin/dashboard')
    
    return { success: true }
  } catch (err: unknown) {
    console.error('[polls] Erro ao criar enquete:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Remove uma enquete (cascata remove opções e votos)
 */
export async function deletarEnquete(id: string) {
  const supabase = createAdminClient()
  
  try {
    const { error } = await supabase
      .from('enquetes')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin/enquetes')
    revalidatePath('/admin/dashboard')
    
    return { success: true }
  } catch (err: unknown) {
    console.error('[polls] Erro ao deletar enquete:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Atualiza uma enquete existente e suas opções
 */
export async function atualizarEnquete(id: string, updates: { 
  titulo?: string, 
  local?: string, 
  ativa?: boolean, 
  encerrada_manualmente?: boolean,
  data_expiracao?: string | null,
  limite_votos?: number | null,
  opcoes?: { id?: string, texto: string, ordem: number }[] 
}) {
  const supabase = createAdminClient()
  
  try {
    // 1. Atualizar dados básicos da Enquete
    const { error: eErr } = await supabase
      .from('enquetes')
      .update({ 
        titulo: updates.titulo, 
        local_exibicao: updates.local, 
        ativa: updates.ativa,
        encerrada_manualmente: updates.encerrada_manualmente,
        data_expiracao: updates.data_expiracao,
        limite_votos: updates.limite_votos
      })
      .eq('id', id)

    if (eErr) throw eErr

    // 2. Atualizar Opções (se fornecidas)
    if (updates.opcoes) {
      const { error: dErr } = await supabase
        .from('enquete_opcoes')
        .delete()
        .eq('enquete_id', id)

      if (dErr) throw dErr

      const opcoesData = updates.opcoes.map((opt) => ({
        enquete_id: id,
        texto: opt.texto,
        ordem: opt.ordem
      }))

      const { error: iErr } = await supabase
        .from('enquete_opcoes')
        .insert(opcoesData)

      if (iErr) throw iErr
    }

    revalidatePath('/')
    revalidatePath('/admin/enquetes')
    
    return { success: true }
  } catch (err: unknown) {
    console.error('[polls] Erro ao atualizar enquete:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Gerencia o Toggle da Pesquisa de Satisfação Global
 */
export async function setPesquisaSatisfacaoAtiva(ativa: boolean) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('plataforma_config')
      .update({ valor: ativa ? 'true' : 'false' })
      .eq('chave', 'funcionalidade.pesquisa_satisfacao_ativa')

    if (error) throw error
    
    revalidatePath('/')
    revalidatePath('/admin/enquetes')
    
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message }
  }
}
