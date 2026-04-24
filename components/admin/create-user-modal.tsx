'use client'

import React, { useState } from 'react'
import { X, UserPlus, Mail, Lock, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createUsuarioAdmin } from '@/lib/actions/admin-usuarios'
import type { UserRole } from '@/types'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderador' as UserRole
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const result = await createUsuarioAdmin({
        nome: formData.nome,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })

      if (result.success) {
        if (result.warning) {
          toast.warning(result.warning, { duration: 10000 })
        } else {
          toast.success('Usuário criado e e-mail de boas-vindas enviado!')
        }
        onSuccess()
        onClose()
        setFormData({ nome: '', email: '', password: '', confirmPassword: '', role: 'moderador' })
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      toast.error('Erro ao criar usuário: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserPlus size={20} />
            </div>
            <h2 className="font-black uppercase italic tracking-tighter text-lg">Novo Usuário</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Nome Completo</label>
            <div className="relative">
              <input 
                required
                className="input h-12 pl-10 rounded-xl text-sm"
                placeholder="Ex: João da Silva"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">E-mail Corporativo</label>
            <div className="relative">
              <input 
                required
                type="email"
                className="input h-12 pl-10 rounded-xl text-sm"
                placeholder="joao@denuncia.ms.gov.br"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Senha Inicial</label>
              <div className="relative">
                <input 
                  required
                  type="password"
                  className="input h-12 pl-10 rounded-xl text-sm"
                  placeholder="******"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Confirmar</label>
              <div className="relative">
                <input 
                  required
                  type="password"
                  className="input h-12 pl-10 rounded-xl text-sm"
                  placeholder="******"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Nível de Acesso</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['admin', 'moderador', 'comunicador'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({...formData, role: r})}
                  className={`py-3 rounded-xl border-2 text-[9px] font-black uppercase tracking-tight transition-all ${
                    formData.role === r 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-white border-border text-muted hover:border-primary/30'
                  }`}
                >
                  {r === 'admin' ? 'Administrador Master' : 
                   r === 'moderador' ? 'Analista de Ouvidoria' : 
                   r === 'comunicador' ? 'Gestor de Comunicação' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-dark hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Criando Conta...' : 'Criar e Notificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
