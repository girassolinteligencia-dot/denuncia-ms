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
      
      {/* Hero Section */}
      <section className="relative bg-dark overflow-hidden py-24 sm:py-32">
        {/* Background Gradients inspirado no logo */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-neon opacity-20"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-electric/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]"></div>

        <div className="container-page relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-electric text-xs font-black uppercase tracking-[0.2em] shadow-glow-cyan animate-fade-in">
             <Zap size={14} className="fill-electric" />
             Canal Oficial de Ouvidoria — Mato Grosso do Sul
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none animate-slide-up">
            Sua voz tem poder. <br />
            Sua denúncia tem <span className="text-secondary drop-shadow-glow-green">impacto.</span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            A plataforma <span className="text-white font-bold">DENUNCIA MS</span> permite que qualquer cidadão registre irregularidades de forma 100% anônima e segura. Transparência para quem fiscaliza, proteção para quem informa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Link href="/denunciar" className="btn-primary btn-lg w-full sm:w-auto gap-3 text-lg py-5 bg-secondary hover:bg-secondary-600 border-none shadow-glow-green group">
                INICIAR DENÚNCIA AGORA
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link href="/acompanhar" className="btn-outline btn-lg w-full sm:w-auto gap-3 text-white border-white/20 hover:bg-white/5 backdrop-blur-sm">
                Consultar Protocolo
             </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.3em]">
             <div className="flex items-center gap-2">
                <Lock size={14} className="text-secondary" />
                Anonimato Garantido
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-electric" />
                Segurança de Dados
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {categorias?.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/denunciar?categoria=${cat.slug}`}
                  className="bg-white rounded-card p-8 border border-border shadow-card hover:shadow-glow-cyan hover:border-electric/30 transition-all group relative overflow-hidden text-center flex flex-col items-center gap-4"
                >
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="text-5xl group-hover:scale-110 transition-transform duration-300 transform-gpu">
                      {cat.emoji || '📂'}
                   </div>
                   <div>
                      <h3 className="font-black text-dark text-lg leading-tight uppercase tracking-tight">{cat.label}</h3>
                      <p className="text-[10px] text-muted font-bold uppercase mt-1">Reportar ocorrência</p>
                   </div>
                   <div className="mt-2 p-2 rounded-full bg-surface text-muted group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowUpRight size={18} />
                   </div>
                </Link>
             ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="section bg-white border-y border-border">
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

function StepCard({ num, title, desc, icon: Icon, color }: any) {
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <span className="text-5xl font-black text-dark/10 tracking-tighter italic">{num}</span>
          <div className={`p-3 rounded-2xl bg-surface ${color}`}>
             <Icon size={24} />
          </div>
       </div>
       <h3 className="text-xl font-bold text-dark">{title}</h3>
       <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  )
}
