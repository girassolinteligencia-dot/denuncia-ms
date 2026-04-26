export const dynamic = 'force-dynamic'
import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { 
  ShieldCheck, 
  Search, 
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Radio,
  Zap
} from 'lucide-react'
import { FeedbackNewsletter } from '@/components/public/feedback-newsletter'
import { EnqueteDinamica } from '@/components/public/enquete-dinamica'
import { BannerSlider } from '@/components/public/banner-slider'
import { getEnqueteAtiva } from '@/lib/actions/enquetes'

export default async function PublicHomePage() {
  const supabase = createAdminClient()
  
  // Busca configurações do Módulo 0
  const { data: configs } = await supabase.from('plataforma_config').select('chave, valor')
  const configMap = (configs || []).reduce((acc: Record<string, string>, cur) => {
    acc[cur.chave] = cur.valor
    return acc
  }, {})

  const tickerText = configMap['identidade.ticker'] || ''

  // Busca Dados das Seções
  const [catRes, banRes, enqueteLanding] = await Promise.all([
    supabase.from('categorias').select('*').eq('ativo', true).order('ordem', { ascending: true }),
    supabase.from('banners').select('*').eq('ativo', true).order('ordem', { ascending: true }),
    getEnqueteAtiva('landing')
  ])

  const categorias = catRes.data || []
  const banners = banRes.data || []

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section (IDENTIDADE) */}
      <section className="bg-[#021691] border-b border-white/5 pt-10 sm:pt-12 lg:pt-16 overflow-hidden relative">
        {tickerText && (
          <div className="absolute top-0 w-full bg-secondary/90 backdrop-blur-sm z-50 h-8 flex items-center overflow-hidden">
            <div className="whitespace-nowrap animate-marquee flex items-center gap-10 text-[10px] font-black text-dark uppercase tracking-widest">
              <span>{tickerText}</span>
              <span>{tickerText}</span>
              <span>{tickerText}</span>
              <span>{tickerText}</span>
            </div>
          </div>
        )}

        <div className="container-page relative z-10 pb-10 sm:pb-16">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            
            {/* MASCOTE HERO CENTRALIZADO */}
            <div className="flex flex-col items-center justify-center space-y-12 sm:space-y-16 animate-fade-in relative">
              <div className="relative group">
                {/* Glow expandido para o novo tamanho */}
                <div className="absolute -inset-20 bg-primary/20 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <img 
                  src="/assets/mascote_sem_fundo.png" 
                  alt="Mascote Bruno Ortiz" 
                  className="w-72 h-72 sm:w-[480px] sm:h-[480px] lg:w-[630px] lg:h-[630px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 justify-center">
                <span className="text-white font-black text-xl sm:text-3xl tracking-tight uppercase italic text-center leading-tight">
                  Eu sou Bruno Ortiz.<br /> Fiscalização Cidadã na palma da sua mão.
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] italic uppercase mx-auto">
                DENUNCIA MS<br />
                <span className="text-secondary">Sua voz tem peso aqui.</span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
                Identificou algo irregular? Registre agora em poucos cliques. O resto é com a nossa tecnologia: levamos seu protocolo direto a quem decide, com sigilo e seriedade.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
              <Link
                href="/denunciar"
                className="btn-primary w-full sm:w-auto gap-4 text-xl py-8 px-10 bg-secondary hover:bg-secondary-600 border-none text-dark shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-[0_0_60px_rgba(255,215,0,0.5)] group h-[70px] uppercase font-black italic transition-all duration-300 animate-pulse-slow"
              >
                <Zap size={24} className="fill-current" />
                DENUNCIAR AGORA
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <Link 
                href="/acompanhar" 
                className="btn-primary w-full sm:w-auto gap-3 bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white h-[70px] px-8 text-sm uppercase font-black italic tracking-widest backdrop-blur-sm transition-all"
              >
                <Search size={20} className="text-secondary" />
                Consultar Protocolo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid de Categorias (AÇÃO IMEDIATA - O QUÊ?) */}
      <section className="section bg-surface pt-16 sm:pt-24">
        <div className="container-page space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-dark tracking-tight italic uppercase">O que você deseja reportar?</h2>
            <p className="text-muted max-w-xl mx-auto text-sm font-medium">
              Selecione uma categoria abaixo para iniciar o registro. Sem senha, sem cadastro, em poucos minutos.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {categorias?.map((cat) => (
              <Link
                key={cat.id}
                href={`/denunciar?categoria=${cat.slug}`}
                className="bg-white rounded-2xl p-4 sm:p-8 border border-border/60 shadow-sm hover:shadow-glow-cyan hover:border-primary/30 transition-all group flex flex-col items-center justify-center gap-2 sm:gap-4 aspect-square sm:aspect-auto"
              >
                <div className="text-primary/80 group-hover:scale-110 transition-transform duration-300 transform-gpu">
                  <LucideIcon name={cat.icon_name} size={48} strokeWidth={1.5} className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-dark text-[11px] sm:text-lg leading-tight uppercase tracking-tighter sm:tracking-tight px-0.5">
                    {cat.label}
                  </h3>
                  <p className="text-[8px] sm:text-[10px] text-muted font-bold uppercase mt-1">Reportar</p>
                </div>
                <div className="hidden sm:flex mt-2 p-2 rounded-full bg-surface text-muted group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Como funciona (PROCESSO - COMO?) */}
      <section className="section bg-surface pb-16 sm:pb-24">
        <div className="container-page grid grid-cols-1 lg:grid-cols-3 gap-12">
          <StepCard
            num="01"
            title="Relate o ocorrido"
            desc="Preencha o formulário em poucos minutos. Sem senha, sem cadastro. Anexe fotos, áudios ou documentos como prova."
            icon={Zap}
            color="text-primary"
          />
          <StepCard
            num="02"
            title="Receba seu protocolo"
            desc="Ao concluir, você recebe um número único de protocolo e uma chave de acesso que comprovam a oficialização do seu relato."
            icon={ShieldCheck}
            color="text-secondary"
          />
          <StepCard
            num="03"
            title="A DenunciaMS faz a ponte"
            desc="Seus dados vão direto para a mesa do órgão competente. Você fez sua parte — agora é com eles responderem."
            icon={Search}
            color="text-electric"
          />
        </div>
      </section>

      {/* 4. ÁREA DE DESTAQUE (BANNERS - NOVIDADES) */}
      {banners && banners.some(b => b.posicao === 'topo') && (
        <section className="bg-surface py-12 border-t border-border/40">
           <div className="container-page">
              <BannerSlider banners={banners} posicao="topo" />
           </div>
        </section>
      )}

      {/* 5. Proposta de Valor (CONFIANÇA - POR QUÊ?) */}
      <section className="section bg-dark text-white">
        <div className="container-page space-y-12">
          <div className="max-w-3xl text-center md:text-left mx-auto md:ml-0">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter italic uppercase">
              Tecnologia e Cidadania em <span className="text-secondary">Sintonia</span>
            </h2>
            <p className="mt-4 text-white/60 text-lg sm:text-xl font-medium leading-relaxed italic">
              A DENUNCIA MS não é apenas um formulário. É uma central de inteligência que conecta o cidadão diretamente aos órgãos de fiscalização, garantindo transparência e agilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3 hover:bg-white/10 transition-all">
              <div className="p-2.5 bg-secondary/20 text-secondary rounded-xl w-fit">
                <Fingerprint size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Sem Cadastro ou Senha</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-medium">
                Nada de perder tempo criando login. Você preenche o que aconteceu e a informação atravessa direto para o órgão responsável.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3 hover:bg-white/10 transition-all">
              <div className="p-2.5 bg-secondary/20 text-secondary rounded-xl w-fit">
                <Radio size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Ponte de Ligação Direta</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-medium">
                A plataforma funciona como um túnel direto. Suas fotos e documentos vão direto para o e-mail do órgão de controle, com segurança total.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3 hover:bg-white/10 transition-all">
              <div className="p-2.5 bg-secondary/20 text-secondary rounded-xl w-fit">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Dentro da Lei</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-medium">
                Seguimos a LGPD e a Lei de Acesso à Informação. Guardamos apenas o registro oficial da denuncia. Seus dados pessoais são criptografados e protegidos.
              </p>
            </div>
          </div>

          {/* CTA Cidadão Fiscal */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-secondary">O Cidadão é o Fiscal</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Ao usar nossa plataforma, você garante que sua reclamação saia da rede social e vire um processo real,
              cobrando uma resposta direta da gestão pública.
            </p>
            <Link
              href="/denunciar"
              className="inline-flex items-center gap-3 bg-secondary text-dark font-black uppercase text-sm py-4 px-8 rounded-2xl hover:bg-secondary/90 transition-all shadow-glow-green"
            >
              Fazer minha denuncia agora
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Engajamento (COMUNIDADE) */}
      {enqueteLanding && (
        <section className="section bg-surface">
          <div className="container-page">
            <EnqueteDinamica initialData={enqueteLanding} />
          </div>
        </section>
      )}

      <FeedbackNewsletter 
        ativa={configMap['funcionalidade.pesquisa_satisfacao_ativa'] === 'true'} 
        showNewsletter={false}
      />
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
