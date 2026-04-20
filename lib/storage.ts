import { createAdminClient } from '@/lib/supabase-admin'

/**
 * Faz upload de um arquivo para o Supabase Storage.
 * Retorna a URL pública e o caminho no bucket.
 */
/**
 * Faz upload de um arquivo para o Supabase Storage.
 */
export async function uploadArquivo(params: {
  file: File | Buffer
  fileName: string
  contentType: string
  bucket: 'denuncias' | 'banners' | 'noticias' | 'config'
  path?: string // Caminho opcional dentro do bucket
}): Promise<{ url: string; bucketPath: string; tamanhoBytes: number }> {
  const supabase = createAdminClient()

  const timestamp = Date.now()
  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  
  // Se não houver path, usa um padrão baseado no timestamp
  const bucketPath = params.path || `${timestamp}_${safeName}`

  const fileData = params.file instanceof File
    ? await params.file.arrayBuffer().then(buf => Buffer.from(buf))
    : params.file

  const { error } = await supabase.storage
    .from(params.bucket)
    .upload(bucketPath, fileData, {
      contentType: params.contentType,
      upsert: true, // Permite sobrescrever (útil para logos/favicons)
    })

  if (error) {
    throw new Error(`Erro no upload (${params.bucket}): ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(params.bucket)
    .getPublicUrl(bucketPath)

  return {
    url: urlData.publicUrl,
    bucketPath,
    tamanhoBytes: fileData.byteLength,
  }
}

/**
 * Remove um arquivo do Supabase Storage.
 */
export async function removerArquivo(bucketPath: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from('denuncias')
    .remove([bucketPath])

  if (error) {
    throw new Error(`Erro ao remover arquivo: ${error.message}`)
  }
}
