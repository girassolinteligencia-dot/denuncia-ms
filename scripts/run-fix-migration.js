const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260423_denuncia_submission_fix.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Executando migração no Supabase...');
  
  // O Supabase JS não tem um método direto para rodar SQL arbitrário por segurança,
  // exceto se usarmos um RPC que aceite SQL (geralmente não recomendado) ou via API REST se habilitado.
  // No entanto, podemos tentar rodar via RPC se existir um executor de SQL, ou instruir o usuário.
  
  console.log('--- SQL INICIO ---');
  console.log(sql);
  console.log('--- SQL FIM ---');
  
  console.log('\nIMPORTANTE: Copie o SQL acima e cole no "SQL Editor" do seu painel Supabase para aplicar as correções de banco de dados.');
}

runMigration();
