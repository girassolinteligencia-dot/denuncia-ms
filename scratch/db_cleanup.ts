import { createAdminClient } from '../lib/supabase-admin'

async function cleanupAnonymity() {
  const supabase = createAdminClient()
  
  console.log('--- INICIANDO LIMPEZA DE ANONIMATO ---')
  
  // 1. Atualizar todas as denúncias para anonima = false
  const { data, error, count } = await supabase
    .from('denuncias')
    .update({ anonima: false })
    .eq('anonima', true)
    .select('id')

  if (error) {
    console.error('Erro ao atualizar denúncias:', error.message)
  } else {
    console.log(`Sucesso: ${data?.length || 0} denúncias atualizadas para identificadas.`)
  }

  console.log('--- LIMPEZA CONCLUÍDA ---')
}

cleanupAnonymity()
