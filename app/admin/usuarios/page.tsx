import { getMe, getUsuarios } from '@/lib/actions/admin-usuarios'
import { UserTable } from '@/components/admin/user-table'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const me = await getMe()
  
  // Tranca de Segurança: Apenas Admin Master
  if (!me.success || (me.data?.role !== 'admin' && me.data?.role !== 'superadmin')) {
    return redirect('/admin/dashboard')
  }

  const result = await getUsuarios()
  const usuarios = (result.success && result.data) ? result.data : []

  return (
    <div className="space-y-8 animate-fade-in px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Controle de Acesso</h1>
          <p className="text-muted text-sm font-medium">Gerencie quem pode acessar e moderar as denúncias da plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
             Total: {usuarios.length} Usuários
          </p>
        </div>
      </div>

      {/* Tabela de Usuários Reais */}
      <UserTable initialUsers={usuarios || []} />

      {/* Info Contextual */}
      <div className="bg-dark rounded-3xl p-8 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10">
            <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">Segurança da Ouvidoria</h3>
            <p className="text-white/60 text-xs leading-relaxed max-w-2xl font-medium">
               Apenas usuários com perfil configurado nesta tabela podem acessar o painel administrativo. 
               As permissões de **Admin** permitem alterar configurações globais, enquanto **Moderador** foca na triagem de denúncias.
               Qualquer alteração gera um log de auditoria irreversível.
            </p>
         </div>
      </div>
    </div>
  )
}
