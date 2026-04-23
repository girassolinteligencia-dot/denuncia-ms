'use client'
import React, { useState } from 'react'
import { 
  Shield, 
  Trash2, 
  RefreshCw,
  UserPlus,
  Power,
  PowerOff
} from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, UserRole } from '@/types'
import { updateUsuarioRole, deleteUsuario, toggleUsuarioStatus } from '@/lib/actions/admin-usuarios'
import { CreateUserModal } from './create-user-modal'

export const UserTable: React.FC<{ initialUsers: Profile[] }> = ({ initialUsers }) => {
  const [usuarios, setUsuarios] = useState<Profile[]>(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  
  const handleUpdateRole = async (id: string, currentRole: UserRole) => {
    const roles: UserRole[] = ['admin', 'moderador']
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    const result = await toggleUsuarioStatus(id, currentStatus)
    
    if (result.success) {
      toast.success(currentStatus ? 'Acesso suspenso' : 'Acesso reativado')
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !currentStatus } : u))
    } else {
      toast.error('Erro ao alterar status')
    }
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ATENÇÃO: Excluir permanentemente este usuário? Esta ação removerá a conta do sistema de autenticação e não pode ser desfeita.')) return
    
    setLoading(id)
    const result = await deleteUsuario(id)
    
    if (result.success) {
      toast.success('Usuário excluído definitivamente')
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } else {
      toast.error('Erro: ' + result.error)
    }
    setLoading(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={() => setModalAberto(true)}
          className="btn-primary gap-2 bg-dark hover:bg-black text-white px-6 h-12 rounded-xl"
        >
          <UserPlus size={18} />
          <span className="font-black uppercase text-[10px] tracking-widest">Novo Moderador</span>
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card-lg border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface text-[10px] font-black text-muted uppercase tracking-[0.2em] border-b border-border">
              <th className="px-6 py-5">Usuário</th>
              <th className="px-6 py-5">Nível de Acesso</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usuarios.map(user => (
              <tr key={user.id} className={`transition-colors group ${!user.ativo ? 'bg-red-50/30 opacity-70' : 'hover:bg-surface/50'}`}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${!user.ativo ? 'bg-muted/20 text-muted' : 'bg-primary/5 text-primary'}`}>
                      {user.nome?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${!user.ativo ? 'text-muted line-through' : 'text-dark'}`}>{user.nome || 'Sem Nome'}</p>
                      <p className="text-[10px] text-muted font-medium font-mono">{user.email || user.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <button 
                    onClick={() => handleUpdateRole(user.id, user.role)}
                    disabled={loading === user.id || !user.ativo}
                    className="flex items-center gap-2 hover:bg-surface p-2 rounded-lg transition-all disabled:opacity-50"
                   >
                      <Shield size={14} className={user.role === 'admin' ? 'text-secondary' : 'text-primary'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-secondary' : 'text-dark'}`}>
                         {user.role}
                      </span>
                   </button>
                </td>
                <td className="px-6 py-5">
                   <button 
                    onClick={() => handleToggleStatus(user.id, user.ativo ?? true)}
                    disabled={loading === user.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
                      user.ativo 
                      ? 'border-green-100 bg-green-50 text-green-700 hover:border-green-300' 
                      : 'border-red-100 bg-red-50 text-red-700 hover:border-red-300'
                    }`}
                   >
                      {user.ativo ? <Power size={12} /> : <PowerOff size={12} />}
                      <span className="text-[9px] font-black uppercase tracking-widest">
                         {user.ativo ? 'Ativo' : 'Suspenso'}
                      </span>
                   </button>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      disabled={loading === user.id}
                      className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                      title="Excluir Definitivamente"
                    >
                      {loading === user.id ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserModal 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)}
        onSuccess={() => {
          // O revalidatePath cuidará de atualizar a lista se usarmos router.refresh()
          window.location.reload()
        }}
      />
    </div>
  )
}
