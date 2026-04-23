'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

/**
 * Gera sugestões de notícias baseadas em tendências reais de denúncias.
 * Anonimiza os dados e usa IA para criar relatos genéricos úteis à população.
 */
export async function gerarSugestoesDeNoticias() {
  const supabase = createAdminClient()

  try {
    // 1. Buscar denúncias recentes (últimos 7 dias)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const { data: denuncias, error: dError } = await supabase
      .from('denuncias')
      .select('titulo, categoria_id, criado_em, categorias(label)')
      .gte('criado_em', seteDiasAtras.toISOString())

    if (dError) throw dError
    if (!denuncias || denuncias.length === 0) {
      return { success: false, error: 'Nenhuma denúncia recente para análise.' }
    }

    // 2. Agrupar tendências (Simulação de Análise de IA)
    // Em um cenário real, enviaríamos o texto para o Gemini/GPT.
    // Aqui, vamos estruturar o prompt e simular a resposta estruturada.
    
    const categoriasContagem = denuncias.reduce((acc: any, d: any) => {
      const label = d.categorias?.label || 'Geral'
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})

    const categoriaTop = Object.entries(categoriasContagem).sort((a: any, b: any) => b[1] - a[1])[0]

    // 3. Criar a Notícia Sugerida (Pendende de Moderação)
    const tituloSugerido = `Aumento nas fiscalizações de ${categoriaTop[0]} em Mato Grosso do Sul`
    const conteudoSugerido = `A plataforma Denúncia MS registrou um aumento de ${categoriaTop[1]} novos protocolos relacionados a ${categoriaTop[0]} na última semana. Esta tendência reflete o engajamento direto da população na fiscalização e melhoria dos serviços públicos. Lembramos que todos os dados são tratados com sigilo e encaminhados aos órgãos competentes para as devidas providências.`

    const novaNoticia = {
      titulo: tituloSugerido,
      slug: `ai-suggested-${Date.now()}`,
      conteudo: conteudoSugerido,
      categoria: categoriaTop[0],
      publicado: false, // EXIGE MODERAÇÃO
      gerado_por_ia: true // Flag para o admin saber a origem
    }

    const { error: nError } = await supabase
      .from('noticias')
      .insert([novaNoticia])

    if (nError) throw nError

    revalidatePath('/admin/noticias')
    return { success: true, message: 'Nova sugestão de notícia gerada e enviada para moderação.' }

  } catch (err: any) {
    console.error('Erro na geração de IA:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Aprova uma notícia gerada pela IA
 */
export async function aprovarNoticia(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('noticias')
    .update({ 
      publicado: true, 
      publicado_em: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/noticias')
  revalidatePath('/')
  return { success: true }
}

/**
 * Busca notícias aprovadas para o portal público
 */
export async function buscarNoticiasPublicas() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .order('publicado_em', { ascending: false })
    .limit(10)

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as any[] }
}
