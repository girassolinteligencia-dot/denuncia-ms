'use client'

import React, { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Key, 
  Mail, 
  Trash2, 
  ShieldCheck,
  RefreshCw,
  Edit,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  role: 'superadmin' | 'admin' | 'moderador'
  setor?: string
  ultimo_acesso: string
  ativo: boolean
}

const MOCK_USUARIOS: UsuarioAdmin[] = [
  {
    id: '1',
    nome: 'Paulo Administrativo',
    email: 'paulo.admin@ms.gov.br',
    role: 'superadmin',
    ultimo_acesso: new Date().toISOString(),
    ativo: true
  },
  {
    id: '2',
    nome: 'Maria Silva',
    email: 'maria.silva@ouvidoria.ms.gov.br',
    role: 'moderador',
    setor: 'Saúde',
    ultimo_acesso: new Date(Date.now() - 3600000).toISOString(),
    ativo: true
  }
]

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(MOCK_USUARIOS)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleToggleAtivo = (id: string) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u))
    toast.success('Status do usuário atualizado')
  }

  return (
    <div className="space-y-8 animate-fade-in px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Controle de Acesso</h1>
          <p className="text-muted text-sm font-medium">Gerencie quem pode acessar e moderar as denúncias da plataforma.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-2 h-11 bg-primary border-none shadow-glow-cyan"
        >
          <UserPlus size={18} />
          Convidar Moderador
        </button>
      </div>

      {/* Grid de Stats Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-card border border-border flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-muted uppercase tracking-widest">Total de Usuários</p>
               <p className="text-xl font-black text-dark">{usuarios.length}</p>
            </div>
         </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-card shadow-card-lg border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface text-[10px] font-black text-muted uppercase tracking-[0.2em] border-b border-border">
              <th className="px-6 py-5">Usuário</th>
              <th className="px-6 py-5">Nível de Acesso</th>
              <th className="px-6 py-5">Setor</th>
              <th className="px-6 py-5">Último Acesso</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usuarios.map(user => (
              <tr key={user.id} className="hover:bg-surface/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-black text-sm">
                      {user.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">{user.nome}</p>
                      <p className="text-[11px] text-muted font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                      <Shield size={14} className={user.role === 'superadmin' ? 'text-secondary' : 'text-primary'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'superadmin' ? 'text-secondary' : 'text-dark'}`}>
                         {user.role}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <span className="text-xs font-bold text-muted">{user.setor || 'Geral'}</span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-xs text-muted">
                      <RefreshCw size={12} />
                      {new Date(user.ultimo_acesso).toLocaleDateString()}
                   </div>
                </td>
                <td className="px-6 py-5">
                   <button 
                    onClick={() => handleToggleAtivo(user.id)}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${user.ativo ? 'bg-green-50 text-success border border-green-100' : 'bg-red-50 text-error border border-red-100'}`}
                   >
                      <div className={`w-1 h-1 rounded-full ${user.ativo ? 'bg-success' : 'bg-error'}`}></div>
                      {user.ativo ? 'Ativo' : 'Bloqueado'}
                   </button>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all" title="Resetar Senha">
                      <Key size={16} />
                    </button>
                    <button className="p-2 text-muted hover:text-primary hover:bg-primary-50 rounded-lg transition-all" title="Editar Permissões">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-muted hover:text-error hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mock de Modal de Convite */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-scale-up overflow-hidden border border-border">
              <div className="p-8 border-b border-border bg-surface relative">
                 <button 
                  onClick={() => setShowAddModal(false)} 
                  className="absolute top-6 right-6 p-1 text-muted hover:text-dark"
                  title="Fechar"
                 >
                    <X size={20} />
                 </button>
                 <h2 className="text-xl font-black text-dark tracking-tighter uppercase italic">Novo Moderador</h2>
                 <p className="text-xs text-muted font-bold mt-1 uppercase tracking-widest">Defina as credenciais de acesso</p>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="label label-required uppercase text-[10px] font-black tracking-widest">Nome Completo</label>
                    <input className="input h-11" placeholder="Ex: João Silva" />
                 </div>
                 <div>
                    <label className="label label-required uppercase text-[10px] font-black tracking-widest">E-mail Institucional</label>
                    <div className="relative">
                       <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                       <input className="input h-11 pl-10" placeholder="joao@ms.gov.br" />
                    </div>
                 </div>
                 <div>
                    <label className="label label-required uppercase text-[10px] font-black tracking-widest">Nível de Permissão</label>
                    <select className="input h-11" title="Selecionar Nível de Permissão">
                       <option>Moderador (Apenas Leitura/Status)</option>
                       <option>Admin (Configurações)</option>
                    </select>
                 </div>
                 <button className="btn-primary w-full h-12 gap-2 shadow-glow-cyan border-none">
                    <ShieldCheck size={20} />
                    Criar e Enviar Convite
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
