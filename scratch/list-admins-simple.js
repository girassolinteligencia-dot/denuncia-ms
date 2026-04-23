const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vfnwtxglknfbwlohblnp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbnd0eGdsa25mYndsb2hibG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDExMiwiZXhwIjoyMDkyMTE2MTEyfQ.TTVdebY9O547J6xbfUq3gtKQtJLTlK3NCF_oqGTx2Ks'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers()
  if (userErr) { console.error(userErr); return }

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, nome, role')
    .in('role', ['admin', 'superadmin'])

  if (profErr) { console.error(profErr); return }

  const adminList = profiles.map(p => {
    const user = users.find(u => u.id === p.id)
    return {
      nome: p.nome,
      email: user ? user.email : 'N/A',
      role: p.role
    }
  })

  console.log(JSON.stringify(adminList, null, 2))
}

run()
