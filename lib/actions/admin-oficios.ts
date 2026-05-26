'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export interface DenunciaParaOficio {
  id: string
  protocolo: string
  titulo: string
  descricao_original: string
  categoria: string
  local: string | null
  bairro: string | null
  municipio: string | null
  data_ocorrido: string | null
  criado_em: string
  status: string
  anonima: boolean
  numero_oficio: string
}

export async function getDenunciasParaOficio(ids: string[]): Promise<{
  success: boolean
  data?: DenunciaParaOficio[]
  error?: string
}> {
  const supabase = createAdminClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const anoAtual = new Date().getFullYear()

    const { data: denuncias, error } = await supabase
      .from('denuncias')
      .select('id, protocolo, titulo, descricao_original, local, bairro, municipio, data_ocorrido, criado_em, status, anonima, categorias(label)')
      .in('id', ids)
      .order('criado_em', { ascending: true })

    if (error) throw error
    if (!denuncias || denuncias.length === 0) throw new Error('Nenhuma denúncia encontrada.')

    // Para cada denúncia, garante que exista um número de ofício (idempotente)
    const resultado: DenunciaParaOficio[] = []

    for (const d of denuncias) {
      // Verifica se já existe número para este ano
      const { data: existente } = await supabase
        .from('oficio_numeracao')
        .select('sequencial')
        .eq('denuncia_id', d.id)
        .eq('ano', anoAtual)
        .maybeSingle()

      let sequencial: number

      if (existente) {
        sequencial = existente.sequencial
      } else {
        // Calcula próximo sequencial com lock otimista via RPC
        const { data: proximo, error: rpcError } = await supabase
          .rpc('proximo_numero_oficio', { p_ano: anoAtual })

        if (rpcError) throw rpcError
        sequencial = proximo as number

        await supabase.from('oficio_numeracao').insert({
          ano: anoAtual,
          sequencial,
          denuncia_id: d.id,
          gerado_por: user?.id ?? null,
        })
      }

      const cat = Array.isArray(d.categorias) ? d.categorias[0] : d.categorias
      const numero_oficio = `DMS-OFÍCIO-${anoAtual}-${String(sequencial).padStart(5, '0')}`

      resultado.push({
        id: d.id,
        protocolo: d.protocolo,
        titulo: d.titulo,
        descricao_original: d.descricao_original,
        categoria: (cat as any)?.label ?? 'Não classificada',
        local: d.local,
        bairro: d.bairro,
        municipio: d.municipio,
        data_ocorrido: d.data_ocorrido,
        criado_em: d.criado_em,
        status: d.status,
        anonima: d.anonima,
        numero_oficio,
      })
    }

    return { success: true, data: resultado }
  } catch (err: any) {
    console.error('[admin-oficios] Erro:', err)
    return { success: false, error: err.message }
  }
}
