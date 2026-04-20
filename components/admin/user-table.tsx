'use client'

import React, { useState } from 'react'
import { 
  Users, 
  Shield, 
  Key, 
  Trash2, 
  RefreshCw,
  Edit,
  X,
  ShieldCheck,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, UserRole } from '@/types'
import { updateUsuarioRole, deleteUsuario } from '@/lib/actions/admin-usuarios'

export const UserTable: React.FC<{ initialUsers: Profile[] }> = ({ initialUsers }) => {
  const [usuarios, setUsuarios] = useState<Profile[]>(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  
  const handleUpdateRole = async (id: string, currentRole: UserRole) => {
    const roles: UserRole[] = ['superadmin', 'admin', 'moderador']
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length]
    
    if (!confirm(`Deseja alterar o nível de acesso para ${nextRole}?`)) return
    
    setLoading(id)
    const result = await updateUsuarioRole(id, nextRole)
    
    if (result.success) {
      toast.success('Permissão atualizada!')
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u))
    } else {
      toast.error('Erro: ' + result.error)
    }
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este acesso? O usuário não poderá mais entrar no painel.')) return
    
    setLoading(id)
    const result = await deleteUsuario(id)
    
    if (result.success) {
      toast.success('Usuário removido')
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } else {
      toast.error('Erro: ' + result.error)
    }
    setLoading(null)
  }

  return (
    <div className="bg-white rounded- card shadow-card-lg border border-border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface text-[10px] font-black text-muted uppercase tracking-[0.2em] border-b border-border">
            <th className="px-6 py-5">Usuário</th>
            <th className="px-6 py-5">Nível de Acesso</th>
            <th className="px-6 py-5">Criado em</th>
            <th className="px-6 py-5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {usuarios.map(user => (
            <tr key={user.id} className="hover:bg-surface/50 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-black text-sm">
                    {user.nome?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">{user.nome || 'Sem Nome'}</p>
                    <p className="text-[11px] text-muted font-medium">{user.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                 <button 
                  onClick={() => handleUpdateRole(user.id, user.role)}
                  disabled={loading === user.id}
                  className="flex items-center gap-2 hover:bg-surface p-2 rounded-lg transition-all"
                 >
                    <Shield size={14} className={user.role === 'superadmin' ? 'text-secondary' : 'text-primary'} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'superadmin' ? 'text-secondary' : 'text-dark'}`}>
                       {user.role}
                    </span>
                 </button>
              </td>
              <td className="px-6 py-5">
                 <div className="flex items-center gap-2 text-xs text-muted">
                    <RefreshCw size={12} />
                    {new Date(user.criado_em).toLocaleDateString()}
                 </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    disabled={loading === user.id}
                    className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-all" 
                    title="Excluir"
                  >
                    {loading === user.id ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-muted font-medium italic">
                Nenhum moderador encontrado no banco de dados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
