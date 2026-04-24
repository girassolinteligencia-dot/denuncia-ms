'use client'

import React, { useState } from 'react'
import { X, UserPlus, Mail, Lock, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createUsuarioAdmin, updateUsuarioAdmin } from '@/lib/actions/admin-usuarios'
import type { UserRole, Profile } from '@/types'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userToEdit?: Profile | null
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess, userToEdit }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderador' as UserRole,
    permissoes: ['dashboard', 'denuncias', 'categorias', 'comunicacao'] as string[]
  })

  React.useEffect(() => {
    if (userToEdit) {
      setFormData({
        nome: userToEdit.nome || '',
        email: userToEdit.email || '',
        password: '',
        confirmPassword: '',
        role: userToEdit.role,
        permissoes: userToEdit.permissoes || []
      })
    } else {
      setFormData({
        nome: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'moderador',
        permissoes: ['dashboard', 'denuncias', 'categorias', 'comunicacao']
      })
    }
  }, [userToEdit, isOpen])

  const MODULOS = [
    { id: 'dashboard', label: 'Dashboard', desc: 'Visão geral e métricas' },
    { id: 'denuncias', label: 'Denuncias', desc: 'Gestão de casos e triagem' },
    { id: 'categorias', label: 'Categorias', desc: 'Configuração de tipos de denuncia' },
    { id: 'comunicacao', label: 'Comunicação', desc: 'Notícias, Banners e Enquetes' },
    { id: 'usuarios', label: 'Usuários', desc: 'Gestão de acessos (Admin Master)' },
    { id: 'configuracoes', label: 'Sistema', desc: 'Ajustes técnicos e campos' },
    { id: 'seguranca', label: 'Governança', desc: 'Logs e Auditoria' },
  ]

  const handleRoleChange = (role: UserRole) => {
    let permissoes: string[] = []
    if (role === 'admin') {
      permissoes = MODULOS.map(m => m.id)
    } else if (role === 'moderador') {
      permissoes = ['dashboard', 'denuncias', 'categorias', 'comunicacao']
    } else if (role === 'comunicador') {
      permissoes = ['dashboard', 'comunicacao']
    }
    setFormData({ ...formData, role, permissoes })
  }

  const togglePermissao = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(id)
        ? prev.permissoes.filter(p => p !== id)
        : [...prev.permissoes, id]
    }))
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (userToEdit) {
        const result = await updateUsuarioAdmin(userToEdit.id, {
          nome: formData.nome,
          role: formData.role,
          permissoes: formData.permissoes
        })
        if (result.success) {
          toast.success('Usuário atualizado com sucesso!')
          onSuccess()
          onClose()
        } else {
          throw new Error(result.error)
        }
      } else {
        // Validação de senha apenas na criação
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem.')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres.')
          setLoading(false)
          return
        }

        const result = await createUsuarioAdmin({
          nome: formData.nome,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          permissoes: formData.permissoes
        })

        if (result.success) {
          if (result.warning) {
            toast.warning(result.warning, { duration: 10000 })
          } else {
            toast.success('Usuário criado e e-mail de boas-vindas enviado!')
          }
          onSuccess()
          onClose()
        } else {
          throw new Error(result.error)
        }
      }
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserPlus size={20} />
            </div>
            <h2 className="font-black uppercase italic tracking-tighter text-lg">
              {userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
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

          {!userToEdit && (
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
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Configuração de Acesso</label>
            
            <div className="bg-surface p-4 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['admin', 'moderador', 'comunicador'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
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

              <div className="pt-2">
                <p className="text-[9px] font-bold text-muted uppercase mb-3 px-1">Privilégios Individuais (Dashboards)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MODULOS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => togglePermissao(m.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                        formData.permissoes.includes(m.id)
                        ? 'border-secondary bg-secondary/5'
                        : 'border-border bg-white opacity-60 grayscale'
                      }`}
                    >
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${formData.permissoes.includes(m.id) ? 'text-secondary' : 'text-muted'}`}>{m.label}</p>
                        <p className="text-[9px] text-muted leading-tight mt-0.5">{m.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        formData.permissoes.includes(m.id)
                        ? 'bg-secondary border-secondary text-white'
                        : 'border-border'
                      }`}>
                        {formData.permissoes.includes(m.id) && <Save size={10} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-dark hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? (userToEdit ? 'Salvando...' : 'Criando...') : (userToEdit ? 'Salvar Alterações' : 'Criar e Notificar')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
