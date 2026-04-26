export const dynamic = 'force-dynamic'
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
  
  // Busca configurações de identidade
  const { data: platformConfigs } = await supabase.from('plataforma_config').select('chave, valor')
  const platformMap = (platformConfigs || []).reduce((acc: Record<string, string>, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  // Busca configurações de sistema (Kill Switches)
  const { data: systemConfigs } = await supabase.from('sistema_config').select('chave, valor')
  const systemMap = (systemConfigs || []).reduce((acc: Record<string, string>, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const appName = platformMap['identidade.nome'] || 'DENUNCIA MS'
  const appLogo = platformMap['identidade.logo'] || '/assets/logo.png'
  const isMaintenance = systemMap['manutencao_global'] === 'true'

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-64 h-64 mb-12">
           <div className="absolute inset-0 bg-orange-100 rounded-full scale-90 animate-pulse"></div>
           <div className="relative z-10 w-full h-full flex items-center justify-center text-orange-500">
              <ShieldCheck size={120} className="opacity-20 animate-bounce" />
           </div>
        </div>
        <div className="space-y-6 max-w-xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-200 rounded-full text-orange-600 text-[10px] font-black uppercase tracking-[0.3em]">
              🚧 Modo de Manutenção Ativo
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-dark tracking-tighter uppercase italic leading-none">
             Estamos ficando <br />
             <span className="text-orange-500 italic">Ainda Melhores!</span>
           </h1>
           <p className="text-muted text-lg font-medium leading-relaxed">
             O <strong>{appName}</strong> está passando por uma atualização técnica programada para garantir mais segurança e novas funcionalidades para você.
           </p>
           <div className="pt-8 flex flex-col items-center gap-4">
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Previsão de retorno</p>
              <div className="flex gap-2">
                 <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center font-black text-dark border border-border">--</div>
                 <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center font-black text-dark border border-border">--</div>
              </div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 sm:h-24 bg-white border-b border-border sticky top-0 z-50 shadow-sm transition-all">
        <div className="container-page flex items-center justify-between h-full gap-2 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src={appLogo} alt={appName} className="h-10 sm:h-16 w-auto transition-transform group-hover:scale-105" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-black text-dark hover:text-primary transition-colors uppercase tracking-tighter italic">Início</Link>
            <Link href="/como-funciona" className="text-sm font-black text-dark hover:text-primary transition-colors uppercase tracking-tighter italic">Como funciona</Link>
            <Link href="/transparencia" className="text-sm font-black text-dark hover:text-primary transition-colors uppercase tracking-tighter italic">Transparência</Link>
            <Link href="/noticias" className="text-sm font-black text-dark hover:text-primary transition-colors uppercase tracking-tighter italic">Notícias</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
             <Link href="/acompanhar" className="btn-outline px-2 sm:px-3 py-1.5 text-[10px] sm:text-sm gap-1 sm:gap-2 shrink-0">
                <Search size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Acompanhar</span>
             </Link>
             <Link href="/denunciar" className="btn-primary px-2 sm:px-3 py-1.5 text-[10px] sm:text-sm gap-1 sm:gap-2 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green shrink-0">
                <ShieldCheck size={14} className="sm:w-4 sm:h-4" />
                <span>Denunciar</span>
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-surface">
        {children}
      </main>

      <footer className="bg-white text-dark py-4 sm:py-6 border-t border-border">
         <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 border-b border-border pb-8 sm:pb-10 text-center md:text-left">
               {/* Coluna 1: Sobre */}
               <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-black text-primary uppercase tracking-tighter italic text-[13px]">A Plataforma</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium mx-auto md:mx-0 max-w-sm md:max-w-none">
                     O <strong>{appName}</strong> opera como uma plataforma cívica estritamente independente, sem vínculo com entes públicos ou políticos. Atuamos como um elo tecnológico que conecta o cidadão de MS diretamente aos órgãos competentes.
                  </p>
               </div>
               
               {/* Coluna 2: Navegação */}
               <div>
                  <h3 className="font-black text-primary mb-3 sm:mb-4 uppercase tracking-tighter italic text-[13px]">Navegação</h3>
                  <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                     <li><Link href="/" className="hover:text-primary transition-colors">Início</Link></li>
                     <li><Link href="/como-funciona" className="hover:text-primary transition-colors">Como funciona</Link></li>
                     <li><Link href="/noticias" className="hover:text-primary transition-colors">Notícias</Link></li>
                     <li><Link href="/transparencia" className="hover:text-primary transition-colors">Transparência</Link></li>
                  </ul>
               </div>

               {/* Coluna 3: Suporte & Legal */}
               <div>
                  <h3 className="font-black text-primary mb-3 sm:mb-4 uppercase tracking-tighter italic text-[13px]">Suporte & Legal</h3>
                  <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                      <li><Link href="/faq" className="hover:text-primary transition-colors">Dúvidas Frequentes</Link></li>
                      <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
                      <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                      <li><Link href="/identificacao-legal" className="hover:text-primary transition-colors">Identificação Legal</Link></li>
                      <li><Link href="/login" className="hover:text-primary transition-colors">Acesso Restrito</Link></li>
                  </ul>
               </div>

               {/* Coluna 4: Contato */}
               <div>
                  <h3 className="font-black text-primary mb-3 sm:mb-4 uppercase tracking-tighter italic text-[13px]">Contato</h3>
                  <ul className="space-y-2 sm:space-y-3 text-xs text-muted-foreground font-medium">
                     <li className="flex flex-col gap-1">
                        <span className="text-[9px] text-muted uppercase font-black">E-mail oficial</span>
                        <span className="hover:text-primary transition-colors cursor-pointer font-bold">denunciams.ouvidoria@gmail.com</span>
                     </li>
                     <li className="flex flex-col gap-1">
                        <span className="text-[9px] text-muted uppercase font-black">Abrangência</span>
                        <span className="font-bold">Mato Grosso do Sul, Brasil</span>
                     </li>
                  </ul>
               </div>
            </div>

            <div className="pt-4 sm:pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
               <p className="text-[9px] sm:text-[10px] text-muted uppercase tracking-widest font-bold max-w-[280px] md:max-w-none mx-auto md:mx-0">
                  ® {new Date().getFullYear()} {appName} — Governança e Inteligência Cívica | Produzido por Girassol Inteligência ®
               </p>
               <div className="flex gap-4">
                  <div className="h-1.5 w-10 bg-primary rounded-full"></div>
                  <div className="h-1.5 w-10 bg-secondary rounded-full"></div>
                  <div className="h-1.5 w-10 bg-electric rounded-full"></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}
