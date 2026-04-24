// No dependencies needed for simple fetch if we use the API directly
// but createClient is easier. I'll use npx to run it.
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Manual env parsing
const env = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltam variáveis de ambiente')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('nome', '%Paulo%')
  
  if (error) {
    console.error('Erro:', error)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
}

check()
