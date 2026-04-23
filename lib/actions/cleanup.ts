import { createAdminClient } from '@/lib/supabase-admin'

/**
 * Faxina Automática: Deleta arquivos do Storage que não possuem vínculo no Banco de Dados
 * e que foram criados há mais de 24 horas.
 */
export async function limparArquivosOrfaos() {
  const supabase = createAdminClient()
  console.log('[cleanup] Iniciando faxina de arquivos órfãos...')

  try {
    // 1. Listar todos os arquivos no bucket 'denuncias'
    const { data: storageFiles, error: listErr } = await supabase.storage
      .from('denuncias')
      .list('', { limit: 1000 })

    if (listErr) throw listErr
    if (!storageFiles || storageFiles.length === 0) {
      return { success: true, message: 'Nenhum arquivo encontrado no storage.' }
    }

    // 2. Buscar todos os caminhos registrados no banco
    const { data: dbFiles, error: dbErr } = await supabase
      .from('arquivos_denuncia')
      .select('bucket_path')

    if (dbErr) throw dbErr
    const registeredPaths = new Set(dbFiles?.map(f => f.bucket_path) || [])

    // 3. Identificar órfãos antigos (> 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const orphans = storageFiles.filter(file => {
      const isRegistered = registeredPaths.has(file.name)
      const isOld = new Date(file.created_at) < twentyFourHoursAgo
      // Ignorar arquivos de sistema ou pastas
      return !isRegistered && isOld && file.name !== '.emptyFolderPlaceholder'
    })

    if (orphans.length === 0) {
      console.log('[cleanup] Faxina finalizada: nenhum órfão detectado.')
      return { success: true, message: 'Nenhum arquivo órfão para deletar.' }
    }

    // 4. Deletar órfãos
    console.log(`[cleanup] Deletando ${orphans.length} arquivos órfãos...`)
    const pathsToDelete = orphans.map(f => f.name)
    const { error: delErr } = await supabase.storage
      .from('denuncias')
      .remove(pathsToDelete)

    if (delErr) throw delErr

    console.log('[cleanup] Faxina concluída com sucesso.')
    return { success: true, deleted: pathsToDelete.length }

  } catch (err: any) {
    console.error('[cleanup] Erro crítico na faxina:', err)
    return { success: false, error: err.message }
  }
}
