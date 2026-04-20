'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { uploadArquivo } from '@/lib/storage'
import type { Noticia, Banner } from '@/types'

/**
 * Cria ou atualiza uma notícia
 */
export async function upsertNoticia(data: Partial<Noticia>, imageFile?: Buffer, fileName?: string) {
  const supabase = createAdminClient()

  try {
    let imagem_url = data.imagem_url

    // Handle Image Upload
    if (imageFile && fileName) {
      const upload = await uploadArquivo({
        file: imageFile,
        fileName,
        contentType: 'image/jpeg',
        bucket: 'noticias'
      })
      imagem_url = upload.url
    }

    const noticiaData = {
      ...data,
      imagem_url,
      slug: data.titulo ? data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : data.slug,
      atualizado_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('noticias')
      .upsert(noticiaData)

    if (error) throw error

    revalidatePath('/admin/noticias')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Erro ao salvar notícia:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deleta uma notícia
 */
export async function deleteNoticia(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('noticias').delete().eq('id', id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/noticias')
  return { success: true }
}

/**
 * Cria ou atualiza um banner
 */
export async function upsertBanner(data: Partial<Banner>, imageFile?: Buffer, fileName?: string) {
  const supabase = createAdminClient()

  try {
    let imagem_url = data.imagem_url

    if (imageFile && fileName) {
      const upload = await uploadArquivo({
        file: imageFile,
        fileName,
        contentType: 'image/jpeg',
        bucket: 'banners'
      })
      imagem_url = upload.url
    }

    const { error } = await supabase
      .from('banners')
      .upsert({ ...data, imagem_url })

    if (error) throw error

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Deleta um banner
 */
export async function deleteBanner(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('banners').delete().eq('id', id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/banners')
  return { success: true }
}
