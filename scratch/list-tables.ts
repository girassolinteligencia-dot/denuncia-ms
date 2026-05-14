import { createAdminClient } from '../lib/supabase-admin'

async function test() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_tables_info')
  
  if (error) {
    // Se o RPC não existir, vamos tentar uma query bruta via um hack de view se houver
    console.error('RPC get_tables_info não existe. Tentando via select genérico em pg_catalog...')
    const { data: tables, error: err2 } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public')
    if (err2) {
        console.error('Erro ao listar tabelas:', err2)
    } else {
        console.log('Tabelas encontradas:', tables.map(t => t.tablename))
    }
  } else {
    console.log('Tabelas Info:', data)
  }
}

test()
