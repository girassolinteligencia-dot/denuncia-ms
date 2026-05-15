import { createAdminClient } from './lib/supabase-admin';

async function test() {
  const db = createAdminClient();
  const res = await db.from('denuncias').select('categorias ( label, slug, integracoes_destino ( tipo, orgao ) )').limit(5);
  console.log(JSON.stringify(res, null, 2));
}

test();
