'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Tags, 
  Newspaper, 
  Users, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Activity,
  RefreshCw,
  Globe
} from 'lucide-react'

import { logout } from '@/lib/actions/auth'
import { getMe } from '@/lib/actions/admin-usuarios'
import type { Profile } from '@/types'

export const AdminSidebar: React.FC<{ isOpen?: boolean, onClose?: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isActive = (href: string) => {
    if (!pathname) return false
    try {
      if (href.includes('?')) {
        const [path, query] = href.split('?')
        const currentQuery = searchParams?.toString() || ''
        return pathname === path && currentQuery === query
      }
      return pathname === href || pathname.startsWith(`${href}/`)
    } catch {
      return false
    }
  }
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [userProfile, setUserProfile] = React.useState<Profile | null>(null)

  React.useEffect(() => {
    getMe().then(res => {
      if (res.success && res.data) {
        setUserProfile(res.data)
      }
    })
  }, [])

  const isAdminMaster = userProfile?.role === 'admin' || userProfile?.role === 'superadmin'
  const permissoes = userProfile?.permissoes || []

  const temAcesso = (modulo: string) => {
    if (isAdminMaster) return true
    return permissoes.includes(modulo)
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao sair:', error)
      // Fallback radical se a action falhar
      window.location.href = '/login'
    } finally {
      setIsLoggingOut(false)
    }
  }


  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 w-64 lg:w-68 bg-dark border-r border-white/5 h-screen flex flex-col z-[70] transition-transform duration-300 overflow-y-auto text-white/70 shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-white/5 bg-gradient-to-br from-primary to-primary-dark shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-4">
              <img 
                src="/favicon.ico" 
                alt="Logo MS" 
                className="w-10 h-10 object-contain drop-shadow-md"
              />
              <div>
                <h1 className="font-black text-white text-base leading-none tracking-tighter">DENUNCIA MS</h1>
                <p className="text-[9px] text-electric font-black uppercase tracking-[0.2em] mt-1 drop-shadow-sm">Admin Engine</p>
              </div>
            </Link>
            
            <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white">
               <ChevronRight size={24} className="rotate-180" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 scrollbar-hide">
          {/* INTELIGÊNCIA & GOVERNANÇA - Visibilidade Total */}
          <div>
            <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Inteligência & Gestão</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                    isActive('/admin/dashboard')
                      ? 'bg-secondary text-white shadow-glow-green border-r-4 border-accent'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} className={isActive('/admin/dashboard') ? 'text-accent' : 'text-white/40 group-hover:text-electric'} />
                  Painel de Impacto
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard?tab=geo"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                    isActive('/admin/dashboard?tab=geo')
                      ? 'bg-secondary text-white shadow-glow-green border-r-4 border-accent'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Globe size={18} className={isActive('/admin/dashboard?tab=geo') ? 'text-accent' : 'text-white/40 group-hover:text-electric'} />
                  Inteligência Geográfica
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard?tab=system"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                    isActive('/admin/dashboard?tab=system')
                      ? 'bg-secondary text-white shadow-glow-green border-r-4 border-accent'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ShieldCheck size={18} className={isActive('/admin/dashboard?tab=system') ? 'text-accent' : 'text-white/40 group-hover:text-electric'} />
                  Centro de Governança
                </Link>
              </li>
              <li>
                <Link
                  href="/sala-de-situacao"
                  target="_blank"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group hover:bg-white/5 hover:text-white"
                >
                  <Activity size={18} className="text-white/40 group-hover:text-electric" />
                  Sala de Situação (Pública)
                </Link>
              </li>
            </ul>
          </div>

          {/* Operação - Denuncias e Categorias */}
          {(temAcesso('denuncias') || temAcesso('categorias')) && (
            <div>
              <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Operação Operacional</p>
              <ul className="space-y-1">
                {temAcesso('denuncias') && (
                  <li>
                    <Link
                      href="/admin/denuncias"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive('/admin/denuncias') ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <FileText size={18} className="text-white/40 group-hover:text-electric" />
                      Denuncias
                    </Link>
                  </li>
                )}
                {temAcesso('categorias') && (
                  <li>
                    <Link
                      href="/admin/categorias"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive('/admin/categorias') ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Tags size={18} className="text-white/40 group-hover:text-electric" />
                      Categorias
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Conteúdo & Comunicação */}
          {temAcesso('comunicacao') && (
            <div>
              <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Comunicação</p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/conteudo"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                      isActive('/admin/conteudo') ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Newspaper size={18} className="text-white/40 group-hover:text-electric" />
                    Conteúdo & Notícias
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Sistema e Segurança */}
          {(temAcesso('usuarios') || temAcesso('configuracoes') || temAcesso('seguranca')) && (
            <div>
              <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Configurações & Segurança</p>
              <ul className="space-y-1">
                {temAcesso('configuracoes') && (
                  <li>
                    <Link
                      href="/admin/configuracoes"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive('/admin/configuracoes') ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Settings size={18} className="text-white/40 group-hover:text-electric" />
                      Configurações Gerais
                    </Link>
                  </li>
                )}
                {temAcesso('usuarios') && (
                  <li>
                    <Link
                      href="/admin/usuarios"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive('/admin/usuarios') ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Users size={18} className="text-white/40 group-hover:text-electric" />
                      Gestão de Usuários
                    </Link>
                  </li>
                )}
                {temAcesso('seguranca') && (
                  <li>
                    <Link
                      href="/admin/seguranca"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive('/admin/seguranca') ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <ShieldAlert size={18} className="text-white/40 group-hover:text-electric" />
                      Auditoria & Logs
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </nav>

      <div className="p-4 border-t border-white/5 mt-auto">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full h-11 flex items-center justify-center gap-3 px-3 rounded-btn text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
        >
          {isLoggingOut ? <RefreshCw size={16} className="animate-spin" /> : <LogOut size={16} />}
          {isLoggingOut ? 'Saindo...' : 'Encerrar Sessão'}
        </button>
      </div>
    </aside>
    </>
  )
}

