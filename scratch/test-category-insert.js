const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vfnwtxglknfbwlohblnp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbnd0eGdsa25mYndsb2hibG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDExMiwiZXhwIjoyMDkyMTE2MTEyfQ.TTVdebY9O547J6xbfUq3gtKQtJLTlK3NCF_oqGTx2Ks'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCreateCategory() {
  const timestamp = Date.now()
  const category = {
    slug: `test-cat-${timestamp}`,
    label: `Test Category ${timestamp}`,
    bloco: 'Geral',
    emoji: '📂',
    ativo: true,
    ordem: 99,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  }

  console.log('Tentando inserir categoria:', category)

  const { data, error } = await supabase
    .from('categorias')
    .insert(category)
    .select()

  if (error) {
    console.error('Erro na inserção:', error)
  } else {
    console.log('Sucesso! Categoria criada:', data)
    
    // Deletar para não sujar o banco
    const { error: delErr } = await supabase.from('categorias').delete().eq('id', data[0].id)
    if (delErr) console.error('Erro ao deletar teste:', delErr)
    else console.log('Teste deletado com sucesso.')
  }
}

testCreateCategory()
