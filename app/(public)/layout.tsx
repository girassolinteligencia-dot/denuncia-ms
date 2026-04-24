import React from 'react'
import Link from 'next/link'
import { Search, ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createAdminClient()
  
  // Busca configurações do Módulo 0 (Cached by Next.js if enabled, or just fetch)
  const { data: configs } = await supabase.from('plataforma_config').select('chave, valor')
  const configMap = (configs || []).reduce((acc: Record<string, string>, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const appName = configMap['identidade.nome'] || 'DENUNCIA MS'
  const appLogo = configMap['identidade.logo'] || '/assets/logo.png'

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 sm:h-24 bg-white border-b border-border sticky top-0 z-50 shadow-sm transition-all">
        <div className="container-page flex items-center justify-between h-full gap-2 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src={appLogo} alt={appName} className="h-10 sm:h-16 w-auto transition-transform group-hover:scale-105" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-dark hover:text-primary transition-colors">Início</Link>
            <Link href="/como-funciona" className="text-sm font-bold text-dark hover:text-primary transition-colors">Como funciona</Link>
            <Link href="/transparencia" className="text-sm font-bold text-dark hover:text-primary transition-colors">Transparência</Link>
            <Link href="/noticias" className="text-sm font-bold text-dark hover:text-primary transition-colors">Notícias</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
             <Link href="/acompanhar" className="btn-outline px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs gap-1 sm:gap-2 shrink-0">
                <Search size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Acompanhar</span>
             </Link>
             <Link href="/denunciar" className="btn-primary px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs gap-1 sm:gap-2 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green shrink-0">
                <ShieldCheck size={14} className="sm:w-4 sm:h-4" />
                <span>Denunciar</span>
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-surface">
        {children}
      </main>

      <footer className="bg-dark text-white py-16 border-t border-white/5">
         <div className="container-page">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/5 pb-12">
               {/* Coluna 1: Sobre */}
               <div className="space-y-6">
                  <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">A Plataforma</h3>
                  <p className="text-[11px] text-white/40 leading-relaxed text-justify font-medium">
                     O <strong>{appName}</strong> opera como uma plataforma cívica estritamente independente, sem vínculo com entes públicos ou políticos. Atuamos como um elo tecnológico que conecta o cidadão de MS diretamente aos órgãos competentes.
                  </p>
               </div>
               
               {/* Coluna 2: Navegação */}
               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Navegação</h3>
                  <ul className="space-y-3 text-[11px] text-white/50 font-medium">
                     <li><Link href="/" className="hover:text-electric transition-colors">Início</Link></li>
                     <li><Link href="/como-funciona" className="hover:text-electric transition-colors">Como funciona</Link></li>
                     <li><Link href="/noticias" className="hover:text-electric transition-colors">Notícias</Link></li>
                     <li><Link href="/transparencia" className="hover:text-electric transition-colors">Transparência</Link></li>
                  </ul>
               </div>

               {/* Coluna 3: Suporte & Legal */}
               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Suporte & Legal</h3>
                  <ul className="space-y-3 text-[11px] text-white/50 font-medium">
                     <li><Link href="/faq" className="hover:text-electric transition-colors">Dúvidas Frequentes</Link></li>
                     <li><Link href="/privacidade" className="hover:text-electric transition-colors">Privacidade</Link></li>
                     <li><Link href="/termos" className="hover:text-electric transition-colors">Termos de Uso</Link></li>
                     <li><Link href="/login" className="hover:text-electric transition-colors">Acesso Restrito</Link></li>
                  </ul>
               </div>

               {/* Coluna 4: Contato */}
               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Contato</h3>
                  <ul className="space-y-4 text-[11px] text-white/50 font-medium">
                     <li className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/20 uppercase font-black">E-mail oficial</span>
                        <span className="hover:text-white transition-colors cursor-pointer">contato@denunciams.com.br</span>
                     </li>
                     <li className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/20 uppercase font-black">Abrangência</span>
                        <span>Mato Grosso do Sul, Brasil</span>
                     </li>
                  </ul>
               </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  © {new Date().getFullYear()} {appName} — Governança e Inteligência Cívica
               </p>
               <div className="flex gap-4">
                  <div className="h-2 w-12 bg-primary rounded-full"></div>
                  <div className="h-2 w-12 bg-secondary rounded-full"></div>
                  <div className="h-2 w-12 bg-electric rounded-full"></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}
