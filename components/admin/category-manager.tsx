'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  GripVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Mail,
  Zap,
  AlertTriangle,
  FolderOpen
} from 'lucide-react'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { updateCategoria, createCategoria, deleteCategoria, reorderCategorias } from '@/lib/actions/admin-categorias'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { IconPicker } from './icon-picker'
import type { Categoria } from '@/types'
import { toast } from 'sonner'

// Componente de Item Reordenável
const SortableCategoryItem = ({ 
  cat, 
  onToggleActive, 
  onEdit, 
  onDelete 
}: { 
  cat: Categoria, 
  onToggleActive: (id: string) => void,
  onEdit: (cat: Categoria) => void,
  onDelete: (id: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cat.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-card p-4 flex items-center gap-4 hover:shadow-card-md transition-all group ${isDragging ? 'shadow-2xl border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-border'} ${!cat.ativo ? 'opacity-60 border-dashed' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab text-muted hover:text-primary transition-colors p-2 -ml-2"
      >
        <GripVertical size={20} />
      </div>

      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-primary shadow-inner border border-border/50 group-hover:bg-primary-50 transition-colors">
        <LucideIcon name={cat.icon_name || 'FolderOpen'} size={24} strokeWidth={1.5} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-dark">{cat.label}</h3>
          <code className="text-[10px] bg-primary-50 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
            {cat.slug}
          </code>
          {!cat.ativo && (
            <span className="badge bg-red-50 text-error border border-red-100 uppercase tracking-tighter text-[9px]">
              OMITIDA NO SITE
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
           <p className="text-[10px] text-muted font-bold truncate max-w-md">
              Destino: {cat.email_destino || 'E-mail Padrão da Plataforma'}
           </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pr-2">
        <div className="flex items-center gap-2 pr-4 border-r border-border mr-2">
           <button 
            onClick={() => onToggleActive(cat.id)}
            className={`p-2 rounded-lg transition-all ${cat.ativo ? 'text-success hover:bg-green-50' : 'text-muted hover:bg-surface'}`}
            title={cat.ativo ? 'Omitir Categoria' : 'Tornar Visível'}
           >
              {cat.ativo ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
           </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(cat)}
            className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all"
            title="Editar Categoria"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(cat.id)}
            className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-all"
            title="Excluir Categoria"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export const CategoryManager: React.FC<{ initialCategorias: Categoria[] }> = ({ initialCategorias }) => {
  const [categorias, setCategorias] = useState<Categoria[]>(
    [...initialCategorias].sort((a, b) => a.ordem - b.ordem)
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCat, setEditingCat] = useState<Categoria | null>(null)
  const [loading, setLoading] = useState(false)

  // Configuração de Sensores para Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = categorias.findIndex((item) => item.id === active.id)
      const newIndex = categorias.findIndex((item) => item.id === over.id)
      
      const newOrder = arrayMove(categorias, oldIndex, newIndex)
      
      // Atualiza estado local imediatamente
      setCategorias(newOrder)
      
      // Prepara dados para o banco
      const updates = newOrder.map((cat, index) => ({
        id: cat.id,
        ordem: index + 1
      }))
      
      // Sincroniza com o banco
      toast.promise(reorderCategorias(updates), {
        loading: 'Salvando nova ordem...',
        success: 'Ordem atualizada com sucesso',
        error: 'Erro ao salvar nova ordem'
      })
    }
  }

  const filtered = categorias.filter(c => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleActive = async (id: string) => {
    const cat = categorias.find(c => c.id === id)
    if (!cat) return

    setLoading(true)
    const result = await updateCategoria(id, { ativo: !cat.ativo })
    
    if (result.success) {
      setCategorias(prev => prev.map(c => c.id === id ? { ...c, ativo: !cat.ativo } : c))
      toast.success(`Categoria ${!cat.ativo ? 'ativada' : 'desativada'} com sucesso`)
    } else {
      toast.error('Erro ao atualizar visibilidade')
    }
    setLoading(false)
  }

  const handleUpdateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingCat) return
    
    setLoading(true)
    
    try {
      if (!editingCat.id || editingCat.id === '') {
        const result = await createCategoria(editingCat)
        if (result.success && result.data) {
          setCategorias(prev => [...prev, result.data as Categoria].sort((a, b) => a.ordem - b.ordem))
          setEditingCat(null)
          toast.success('Categoria criada com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao criar categoria')
        }
      } else {
        const result = await updateCategoria(editingCat.id, editingCat)
        if (result.success) {
          setCategorias(prev => prev.map(c => c.id === editingCat.id ? editingCat : c))
          setEditingCat(null)
          toast.success('Categoria parametrizada com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao salvar alterações')
        }
      }
    } catch (err: any) {
      toast.error('Erro interno ao processar requisição')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Esta ação não poderá ser desfeita.')) return

    setLoading(true)
    const result = await deleteCategoria(id)
    if (result.success) {
      setCategorias(prev => prev.filter(c => c.id !== id))
      toast.success('Categoria excluída')
    } else {
      toast.error(result.error || 'Erro ao excluir')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text"
            placeholder="Pesquisar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 h-11"
          />
        </div>
        <button 
          onClick={() => setEditingCat({
            id: '',
            slug: '',
            label: 'Nova Categoria',
            bloco: 'Geral',
            icon_name: 'FolderOpen',
            instrucao_publica: '',
            aviso_legal: '',
            template_descricao: [],
            ativo: true,
            ordem: categorias.length + 1,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          })}
          className="btn-primary gap-2 h-11"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filtered.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {filtered.map((cat) => (
              <SortableCategoryItem 
                key={cat.id} 
                cat={cat} 
                onToggleActive={handleToggleActive}
                onEdit={setEditingCat}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {filtered.length === 0 && (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-card p-12 text-center">
            <p className="text-muted text-sm italic">Nenhuma categoria encontrada para &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-card flex items-center justify-between">
        <div>
           <p className="text-sm font-bold text-dark">Dica de Gestão</p>
           <p className="text-xs text-muted mt-1">Arraste as categorias pelo ícone de hambúrguer para definir a ordem de exibição.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <CheckCircle2 size={16} />
          A ordem é salva automaticamente ao soltar o item
        </div>
      </div>

      {/* Editor Lateral (Drawer Overlay) */}
      {editingCat && (
        <>
          <div className="fixed inset-0 bg-dark/20 backdrop-blur-sm z-[100]" onClick={() => setEditingCat(null)}></div>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] animate-slide-left border-l border-border flex flex-col">
             <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
                <div>
                   <h2 className="font-extrabold text-dark uppercase tracking-tighter italic">Parametrizar Categoria</h2>
                   <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{editingCat.label}</p>
                </div>
                <button onClick={() => setEditingCat(null)} className="p-2 hover:bg-border rounded-full transition-colors" title="Fechar">
                   <XCircle size={20} className="text-muted" />
                </button>
             </div>

             <form onSubmit={handleUpdateCategory} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                   <label className="label">Ícone de Representação</label>
                   <IconPicker 
                      currentIcon={editingCat.icon_name || 'FolderOpen'} 
                      onSelect={(icon) => setEditingCat({...editingCat, icon_name: icon})}
                   />
                   <p className="text-[9px] text-muted mt-2 font-medium italic">
                      Este ícone aparecerá no portal público para identificação visual da denuncia.
                   </p>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="label label-required">Título da Categoria</label>
                      <input 
                        className="input h-11" 
                        value={editingCat.label} 
                        onChange={e => {
                          const newLabel = e.target.value
                          const newSlug = !editingCat.id ? newLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : editingCat.slug
                          setEditingCat({...editingCat, label: newLabel, slug: newSlug})
                        }}
                        required
                      />
                   </div>

                    <div>
                       <label className="label label-required">Identificador Único (Slug)</label>
                       <input 
                         className="input h-11 bg-surface font-mono text-[10px]" 
                         value={editingCat.slug} 
                         onChange={e => setEditingCat({...editingCat, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})}
                         placeholder="ex: denuncia-ambiental"
                         required
                       />
                       <p className="text-[9px] text-muted mt-2 font-medium italic">
                          Este campo é usado na URL e no banco de dados. Não deve conter espaços ou acentos.
                       </p>
                    </div>
                </div>

                <div>
                   <label className="label">E-mail de Destino (Parametrização)</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input 
                        type="email"
                        className="input pl-10 h-11" 
                        placeholder="destino@orgao.ms.gov.br"
                        value={editingCat.email_destino || ''} 
                        onChange={e => setEditingCat({...editingCat, email_destino: e.target.value})}
                      />
                   </div>
                   <p className="text-[9px] text-muted mt-2 font-medium italic">
                      Se vazio, as denuncias desta categoria irão para o e-mail principal da plataforma.
                   </p>
                </div>

                <div>
                   <label className="label">Instrução ao Cidadão (Público)</label>
                   <textarea 
                     className="input min-h-[80px] py-3 text-sm" 
                     placeholder="Explique o que o cidadão deve denunciar nesta categoria..."
                     value={editingCat.instrucao_publica || ''} 
                     onChange={e => setEditingCat({...editingCat, instrucao_publica: e.target.value})}
                   />
                </div>
 
                 <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <label className="label text-amber-900 flex items-center gap-2">
                       <AlertTriangle size={14} />
                       Protocolo de Urgência (Aviso Legal)
                    </label>
                    <textarea 
                      className="input bg-white border-amber-200 min-h-[80px] py-3 text-sm text-amber-900 placeholder:text-amber-300" 
                      placeholder="Ex: 🚨 EMERGÊNCIA: Ligue 192 (SAMU) ou 190 (PM)."
                      value={editingCat.aviso_legal || ''} 
                      onChange={e => setEditingCat({...editingCat, aviso_legal: e.target.value})}
                    />
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tight italic">
                       Se preenchido, exibirá um banner de alerta vermelho antes do formulário.
                    </p>
                 </div>

                <div className="bg-surface rounded-xl p-4 border border-border">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Zap size={16} className="text-secondary" />
                         <span className="text-[10px] font-black text-dark uppercase tracking-widest">Visibilidade no Site</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setEditingCat({...editingCat, ativo: !editingCat.ativo})}
                        className={`w-12 h-6 rounded-full relative transition-all ${editingCat.ativo ? 'bg-primary' : 'bg-border'}`}
                        title={editingCat.ativo ? 'Desativar' : 'Ativar'}
                      >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingCat.ativo ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>
                </div>
                
                <div className="pt-4 pb-8">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full h-14 gap-3 shadow-xl"
                    >
                       {loading ? (
                         <FolderOpen className="animate-spin" size={20} />
                       ) : (
                         <CheckCircle2 size={20} />
                       )}
                       <span className="font-black uppercase tracking-widest text-xs">Salvar Configuração</span>
                    </button>
                </div>
             </form>
          </div>
        </>
      )}
    </div>
  )
}

