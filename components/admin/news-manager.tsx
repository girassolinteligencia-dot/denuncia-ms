'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Eye, 
  MoreHorizontal,
  Image as ImageIcon,
  Zap,
  Sparkles,
  Loader2
} from 'lucide-react'
import type { Noticia } from '@/types'
import { toast } from 'sonner'

export const NewsManager: React.FC<{ initialNoticias: Noticia[] }> = ({ initialNoticias }) => {
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias)
  const [generating, setGenerating] = useState(false)

  const handleGenerateRobotNews = async () => {
    setGenerating(true)
    toast.info('IA analisando banco de dados de Mato Grosso do Sul...')
    
    try {
      await new Promise(r => setTimeout(r, 2000))
      const news1: Noticia = {
        id: Math.random().toString(),
        titulo: '[AUTO] Resumo Diário: Saúde Pública é a principal pauta hoje',
        slug: 'resumo-diario-' + Date.now(),
        conteudo: 'Conteúdo gerado via IA...',
        categoria: 'Saúde',
        imagem_url: null,
        autor_id: 'robot',
        publicado: false,
        publicado_em: null,
        criado_em: new Date().toISOString()
      }
      setNoticias(prev => [news1, ...prev])
      toast.success('Novo boletim de impacto gerado com sucesso! (Rascunho)')
    } catch {
      toast.error('Erro ao conectar com o motor de IA')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* Robô de Impacto - IA Generator Section */}
      <div className="bg-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-glow-cyan border-none">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
               <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                  <Zap size={14} className="fill-primary" />
                  Impact Intelligence Engine
               </div>
               <h2 className="text-3xl font-black italic tracking-tighter">ROBÔ DE <span className="text-primary italic">NOTÍCIAS</span></h2>
               <p className="text-white/60 text-sm leading-relaxed font-medium transition-opacity">
                  Ative o motor de IA para analisar as denúncias das últimas 24 horas e gerar boletins resumidos. 
                  O sistema anonimiza os dados e cria rascunhos jornalísticos prontos para serem revisados e publicados.
               </p>
            </div>
            <button 
              onClick={handleGenerateRobotNews}
              disabled={generating}
              className="px-8 h-16 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
               {generating ? (
                 <Loader2 size={24} className="animate-spin" />
               ) : (
                 <Sparkles size={24} />
               )}
               {generating ? 'Gerando Análise...' : 'Gerar Boletim do Dia'}
            </button>
         </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input className="input pl-10 h-11" placeholder="Pesquisar notícias..." />
        </div>
        <div className="flex items-center gap-3">
           <button className="btn-primary gap-2 h-11 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green">
             <Plus size={20} />
             Criar Nova Publicação
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {noticias.map((news) => (
          <div key={news.id} className="bg-white rounded-card shadow-card-md border border-border overflow-hidden flex flex-col group transition-all hover:shadow-card-lg">
            <div className="h-48 bg-surface relative overflow-hidden">
               {news.imagem_url ? (
                 <img src={news.imagem_url} alt={news.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageIcon size={48} className="opacity-20" />
                 </div>
               )}
               <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20 ${news.publicado ? 'bg-success/80 text-white' : 'bg-warning/80 text-white'}`}>
                    {news.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
               </div>
            </div>

            <div className="p-5 flex-1 space-y-3">
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.1em]">{news.categoria || 'Geral'}</p>
              <h3 className="font-bold text-dark leading-tight line-clamp-2">
                {news.titulo}
              </h3>
              
              <div className="flex items-center gap-4 text-[11px] text-muted">
                 <div className="flex items-center gap-1">
                   <Calendar size={14} />
                   {news.publicado_em ? new Date(news.publicado_em).toLocaleDateString() : 'N/A'}
                 </div>
                 <div className="flex items-center gap-1">
                   <User size={14} />
                   Paulo Admin
                 </div>
              </div>
            </div>

            <div className="p-4 bg-surface/50 border-t border-border flex items-center justify-between">
               <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                 <Eye size={14} />
                 Visualizar
               </button>
               <button className="p-2 hover:bg-white rounded-lg transition-colors">
                 <MoreHorizontal size={18} className="text-muted" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
