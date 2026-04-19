import React from 'react'
import Link from 'next/link'
import { Megaphone, Search, ShieldCheck } from 'lucide-react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-20 bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container-page flex items-center justify-between h-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-accent shadow-glow-cyan transition-transform group-hover:scale-110">
              <Megaphone size={24} className="fill-accent" />
            </div>
            <div>
              <h1 className="font-black text-dark text-lg leading-none tracking-tighter">DENUNCIA MS</h1>
              <p className="text-[9px] text-secondary font-black uppercase tracking-[0.2em] mt-1">Mato Grosso do Sul</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-dark hover:text-primary transition-colors">Início</Link>
            <Link href="/sobre" className="text-sm font-bold text-dark hover:text-primary transition-colors">Como funciona</Link>
            <Link href="/noticias" className="text-sm font-bold text-dark hover:text-primary transition-colors">Notícias</Link>
          </nav>

          <div className="flex items-center gap-4">
             <Link href="/acompanhar" className="btn-outline btn-sm gap-2">
                <Search size={16} />
                Acompanhar Protocolo
             </Link>
             <Link href="/denunciar" className="btn-primary btn-sm gap-2 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green">
                <ShieldCheck size={16} />
                Fazer Denúncia
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
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent shadow-glow-cyan border border-white/10">
                      <Megaphone size={24} className="fill-accent" />
                    </div>
                    <div>
                      <h2 className="font-black text-white text-lg leading-none tracking-tighter">DENUNCIA MS</h2>
                      <p className="text-[9px] text-electric font-black uppercase tracking-[0.2em] mt-1">Plataforma Cívica</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 max-w-md leading-relaxed">
                     O DENUNCIA MS é uma plataforma independente que garante o anonimato e a segurança do cidadão ao reportar irregularidades. Nosso compromisso é com a transparência e a justiça em Mato Grosso do Sul.
                  </p>
               </div>
               
               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Links Rápidos</h3>
                  <ul className="space-y-4 text-sm text-white/50">
                     <li><Link href="/privacidade" className="hover:text-electric transition-colors">Política de Privacidade</Link></li>
                     <li><Link href="/termos" className="hover:text-electric transition-colors">Termos de Uso</Link></li>
                     <li><Link href="/faq" className="hover:text-electric transition-colors">Dúvidas Frequentes</Link></li>
                     <li><Link href="/login" className="hover:text-electric transition-colors">Acesso Administrativo</Link></li>
                  </ul>
               </div>

               <div>
                  <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Contato Institucional</h3>
                  <ul className="space-y-4 text-sm text-white/50">
                     <li>contato@denunciams.com.br</li>
                     <li>Mato Grosso do Sul, Brasil</li>
                  </ul>
               </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  © 2026 DENUNCIA MS — Governança e Inteligência Cívica
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
