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
  const configMap = (configs || []).reduce((acc: any, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const appName = configMap['identidade.nome'] || 'DENUNCIA MS'
  const appLogo = configMap['identidade.logo'] || '/assets/logo.png'

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-20 sm:h-32 bg-white border-b border-border sticky top-0 z-50 shadow-sm transition-all">
        <div className="container-page flex items-center justify-between h-full gap-2 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src={appLogo} alt={appName} className="h-12 sm:h-24 w-auto transition-transform group-hover:scale-105" />
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

      <footer className="bg-dark text-white py-12">
         <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-12">
               <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-4 rounded-[2rem] shadow-xl">
                      <img src={appLogo} alt={appName} className="h-28 w-auto" />
                    </div>
                  </div>
                  <p className="text-sm text-white/60 max-w-md leading-relaxed text-justify">
                     O <strong>{appName}</strong> opera como uma plataforma cívica estritamente independente, sem vínculo com entes públicos ou políticos. Atuamos como um elo tecnológico que conecta o cidadão de MS diretamente aos órgãos competentes, facilitando a fiscalização e a transparência em todo o Estado.
                  </p>
               </div>
               
               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Links Rápidos</h3>
                  <ul className="space-y-4 text-sm text-white/50">
                     <li><Link href="/transparencia" className="hover:text-electric transition-colors">Transparência Pública</Link></li>
                     <li><Link href="/privacidade" className="hover:text-electric transition-colors">Política de Privacidade</Link></li>
                     <li><Link href="/termos" className="hover:text-electric transition-colors">Termos de Uso</Link></li>
                     <li><Link href="/faq" className="hover:text-electric transition-colors">Dúvidas Frequentes</Link></li>
                     <li><Link href="/login" className="hover:text-electric transition-colors">Acesso Administrativo</Link></li>
                  </ul>
               </div>

               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Informações</h3>
                  <ul className="space-y-4 text-sm text-white/50">
                     <li>contato@denunciams.com.br</li>
                     <li>Mato Grosso do Sul, Brasil</li>
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
