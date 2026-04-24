const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const env = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const { data: columns, error: colError } = await supabase
    .rpc('get_column_names', { table_name: 'categorias' })
  
  // If rpc fails (likely), try to get one row and check keys
  const { data: sample, error: sampleError } = await supabase
    .from('categorias')
    .select('*')
    .limit(1)

  if (sampleError) {
    console.error('Erro:', sampleError)
  } else {
    console.log('Colunas:', Object.keys(sample[0]))
    console.log('Exemplo:', sample[0])
  }
}

check()
