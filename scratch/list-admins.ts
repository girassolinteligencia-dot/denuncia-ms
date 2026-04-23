import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listAdmins() {
  console.log('--- Lista de Administradores ---')
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('email, role, full_name')
    .eq('role', 'admin')

  if (error) {
    console.error('Erro ao buscar perfis:', error)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('Nenhum administrador encontrado na tabela profiles.')
  } else {
    profiles.forEach(p => {
      console.log(`Nome: ${p.full_name} | E-mail: ${p.email} | Cargo: ${p.role}`)
    })
  }
}

listAdmins()
