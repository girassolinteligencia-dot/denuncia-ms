'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export async function buscarCEP(cep: string) {
  const supabase = createAdminClient()
  
  // Remove formatação
  const cleanCep = cep.replace(/\D/g, '')

  if (cleanCep.length < 8) return { success: false, error: 'CEP inválido' }

  try {
    const { data, error } = await supabase
      .from('localidades_cep')
      .select('*')
      .eq('cep', cleanCep)
      .single()

    if (error) throw error
    if (!data) return { success: false, error: 'CEP não encontrado' }

    return { success: true, data }
  } catch (err) {
    console.error('Erro ao buscar CEP:', err)
    return { success: false, error: 'Erro ao consultar base de dados local' }
  }
}
