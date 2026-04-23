const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vfnwtxglknfbwlohblnp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbnd0eGdsa25mYndsb2hibG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDExMiwiZXhwIjoyMDkyMTE2MTEyfQ.TTVdebY9O547J6xbfUq3gtKQtJLTlK3NCF_oqGTx2Ks'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetPassword() {
  const email = 'girassolinteligencia@gmail.com'
  const newPassword = 'Admin@MS2026'

  // Primeiro pegar o ID do usuário
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error(listErr); return }

  const user = users.find(u => u.email === email)
  if (!user) {
    console.log(`Usuário ${email} não encontrado.`)
    return
  }

  // Atualizar a senha
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  )

  if (error) {
    console.error('Erro ao resetar senha:', error)
  } else {
    console.log(`Senha de ${email} resetada com sucesso para: ${newPassword}`)
  }
}

resetPassword()
