const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://vfnwtxglknfbwlohblnp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbnd0eGdsa25mYndsb2hibG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDExMiwiZXhwIjoyMDkyMTE2MTEyfQ.TTVdebY9O547J6xbfUq3gtKQtJLTlK3NCF_oqGTx2Ks'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data, error } = await supabase.from('integracoes_destino').select('*')
  console.log('Error:', error)
  console.log('Count:', data?.length)
  if (data) {
    const grouped = data.reduce((acc, row) => {
      acc[row.categoria_id] = (acc[row.categoria_id] || 0) + 1
      return acc
    }, {})
    console.log('Grouped by category:', grouped)
  }
}
run()
