'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Edit2,
  X,
  Save,
  Upload,
  RefreshCw
} from 'lucide-react'
import type { Banner } from '@/types'
import { toast } from 'sonner'
import { upsertBanner, deleteBanner } from '@/lib/actions/admin-conteudo'

export const BannerManager: React.FC<{ initialBanners: Banner[] }> = ({ initialBanners }) => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null)
  const [tempFile, setTempFile] = useState<File | null>(null)
  const [tempPreview, setTempPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleOpenCreate = () => {
    setEditingBanner({ ativo: true, posicao: 'topo', ordem: banners.length + 1 })
    setTempFile(null)
    setTempPreview('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setTempFile(null)
    setTempPreview(banner.imagem_url)
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
      let buffer: Buffer | undefined
      if (tempFile) {
        const arrayBuffer = await tempFile.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      }

      const result = await upsertBanner(editingBanner!, buffer, tempFile?.name)
      if (result.success) {
        toast.success('Banner salvo com sucesso!')
        setIsModalOpen(false)
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
    if (!confirm('Deseja remover este banner?')) return
    const result = await deleteBanner(id)
    if (result.success) {
      toast.success('Banner removido')
      setBanners(prev => prev.filter(b => b.id !== id))
    } else {
      toast.error('Erro ao remover')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in px-4">
      <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Painel de Destaques Visuais</p>
          <button 
            onClick={handleOpenCreate}
            className="btn-primary gap-2 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green"
          >
            <Plus size={20} />
            Adicionar Banner
          </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-card shadow-card border border-border overflow-hidden flex items-center gap-6 p-4 hover:shadow-card-md transition-all">
            <div className="cursor-grab text-muted hover:text-primary transition-colors">
              <GripVertical size={24} />
            </div>

            <div className="w-48 h-20 bg-surface rounded-lg overflow-hidden border border-border shrink-0">
               {banner.imagem_url ? (
                 <img src={banner.imagem_url} alt="Banner" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageIcon size={24} />
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-1">
               <div className="flex items-center gap-2">
                 <span className="badge bg-primary-50 text-primary uppercase text-[8px] font-black tracking-widest">
                   {banner.posicao}
                 </span>
                 {banner.ativo ? (
                   <span className="badge bg-green-50 text-success uppercase text-[8px] font-black tracking-widest">Ativo</span>
                 ) : (
                   <span className="badge bg-red-50 text-error uppercase text-[8px] font-black tracking-widest">Pausado</span>
                 )}
               </div>
               <div className="flex items-center gap-2 text-xs text-muted font-medium">
                 <LinkIcon size={14} className="text-primary" />
                 <span className="line-clamp-1">{banner.link_url || 'Sem link externo definido'}</span>
               </div>
            </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEdit(banner)}
                  className="btn-outline btn-sm font-bold"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}

        {/* MODAL DE EDIÇÃO/CRIAÇÃO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-slide-up">
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
                  <h2 className="text-lg font-black text-dark uppercase tracking-tighter italic">
                      {editingBanner?.id ? 'Editar Banner' : 'Novo Banner'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full">
                      <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div>
                      <label className="label">Arte do Banner</label>
                      <label className="mt-2 border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-all overflow-hidden relative min-h-[140px]">
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        {tempPreview ? (
                          <img src={tempPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                        ) : null}
                        <div className="relative z-10 flex flex-col items-center">
                            <Upload size={24} className="text-primary mb-2" />
                            <p className="text-xs font-bold">{tempPreview ? 'Trocar Imagem' : 'Upload da Arte'}</p>
                        </div>
                      </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="label">Posição</label>
                          <select 
                            className="input"
                            value={editingBanner?.posicao || 'topo'}
                            onChange={e => setEditingBanner(prev => ({ ...prev, posicao: e.target.value as any }))}
                          >
                            <option value="topo">Topo (Hero)</option>
                            <option value="lateral">Lateral (Sidebar)</option>
                            <option value="rodape">Rodapé</option>
                          </select>
                      </div>
                      <div>
                          <label className="label">Link de Destino</label>
                          <input 
                            className="input" 
                            placeholder="https://..."
                            value={editingBanner?.link_url || ''}
                            onChange={e => setEditingBanner(prev => ({ ...prev, link_url: e.target.value }))}
                          />
                      </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editingBanner?.ativo}
                          onChange={e => setEditingBanner(prev => ({ ...prev, ativo: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-dark">Banner Ativo</span>
                      </label>
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

        {banners.length === 0 && (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-card p-12 text-center text-muted italic">
             Nenhum banner cadastrado. Adicione um para destacar informações importantes no portal público.
          </div>
        )}
      </div>
    </div>
  )
}
