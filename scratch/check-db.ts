import { createAdminClient } from './lib/supabase-admin'

async function checkCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('categorias').select('*')
  
  if (error) {
    console.error('❌ Erro ao buscar categorias:', error.message)
    console.error('Dica: Verifique se a tabela "categorias" existe e se o Service Role Key está correto.')
  } else {
    console.log('✅ Categorias encontradas:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('Primeira categoria:', data[0].label, '| Ativo:', data[0].ativo)
    }
  }
}

checkCategories()
