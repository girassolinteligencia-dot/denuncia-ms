const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkFavicon() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('chave', 'identidade.favicon')
    .single();

  if (error) {
    console.log('Nenhuma configuração dinâmica de favicon encontrada ou erro:', error.message);
    return;
  }

  console.log('Favicon dinâmico atual:', data.valor);
}

checkFavicon();
