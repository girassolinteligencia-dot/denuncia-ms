'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  GripVertical, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Zap,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import type { Categoria } from '@/types'

export const CategoryManager: React.FC<{ initialCategorias: Categoria[] }> = ({ initialCategorias }) => {
  const [categorias, setCategorias] = useState<Categoria[]>(
    [...initialCategorias].sort((a, b) => a.ordem - b.ordem)
  )
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = categorias.filter(c => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
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
        <button className="btn-primary gap-2 h-11">
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((cat) => (
          <div 
            key={cat.id} 
            className="bg-white border border-border rounded-card p-4 flex items-center gap-4 hover:shadow-card-md transition-all group"
          >
            <div className="cursor-grab text-muted hover:text-primary transition-colors">
              <GripVertical size={20} />
            </div>

            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-2xl shadow-inner border border-border/50">
              {cat.emoji || '📂'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-dark">{cat.label}</h3>
                <code className="text-[10px] bg-primary-50 text-primary px-1.5 py-0.5 rounded font-bold">
                  {cat.slug}
                </code>
                {!cat.ativo && (
                  <span className="badge bg-red-50 text-error border border-red-100 uppercase tracking-tighter text-[9px]">
                    Inativo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1 line-clamp-1 max-w-xl">
                {cat.instrucao_publica || 'Sem instrução definida.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pr-2">
              <div className="flex -space-x-1.5 overflow-hidden pr-4 border-r border-border mr-2">
                 <div className="w-8 h-8 rounded-full bg-primary-50 border-2 border-white flex items-center justify-center text-primary" title="Integração E-mail Ativa">
                    <Mail size={14} />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-secondary-50 border-2 border-white flex items-center justify-center text-secondary" title="Webhook Ativo">
                    <Zap size={14} />
                 </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all" title="Editar Configurações">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-all" title="Excluir Categoria">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-card p-12 text-center">
            <p className="text-muted text-sm italic italic">Nenhuma categoria encontrada para "{searchTerm}"</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-card flex items-center justify-between">
        <div>
           <p className="text-sm font-bold text-dark">Dica de Gestão</p>
           <p className="text-xs text-muted mt-1">Arraste as categorias para definir a ordem em que aparecem no formulário público.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <CheckCircle2 size={16} />
          Alterações de ordem são salvas automaticamente
        </div>
      </div>
    </div>
  )
}
