import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { BannerManager } from '@/components/admin/banner-manager'

export const metadata = {
  title: 'Gestão de Banners',
}

export default async function BannersPage() {
  const supabase = createAdminClient()
  
  const { data: banners, error } = await supabase
    .from('banners')
    .select('*')
    .order('ordem', { ascending: true })

  if (error) {
    return <div className="p-8 text-error">Erro ao carregar banners: {error.message}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark">Banners e Destaques</h1>
        <p className="text-muted text-sm border-l-2 border-secondary pl-4 py-1">
          Personalize as áreas de destaque visual (Hero, Lateral e Rodapé).
        </p>
      </div>

      <BannerManager initialBanners={banners || []} />
    </div>
  )
}
