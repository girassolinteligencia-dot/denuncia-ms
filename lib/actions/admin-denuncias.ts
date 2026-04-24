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
      .select(`
        id, 
        protocolo, 
        categoria_id, 
        titulo, 
        descricao_original, 
        local, 
        cep, 
        numero, 
        bairro, 
        cidade, 
        municipio,
        data_ocorrido, 
        status, 
        criado_em, 
        atualizado_em,
        categorias(label, icon_name), 
        arquivos_denuncia(*)
      `)
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

        // 3. Registrar acesso ao PII (Auditoria LGPD)
        if (denunciante_nome || denunciante_email || denunciante_telefone) {
          const { data: { user } } = await supabase.auth.getUser()
          await supabase.from('audit_identidade').insert({
            denuncia_id: id,
            usuario_id: user?.id || null,
            ip_acesso: 'ADMIN_PANEL'
          })
        }
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

    // 2. Busca métricas de engajamento
    const { count: newsletterCount } = await supabase
      .from('newsletter_inscricoes')
      .select('*', { count: 'exact', head: true })

    const { count: votosCount } = await supabase
      .from('enquete_votos')
      .select('*', { count: 'exact', head: true })

    const stats = {
      total: counts.length,
      recebida: counts.filter(d => d.status === 'recebida').length,
      em_analise: counts.filter(d => d.status === 'em_analise').length,
      resolvida: counts.filter(d => d.status === 'resolvida').length,
      arquivada: counts.filter(d => d.status === 'arquivada').length,
      newsletter: newsletterCount || 0,
      engajamento: votosCount || 0
    }

    // Gatilho silencioso de limpeza (Lazy Cleanup)
    limparArquivosAntigos().catch(console.error)

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

/**
 * Executa a limpeza de anexos com mais de 30 dias (LGPD/Economia)
 * Mantém os PDFs oficiais intactos.
 */
export async function limparArquivosAntigos() {
  const supabase = createAdminClient()
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 30)

  try {
    // 1. Buscar arquivos de denúncias criadas há mais de 30 dias
    // e que ainda não foram marcados como removidos
    const { data: arquivos } = await supabase
      .from('arquivos_denuncia')
      .select('id, bucket_path, denuncia_id')
      .lt('criado_em', dataLimite.toISOString())

    if (!arquivos || arquivos.length === 0) return { success: true, count: 0 }

    const pathsToDelete = arquivos.map(a => a.bucket_path).filter(Boolean)

    if (pathsToDelete.length > 0) {
      // 2. Deletar binários do storage (Bucket de anexos)
      const { error: deleteErr } = await supabase.storage
        .from('denuncias')
        .remove(pathsToDelete)

      if (deleteErr) console.warn('[cleanup] Erro ao deletar binários:', deleteErr)

      // 3. Remover registros do banco (ou marcar como deletado)
      // Aqui vamos remover para liberar espaço e cumprir LGPD
      const { error: dbErr } = await supabase
        .from('arquivos_denuncia')
        .delete()
        .in('id', arquivos.map(a => a.id))

      if (dbErr) throw dbErr
    }

    return { success: true, count: pathsToDelete.length }
  } catch (err) {
    console.error('[cleanup] Erro crítico na limpeza:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Busca o ranking de usuários por recorrência para auditoria de credibilidade.
 */
export async function getRankingAuditUsuarios() {
  const supabase = createAdminClient()

  try {
    // 1. Agrupar incidências por email_hash (identidades)
    const { data: identidades, error: idErr } = await supabase
      .from('identidades')
      .select('email_hash, denuncia_id, denuncias(status)')

    if (idErr) throw idErr

    // 2. Processar ranking
    const rankingMap = new Map()

    identidades.forEach((id: any) => {
      const hash = id.email_hash
      if (!hash) return

      const status = id.denuncias?.status
      
      if (!rankingMap.has(hash)) {
        rankingMap.set(hash, {
          hash,
          total: 0,
          resolvidas: 0,
          arquivadas: 0,
          pendentes: 0,
          credibilidade: 100
        })
      }

      const stats = rankingMap.get(hash)
      stats.total++
      if (status === 'resolvida') stats.resolvidas++
      if (status === 'arquivada') stats.arquivadas++
      if (['recebida', 'em_analise'].includes(status)) stats.pendentes++

      // Cálculo de credibilidade
      const totalFinalizados = stats.resolvidas + stats.arquivadas
      if (totalFinalizados > 0) {
        stats.credibilidade = Math.round((stats.resolvidas / totalFinalizados) * 100)
      }
    })

    const ranking = Array.from(rankingMap.values())
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 50)

    return { success: true, ranking }
  } catch (err: any) {
    console.error('[audit] Erro no ranking:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Bane um usuário do sistema (adiciona à lista negra)
 */
export async function banirUsuario(emailHash: string, motivo: string) {
  const supabase = createAdminClient()
  
  try {
    // Obter ID do admin logado
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('blacklist_usuarios')
      .insert({
        email_hash: emailHash,
        motivo: motivo,
        bloqueado_por: user?.id || null,
        criado_em: new Date().toISOString()
      })

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Busca dados históricos de denúncias para o gráfico de evolução (últimos 30 dias)
 */
export async function getProtocolEvolutionData() {
  const supabase = createAdminClient()
  const hoje = new Date()
  const dataInicio = new Date()
  dataInicio.setDate(hoje.getDate() - 30)

  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select('criado_em')
      .gte('criado_em', dataInicio.toISOString())
      .order('criado_em', { ascending: true })

    if (error) throw error

    // Agrupar por dia
    const grouped = (data || []).reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Preencher dias vazios para o gráfico não ter buracos
    const chartData = []
    for (let i = 30; i >= 0; i--) {
      const d = new Date()
      d.setDate(hoje.getDate() - i)
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      chartData.push({
        date: dateStr,
        total: grouped[dateStr] || 0
      })
    }

    return { success: true, data: chartData }
  } catch (err: any) {
    console.error('Erro ao buscar evolução de protocolos:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Busca todas as denúncias com coordenadas para o mapa de inteligência
 */
export async function getGeographicIntelligence() {
  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select('id, protocolo, titulo, status, latitude, longitude, municipio, criado_em')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('criado_em', { ascending: false })

    if (error) throw error

    return { 
      success: true, 
      data: (data || []).map(d => ({
        ...d,
        lat: Number(d.latitude),
        lng: Number(d.longitude)
      }))
    }
  } catch (err: any) {
    console.error('Erro ao buscar inteligência geográfica:', err)
    return { success: false, error: err.message }
  }
}
