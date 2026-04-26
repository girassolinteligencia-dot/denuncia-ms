import { createAdminClient } from './lib/supabase-admin'

async function setupBuckets() {
  const supabase = createAdminClient()
  const buckets = ['banners', 'noticias', 'config', 'denuncias', 'relatos-oficiais']
  
  console.log('[STORAGE] Iniciando configuração de buckets...')

  for (const bucketName of buckets) {
    console.log(`[STORAGE] Verificando bucket: ${bucketName}...`)
    
    const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName)
    
    if (getError) {
      console.log(`[STORAGE] Bucket '${bucketName}' não encontrado ou erro. Tentando criar...`)
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })
      
      if (createError) {
        console.error(`[STORAGE] Erro ao criar bucket '${bucketName}':`, createError.message)
      } else {
        console.log(`[STORAGE] Bucket '${bucketName}' criado com sucesso!`)
      }
    } else {
      console.log(`[STORAGE] Bucket '${bucketName}' já existe.`)
    }
  }
}

setupBuckets().catch(console.error)
