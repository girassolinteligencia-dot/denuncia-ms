import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await db.from('denuncias').select('categorias ( label, slug, integracoes_destino ( tipo, orgao ) )').limit(5);
  console.log(JSON.stringify({data, error}, null, 2));
}

test();
