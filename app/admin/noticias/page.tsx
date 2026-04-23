import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { NewsManager } from '@/components/admin/news-manager'

export const metadata = {
  title: 'Gestão de Notícias',
}

export default async function NoticiasPage() {
  const supabase = createAdminClient()
  
  const { data: noticias, error } = await supabase
    .from('noticias')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar notícias: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Portal de <span className="text-primary underline decoration-secondary decoration-4 underline-offset-4">Notícias</span></h1>
          <p className="text-muted text-sm font-medium">
            Gerencie o conteúdo informativo exibido aos cidadãos no portal público.
          </p>
        </div>
      </div>

      <NewsManager initialNoticias={noticias || []} />
    </div>
  )
}
