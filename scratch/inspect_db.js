const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'categorias' });
  
  if (error) {
    // If RPC doesn't exist, try a simple select from a non-existent column to see the error,
    // or try to fetch one row and see the keys.
    console.log('RPC failed, trying simple select...');
    const { data: row, error: selectError } = await supabase.from('categorias').select('*').limit(1).single();
    if (selectError) {
      console.error('Select error:', selectError);
    } else {
      console.log('Columns found:', Object.keys(row));
    }
  } else {
    console.log('Columns:', data);
  }
}

inspect();
