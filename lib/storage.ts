'use server'
import { createAdminClient } from '@/lib/supabase-admin'

/**
 * Faz upload de um arquivo para o Supabase Storage.
 * Retorna a URL pública e o caminho no bucket.
 */
/**
 * Faz upload de um arquivo para o Supabase Storage.
 */
export async function uploadArquivo(params: {
  file: File | Buffer | string // Aceita base64 string também
  fileName: string
  contentType: string
  bucket: 'denuncias' | 'banners' | 'noticias' | 'config'
  path?: string 
}): Promise<{ url: string; bucketPath: string; tamanhoBytes: number }> {
  const supabase = createAdminClient()

  const timestamp = Date.now()
  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const bucketPath = params.path || `${timestamp}_${safeName}`

  let fileData: Buffer

  if (typeof params.file === 'string' && params.file.includes('base64,')) {
    // Caso seja uma string base64 vinda do cliente
    fileData = Buffer.from(params.file.split('base64,')[1], 'base64')
  } else if (params.file instanceof File) {
    fileData = Buffer.from(await params.file.arrayBuffer())
  } else {
    fileData = params.file as Buffer
  }

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
