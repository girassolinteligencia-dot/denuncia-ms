import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Search, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  ArrowUpRight
} from 'lucide-react'

export default async function PublicHomePage() {
  const supabase = createAdminClient()
  
  // Busca categorias ativas
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  return (
    <div className="flex flex-col">
      
      {/* Hero Section - Restauração Blue Deep */}
      <section className="relative bg-[#021691] overflow-hidden min-h-[500px] sm:min-h-[700px] flex items-center border-b border-white/5 transition-all">
        {/* Efeitos de Fundo Modernos */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 z-0 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 z-0"></div>
        
        {/* Mascote como Fundo (Lado Direito) */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:flex items-end justify-end pointer-events-none z-10">
           <img 
             src="/assets/mascote.png" 
             alt="Cidadão Denúncia MS" 
             className="h-[105%] w-auto object-contain object-bottom animate-fade-in opacity-90 brightness-110"
           />
        </div>

        <div className="container-page relative z-20 py-12 sm:py-20">
          <div className="max-w-2xl text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] animate-fade-in mx-auto lg:mx-0">
               <Zap size={14} className="text-secondary fill-secondary" />
               Canal Independente de Ouvidoria — Mato Grosso do Sul
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] animate-slide-up italic">
              Sua voz tem poder. <br />
              Sua denúncia tem <span className="text-secondary">impacto.</span>
            </h1>

            <p className="text-base sm:text-xl text-white/70 max-w-xl lg:mx-0 mx-auto leading-relaxed animate-fade-in font-medium">
              A plataforma <span className="text-white font-black">DENUNCIA MS</span> permite que qualquer cidadão registre irregularidades de forma 100% anônima e segura.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Link 
                  href="/denunciar" 
                  className="btn-primary w-full sm:w-auto gap-3 text-sm sm:text-lg py-4 sm:py-5 bg-secondary hover:bg-secondary-600 border-none text-dark shadow-glow-green group"
                >
                   INICIAR DENÚNCIA
                   <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
               <Link href="/acompanhar" className="btn-outline w-full sm:w-auto gap-3 text-white border-white/20 hover:bg-white/10 bg-white/5 backdrop-blur-sm">
                  Consultar Protocolo
               </Link>
            </div>

            <div className="flex items-center lg:justify-start justify-center gap-8 pt-8 text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.3em]">
               <div className="flex items-center gap-2">
                  <Lock size={14} className="text-secondary" />
                  Anonimato Garantido
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
               <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-secondary" />
                  Segurança de Dados
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Categorias */}
      <section className="section bg-surface">
        <div className="container-page space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-black text-dark tracking-tight italic">O que você deseja reportar?</h2>
             <p className="text-muted max-w-xl mx-auto text-sm">Selecione uma categoria abaixo para iniciar o registro. Todas as informações são tratadas com sigilio absoluto.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
             {categorias?.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/denunciar?categoria=${cat.slug}`}
                  className="bg-white rounded-2xl p-3 sm:p-8 border border-border shadow-card hover:shadow-glow-cyan hover:border-primary/30 transition-all group relative overflow-hidden text-center flex flex-col items-center gap-2 sm:gap-4"
                >
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="text-3xl sm:text-5xl group-hover:scale-110 transition-transform duration-300 transform-gpu text-dark">
                      {cat.emoji || '📂'}
                   </div>
                   <div>
                      <h3 className="font-black text-dark text-[9px] sm:text-lg leading-tight uppercase tracking-tight">{cat.label}</h3>
                      <p className="hidden sm:block text-[10px] text-muted font-bold uppercase mt-1">Reportar ocorrência</p>
                   </div>
                   <div className="mt-1 sm:mt-2 p-1.5 sm:p-2 rounded-full bg-surface text-muted group-hover:bg-primary group-hover:text-white transition-all scale-75 sm:scale-100">
                      <ArrowUpRight size={18} />
                   </div>
                </Link>
             ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="section bg-surface border-y border-border">
         <div className="container-page grid grid-cols-1 lg:grid-cols-3 gap-12">
            <StepCard 
              num="01" 
              title="Relate o ocorrido" 
              desc="Preencha o formulário com detalhes, fotos e vídeos sobre a irregularidade encontrada." 
              icon={Zap}
              color="text-primary"
            />
            <StepCard 
              num="02" 
              title="Gere seu protocolo" 
              desc="Ao concluir, você recebe um código único para acompanhar o status da sua denúncia." 
              icon={ShieldCheck}
              color="text-secondary"
            />
            <StepCard 
              num="03" 
              title="Acompanhe a ação" 
              desc="Nossa equipe encaminha os dados aos órgãos competentes e informa você sobre as ações tomadas." 
              icon={Search}
              color="text-electric"
            />
         </div>
      </section>

    </div>
  )
}

function StepCard({ num, title, desc, icon: Icon, color }: { num: string, title: string, desc: string, icon: React.ElementType, color: string }) {
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <span className="text-5xl font-black text-dark/10 tracking-tighter italic">{num}</span>
          <div className={`p-3 rounded-2xl bg-white shadow-sm border border-border/50 ${color}`}>
             <Icon size={24} />
          </div>
       </div>
       <h3 className="text-xl font-bold text-dark">{title}</h3>
       <p className="text-sm text-muted leading-relaxed font-medium">{desc}</p>
    </div>
  )
}
