import { createAdminClient } from '../lib/supabase-admin'

async function test() {
  const supabase = createAdminClient()
  const { data: configs, error } = await supabase.from('plataforma_config').select('chave, valor')
  if (error) console.error('Supabase Error:', error)
  console.log('Configs:', JSON.stringify(configs, null, 2))
  
  const configMap = (configs || []).reduce((acc: Record<string, any>, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})
  
  const key = 'funcionalidade.pesquisa_satisfacao_ativa'
  console.log(`Key "${key}":`, configMap[key])
  
  console.log('--- Testando Inserção de Voto ---')
  const { data: voteRes, error: voteErr } = await supabase
    .from('pesquisas_satisfacao')
    .insert([{ voto: 'excelente', comentario: 'Teste via script' }])
  
  if (voteErr) {
    console.error('Erro ao inserir voto:', voteErr)
  } else {
    console.log('Voto inserido com sucesso!')
  }
}

test()
