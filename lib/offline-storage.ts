'use client'

/**
 * Utilitário para gerenciar denúncias offline usando IndexedDB.
 * Permite salvar rascunhos e anexos localmente quando não há internet.
 */

const DB_NAME = 'DenunciaMS_Offline'
const STORE_NAME = 'rascunhos'
const DB_VERSION = 1

export interface OfflineDraft {
  id: string
  timestamp: number
  data: any
  arquivos: any[]
  status: 'pending' | 'syncing' | 'completed'
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function salvarRascunhoOffline(id: string, data: any, arquivos: any[]) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  const draft: OfflineDraft = {
    id,
    timestamp: Date.now(),
    data,
    arquivos,
    status: 'pending'
  }

  return new Promise((resolve, reject) => {
    const request = store.put(draft)
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

export async function buscarRascunhosPendentes(): Promise<OfflineDraft[]> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result as OfflineDraft[]
      resolve(all.filter(d => d.status === 'pending'))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function removerRascunho(id: string) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}
