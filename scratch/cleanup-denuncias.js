const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vfnwtxglknfbwlohblnp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbnd0eGdsa25mYndsb2hibG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDExMiwiZXhwIjoyMDkyMTE2MTEyfQ.TTVdebY9O547J6xbfUq3gtKQtJLTlK3NCF_oqGTx2Ks'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanup() {
  const targetDate = '2026-05-14T00:00:00Z'
  console.log(`Iniciando limpeza de denuncias e anexos antes de ${targetDate}...`)

  // 1. Pegar IDs das denúncias
  const { data: denuncias, error: errDenuncias } = await supabase
    .from('denuncias')
    .select('id')
    .lt('criado_em', targetDate)

  if (errDenuncias) {
    console.error('Erro ao buscar denúncias:', errDenuncias)
    return
  }

  if (!denuncias || denuncias.length === 0) {
    console.log('Nenhuma denúncia antiga encontrada. Banco já está limpo.')
    return
  }

  const denunciaIds = denuncias.map(d => d.id)
  console.log(`Encontradas ${denunciaIds.length} denúncias para exclusão.`)

  // 2. Buscar anexos dessas denúncias para apagar do Storage
  const { data: anexos, error: errAnexos } = await supabase
    .from('denuncia_anexos')
    .select('bucket_path')
    .in('denuncia_id', denunciaIds)

  if (errAnexos) {
    console.error('Erro ao buscar anexos:', errAnexos)
    return
  }

  if (anexos && anexos.length > 0) {
    const paths = anexos.map(a => a.bucket_path).filter(p => !!p)
    console.log(`Deletando ${paths.length} arquivos do Storage (bucket: anexos-denuncias)...`)
    
    // Deletar os arquivos
    const { data: storageData, error: storageErr } = await supabase
      .storage
      .from('anexos-denuncias')
      .remove(paths)

    if (storageErr) {
      console.error('Erro ao deletar do Storage:', storageErr)
      // continua mesmo com erro no storage
    } else {
      console.log('Arquivos deletados com sucesso do Storage.')
    }
  }

  // 3. Deletar as denúncias (On Delete Cascade vai cuidar de denuncia_anexos e log_integracoes)
  console.log('Apagando denúncias do banco de dados (cascade para histórico e anexos)...')
  const { error: delErr } = await supabase
    .from('denuncias')
    .delete()
    .lt('criado_em', targetDate)

  if (delErr) {
    console.error('Erro ao deletar denúncias do banco:', delErr)
  } else {
    console.log('✅ Limpeza concluída com sucesso! Todas as denúncias antigas e seus arquivos foram removidos.')
  }
}

cleanup()
