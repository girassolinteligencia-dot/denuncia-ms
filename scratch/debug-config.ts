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
  console.log(`Type of "${key}":`, typeof configMap[key])
  console.log(`Condition (=== 'true'):`, configMap[key] === 'true')
}

test()
