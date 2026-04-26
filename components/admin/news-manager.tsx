'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Image as ImageIcon,
  Zap,
  Sparkles,
  Loader2,
  Trash2,
  Edit2,
  RefreshCw
} from 'lucide-react'
import type { Noticia } from '@/types'
import { toast } from 'sonner'
import { upsertNoticia, deleteNoticia } from '@/lib/actions/admin-conteudo'
import { gerarSugestoesDeNoticias, aprovarNoticia } from '@/lib/actions/intelligence'
import { X, Save, Upload, CheckCircle2 as CheckCircle } from 'lucide-react'

export const NewsManager: React.FC<{ initialNoticias: Noticia[] }> = ({ initialNoticias }) => {
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias)
  const [generating, setGenerating] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Partial<Noticia> | null>(null)
  const [tempFile, setTempFile] = useState<File | null>(null)
  const [tempPreview, setTempPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleOpenCreate = () => {
    setEditingNoticia({ publicado: false, categoria: 'Geral' })
    setTempFile(null)
    setTempPreview('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (news: Noticia) => {
    setEditingNoticia(news)
    setTempFile(null)
    setTempPreview(news.imagem_url || '')
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTempFile(file)
      setTempPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageData: string | undefined
      
      if (tempFile) {
        // Converte para base64 no cliente de forma segura
        const reader = new FileReader()
        imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Erro na leitura do arquivo'))
          reader.readAsDataURL(tempFile)
        })
      }

      const result = await upsertNoticia(
        editingNoticia!,
        imageData,
        tempFile?.name
      )

      if (result.success) {
        toast.success('Notícia salva com sucesso!')
        setIsModalOpen(false)
        // Recarregar a página para ver mudanças ou atualizar estado local
        window.location.reload()
      } else {
        toast.error('Erro ao salvar: ' + result.error)
      }
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return
    const result = await deleteNoticia(id)
    if (result.success) {
      toast.success('Notícia removida')
      setNoticias(prev => prev.filter(n => n.id !== id))
    } else {
      toast.error('Erro ao remover')
    }
  }

  const handleGenerateRobotNews = async () => {
    setGenerating(true)
    toast.info('IA analisando banco de dados de Mato Grosso do Sul...')
    
    try {
      const result = await gerarSugestoesDeNoticias()
      if (result.success) {
        toast.success(result.message)
        window.location.reload()
      } else {
        toast.error(result.error || 'Erro ao gerar notícias')
      }
    } catch (err: any) {
      toast.error('Erro ao conectar com o motor de IA: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async (id: string) => {
    setLoading(true)
    try {
      const result = await aprovarNoticia(id)
      if (result.success) {
        toast.success('Notícia aprovada e publicada!')
        window.location.reload()
      } else {
        toast.error(result.error)
      }
    } catch (err: any) {
      toast.error('Erro ao aprovar: ' + err.message)
    } finally {
      setLoading(false)
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
                  Ative o motor de IA para analisar as denuncias das últimas 24 horas e gerar boletins resumidos. 
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-10 h-11 text-sm" placeholder="Pesquisar notícias..." />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
            onClick={handleOpenCreate}
            className="btn-primary flex-1 sm:flex-initial gap-2 h-11 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green text-xs font-black uppercase tracking-widest"
           >
             <Plus size={18} />
             Nova Publicação
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
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleOpenEdit(news)}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  {!news.publicado && (
                    <button 
                      onClick={() => handleApprove(news.id)}
                      className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                    >
                      <CheckCircle size={14} />
                      Aprovar
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(news.id)}
                  className="p-2 hover:bg-red-50 text-error rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO/CRIAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up">
              <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
                 <h2 className="text-lg font-black text-dark uppercase tracking-tighter italic">
                    {editingNoticia?.id ? 'Editar Publicação' : 'Nova Publicação'}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                 <div>
                    <label className="label">Título da Notícia</label>
                    <input 
                      required
                      className="input font-bold"
                      value={editingNoticia?.titulo || ''}
                      onChange={e => setEditingNoticia(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Título chamativo para o portal..."
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Categoria</label>
                        <select 
                          className="input"
                          value={editingNoticia?.categoria || ''}
                          onChange={e => setEditingNoticia(prev => ({ ...prev, categoria: e.target.value }))}
                        >
                          <option value="Geral">Geral</option>
                          <option value="Saúde">Saúde</option>
                          <option value="Segurança">Segurança</option>
                          <option value="Obras">Obras</option>
                          <option value="Vigilância">Vigilância</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <div className="flex items-center h-11 gap-4">
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                checked={editingNoticia?.publicado === true} 
                                onChange={() => setEditingNoticia(prev => ({ ...prev, publicado: true, publicado_em: prev?.publicado_em || new Date().toISOString() }))}
                              />
                              <span className="text-xs font-bold">Publicado</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                checked={editingNoticia?.publicado === false} 
                                onChange={() => setEditingNoticia(prev => ({ ...prev, publicado: false }))}
                              />
                              <span className="text-xs font-bold">Rascunho</span>
                           </label>
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="label">Imagem de Destaque</label>
                    <label className="mt-2 border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-all overflow-hidden relative min-h-[160px]">
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                       {tempPreview ? (
                         <img src={tempPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                       ) : null}
                       <div className="relative z-10 flex flex-col items-center">
                          <Upload size={24} className="text-primary mb-2" />
                          <p className="text-xs font-bold">{tempPreview ? 'Trocar Imagem' : 'Upload da Capa'}</p>
                          <p className="text-[10px] text-muted">Apenas JPG ou PNG</p>
                       </div>
                    </label>
                 </div>

                 <div>
                    <label className="label">Conteúdo da Notícia</label>
                    <textarea 
                      required
                      className="input min-h-[200px] py-4 leading-relaxed"
                      value={editingNoticia?.conteudo || ''}
                      onChange={e => setEditingNoticia(prev => ({ ...prev, conteudo: e.target.value }))}
                      placeholder="Escreva os detalhes da notícia aqui..."
                    />
                 </div>

                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost px-6">Cancelar</button>
                    <button disabled={loading} type="submit" className="btn-primary min-w-[140px] gap-2">
                       {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                       Salvar
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
