import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vfnwtxglknfbwlohblnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbnd0eGdsa25mYndsb2hibG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDExMiwiZXhwIjoyMDkyMTE2MTEyfQ.TTVdebY9O547J6xbfUq3gtKQtJLTlK3NCF_oqGTx2Ks'

const supabase = createClient(supabaseUrl, supabaseKey)

async function listCategories() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, label, slug, bloco')
    .eq('ativo', true)
    .order('label')

  if (error) {
    console.error(error)
    return
  }

  console.log(JSON.stringify(data, null, 2))
}

listCategories()
