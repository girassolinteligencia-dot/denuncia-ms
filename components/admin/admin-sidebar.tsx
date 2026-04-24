'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Tags, 
  Share2, 
  Newspaper, 
  Image as ImageIcon, 
  Users, 
  History,
  ChevronRight,
  LogOut,
  Megaphone,
  ShieldCheck,
  ShieldAlert,
  Activity,
  RefreshCw
} from 'lucide-react'

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
]

const OPERACAO_ITEMS = [
  { label: 'Denúncias', icon: FileText, href: '/admin/denuncias' },
  { label: 'Categorias', icon: Tags, href: '/admin/categorias' },
]

const CONTEUDO_ITEMS = [
  { label: 'Comunicação', icon: Newspaper, href: '/admin/conteudo' }, // Notícias, Banners, Enquetes
]

const SISTEMA_ITEMS = [
  { label: 'Configurações', icon: Settings, href: '/admin/configuracoes' }, // Geral, Legal, Integrações, Campos
  { label: 'Usuários', icon: Users, href: '/admin/usuarios' },
]

const SEGURANCA_ITEMS = [
  { label: 'Segurança', icon: ShieldAlert, href: '/admin/seguranca' }, // Logs, Auditoria, Saúde
]

import { logout } from '@/lib/actions/auth'
import { getMe } from '@/lib/actions/admin-usuarios'
import type { Profile } from '@/types'

export const AdminSidebar: React.FC<{ isOpen?: boolean, onClose?: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [userProfile, setUserProfile] = React.useState<Profile | null>(null)

  React.useEffect(() => {
    getMe().then(res => {
      if (res.success && res.data) {
        setUserProfile(res.data)
      }
    })
  }, [])

  const isAdmin = userProfile?.role === 'admin'

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
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent shadow-glow-cyan border border-white/20 backdrop-blur-md">
                <Megaphone size={24} className="fill-accent" />
              </div>
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
          {/* Dashboard */}
          <div>
            <ul className="space-y-1">
              {MENU_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                      isActive(item.href)
                        ? 'bg-secondary text-white shadow-glow-green border-r-4 border-accent'
                        : 'hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={isActive(item.href) ? 'text-accent' : 'text-white/40 group-hover:text-electric'} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operação */}
          <div>
            <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Operação</p>
            <ul className="space-y-1">
              {OPERACAO_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                      isActive(item.href)
                        ? 'bg-white/10 text-white'
                        : 'hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className="text-white/40 group-hover:text-electric" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunicação */}
          <div>
            <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Público</p>
            <ul className="space-y-1">
              {CONTEUDO_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                      isActive(item.href)
                        ? 'bg-white/10 text-white'
                        : 'hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className="text-white/40 group-hover:text-electric" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sistema - Apenas Admin */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Sistema</p>
              <ul className="space-y-1">
                {SISTEMA_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive(item.href)
                          ? 'bg-white/10 text-white'
                          : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} className="text-white/40 group-hover:text-electric" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Segurança - Apenas Admin */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Governança</p>
              <ul className="space-y-1">
                {SEGURANCA_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-bold transition-all group ${
                        isActive(item.href)
                          ? 'bg-white/10 text-white'
                          : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} className="text-white/40 group-hover:text-electric" />
                      {item.label}
                    </Link>
                  </li>
                ))}
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

