'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createHash } from 'crypto'
import type { Enquete } from '@/types'

type EnqueteRow = {
  id: string
  titulo?: string | null
  pergunta?: string | null
  descricao?: string | null
  local_exibicao?: 'landing' | 'noticias' | null
  ativa: boolean
  data_expiracao?: string | null
  limite_votos?: number | null
  encerrada_manualmente?: boolean | null
  criado_em: string
  opcoes?: unknown
}

function normalizeEnquete(enquete: EnqueteRow, local: 'landing' | 'noticias') {
  return {
    ...enquete,
    titulo: enquete.titulo || enquete.pergunta || 'Enquete',
    descricao: enquete.descricao || '',
    local_exibicao: enquete.local_exibicao || local,
    criado_em: enquete.criado_em || new Date().toISOString(),
    data_expiracao: enquete.data_expiracao || null,
    limite_votos: enquete.limite_votos || null,
    encerrada_manualmente: enquete.encerrada_manualmente || false,
  }
}

function normalizeJsonOpcoes(enquete: EnqueteRow) {
  const opcoes = Array.isArray(enquete.opcoes) ? enquete.opcoes : []

  return opcoes.map((opcao: any, index) => ({
    id: opcao?.id || `${enquete.id}-${index}`,
    texto: typeof opcao === 'string' ? opcao : opcao?.texto || opcao?.label || `Opção ${index + 1}`,
    ordem: typeof opcao?.ordem === 'number' ? opcao.ordem : index,
  }))
}

async function hydrateEnquete(enquete: EnqueteRow | null, local: 'landing' | 'noticias') {
  if (!enquete) return null

  const supabase = createAdminClient()
  const normalized = normalizeEnquete(enquete, local)

  const [{ data: opcoes, error: opcoesError }, { data: votos, error: votosError }] = await Promise.all([
    supabase
      .from('enquete_opcoes')
      .select('id, texto, ordem')
      .eq('enquete_id', enquete.id)
      .order('ordem', { ascending: true }),
    supabase
      .from('enquete_votos')
      .select('opcao_id')
      .eq('enquete_id', enquete.id),
  ])

  if (opcoesError || votosError) {
    return {
      ...normalized,
      opcoes: normalizeJsonOpcoes(enquete),
      votos: [],
    }
  }

  return {
    ...normalized,
    opcoes: opcoes || [],
    votos: votos || [],
  }
}

/**
 * Auxiliar para extrair IP real e gerar Hash consistente
 */
function getClientIpHash() {
  const forwarded = headers().get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
  const salt = process.env.ENCRYPTION_KEY || 'denunciams-salt-2026'
  return createHash('sha256').update(ip + salt).digest('hex')
}

/**
 * Registra um voto em uma enquete validando o IP do usuário
 */
export async function votarEnquete(enqueteId: string, opcaoId: string) {
  const supabase = createAdminClient()
  const ipHash = getClientIpHash()

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
    // Busca prioritariamente uma enquete ativa. A tabela em alguns ambientes
    // usa schema legado com pergunta/opcoes em JSON, então normalizamos abaixo.
    const { data: enquetesAtivas, error } = await supabase
      .from('enquetes')
      .select('*')
      .eq('ativa', true) // Filtro essencial para refletir o Admin
      .limit(10)

    if (error) throw error
    
    // Se não houver ativa, busca a última encerrada para mostrar resultados históricos
    const enquete = (enquetesAtivas || []).find((item: any) => !item.local_exibicao || item.local_exibicao === local) || enquetesAtivas?.[0] || null
    let finalEnquete = await hydrateEnquete(enquete as EnqueteRow | null, local)
    if (!finalEnquete) {
       const { data: lastOnes, error: lastOneError } = await supabase
        .from('enquetes')
        .select('*')
        .limit(10)

      if (lastOneError) throw lastOneError
      const lastOne = (lastOnes || []).find((item: any) => !item.local_exibicao || item.local_exibicao === local) || lastOnes?.[0] || null
      finalEnquete = await hydrateEnquete(lastOne as EnqueteRow | null, local)
    }

    if (!finalEnquete) return null

    const totalVotos = finalEnquete.votos?.length || 0
    
    // Determinar Status em tempo real
    let statusAtual: 'ativa' | 'encerrada' | 'expirada' | 'limite_atingido' = 'ativa'
    
    if (finalEnquete.encerrada_manualmente || !finalEnquete.ativa) {
      statusAtual = 'encerrada'
    } else if (finalEnquete.data_expiracao && new Date(finalEnquete.data_expiracao) < new Date()) {
      statusAtual = 'expirada'
    } else if (finalEnquete.limite_votos && totalVotos >= finalEnquete.limite_votos) {
      statusAtual = 'limite_atingido'
    }

    // Processar resultados
    const resultados = finalEnquete.opcoes.map((opt: any) => {
      const votosOpt = finalEnquete.votos.filter((v: any) => v.opcao_id === opt.id).length
      return {
        ...opt,
        votos: votosOpt,
        percentual: totalVotos > 0 ? Math.round((votosOpt / totalVotos) * 100) : 0
      }
    })

    const ipHash = getClientIpHash()
    const { data: votoExistente } = await supabase
      .from('enquete_votos')
      .select('id')
      .eq('enquete_id', finalEnquete.id)
      .eq('ip_hash', ipHash)
      .maybeSingle()

    return {
      ...finalEnquete,
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
    let usesLegacySchema = false
    let enqueteRes = await supabase
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

    if (enqueteRes.error) {
      usesLegacySchema = true
      enqueteRes = await supabase
        .from('enquetes')
        .insert([{
          pergunta: data.titulo,
          ativa: true,
          opcoes: data.opcoes,
        }])
        .select()
        .single()
    }

    if (enqueteRes.error) throw enqueteRes.error
    const enquete = enqueteRes.data

    // 2. Inserir Opções
    if (!usesLegacySchema) {
      const opcoesData = data.opcoes.map((texto, index) => ({
        enquete_id: enquete.id,
        texto,
        ordem: index
      }))

      const { error: oErr } = await supabase
        .from('enquete_opcoes')
        .insert(opcoesData)

      if (oErr) throw oErr
    }

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
    let usesLegacySchema = false
    let updateRes = await supabase
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

    if (updateRes.error) {
      usesLegacySchema = true
      const legacyUpdates: Record<string, unknown> = {}

      if (updates.titulo !== undefined) legacyUpdates.pergunta = updates.titulo
      if (updates.ativa !== undefined) legacyUpdates.ativa = updates.ativa
      if (updates.encerrada_manualmente === true) legacyUpdates.ativa = false
      if (updates.opcoes) legacyUpdates.opcoes = updates.opcoes.map((opcao) => opcao.texto)

      updateRes = await supabase
        .from('enquetes')
        .update(legacyUpdates)
        .eq('id', id)
    }

    if (updateRes.error) throw updateRes.error

    // 2. Atualizar Opções (se fornecidas)
    if (updates.opcoes && !usesLegacySchema) {
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
    console.log(`Alterando Pesquisa de Satisfação para: ${ativa}`)
    const { error } = await supabase
      .from('plataforma_config')
      .upsert({ 
        chave: 'funcionalidade.pesquisa_satisfacao_ativa', 
        valor: ativa, // Salva como boolean no JSONB
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'chave' })

    if (error) throw error
    
    revalidatePath('/')
    revalidatePath('/admin/enquetes')
    
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message }
  }
}
export async function setBoletimAtivo(ativa: boolean) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('plataforma_config')
      .upsert({ 
        chave: 'funcionalidade.boletim_ativo', 
        valor: ativa,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'chave' })

    if (error) throw error
    
    revalidatePath('/noticias')
    revalidatePath('/admin/conteudo')
    
    return { success: true }
  } catch (err: any) {
    console.error('[enquetes] Erro ao alterar status do boletim:', err)
    return { success: false, error: err.message }
  }
}

export async function setNewsletterAtiva(ativa: boolean) {
  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from('plataforma_config')
      .upsert({ 
        chave: 'funcionalidade.newsletter_ativa', 
        valor: ativa,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'chave' })

    if (error) throw error
    
    revalidatePath('/')
    revalidatePath('/transparencia')
    revalidatePath('/admin/conteudo')
    
    return { success: true }
  } catch (err: any) {
    console.error('[enquetes] Erro ao alterar status da newsletter:', err)
    return { success: false, error: err.message }
  }
}
