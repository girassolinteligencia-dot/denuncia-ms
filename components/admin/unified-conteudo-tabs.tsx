'use client'

import React, { useState } from 'react'
import { 
  Newspaper, 
  ImageIcon, 
  BarChart3
} from 'lucide-react'
import { NewsManager } from './news-manager'
import { BannerManager } from './banner-manager'
import { EnquetesManager } from './enquetes-manager'

export function UnifiedConteudoTabs({ 
  initialNews, 
  initialBanners, 
  initialEnquetes,
  satisfacaoAtiva
}: { 
  initialNews: any[], 
  initialBanners: any[],
  initialEnquetes: any[],
  satisfacaoAtiva: boolean
}) {
  const [activeTab, setActiveTab] = useState('noticias')

  const TABS = [
    { id: 'noticias', label: 'Notícias & Informativos', icon: Newspaper },
    { id: 'banners', label: 'Banners da Home', icon: ImageIcon },
    { id: 'enquetes', label: 'Pesquisas & Enquetes', icon: BarChart3 },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id 
                ? 'text-secondary' 
                : 'text-muted hover:text-dark hover:bg-surface'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary rounded-t-full shadow-glow-green"></div>
            )}
          </button>
        ))}
      </div>

      <div className="py-4">
        {activeTab === 'noticias' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Portal de Notícias</h2>
              <p className="text-sm text-muted font-medium">Publique atualizações, resultados de fiscalizações e informativos para a população.</p>
            </div>
            <NewsManager initialNoticias={initialNews} />
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-6 animate-slide-up">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Gestão de Banners</h2>
              <p className="text-sm text-muted font-medium">Controle os slides e destaques visuais que aparecem no topo da Landing Page.</p>
            </div>
            <BannerManager initialBanners={initialBanners} />
          </div>
        )}

        {activeTab === 'enquetes' && (
          <div className="space-y-6 animate-slide-up">
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-dark uppercase italic tracking-tight mb-2">Escuta Ativa</h2>
              <p className="text-sm text-muted font-medium">Crie enquetes rápidas e gerencie a pesquisa de satisfação por emojis.</p>
            </div>
            <EnquetesManager initialEnquetes={initialEnquetes} satisfacaoAtiva={satisfacaoAtiva} />
          </div>
        )}
      </div>
    </div>
  )
}
