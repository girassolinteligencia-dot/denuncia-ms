import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { 
  ShieldCheck, 
  Search, 
  ClipboardList, 
  FileCheck, 
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Radio,
  Zap
} from 'lucide-react'
import { FeedbackNewsletter } from '@/components/public/feedback-newsletter'
import { EnqueteDinamica } from '@/components/public/enquete-dinamica'
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

  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  const enqueteLanding = await getEnqueteAtiva('landing')

  return (
    <div className="flex flex-col">
      {/* Hero Section Refatorada (Centralized Layout) */}
      <section className="bg-[#021691] border-b border-white/5 pt-16 sm:pt-24 lg:pt-32 overflow-hidden relative">
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

        <div className="container-page relative z-10 pb-20 sm:pb-32">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            
            {/* MASCOTE HERO CENTRALIZADO */}
            <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in relative">
              <div className="relative group">
                {/* Glow expandido para o novo tamanho */}
                <div className="absolute -inset-20 bg-primary/20 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <img 
                  src="/assets/mascote_sem_fundo.png" 
                  alt="Mascote Bruno Ortiz" 
                  className="w-80 h-80 sm:w-[600px] sm:h-[600px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-700 relative z-10"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 justify-center">
                <span className="text-white font-black text-xl sm:text-3xl tracking-tight uppercase italic text-center leading-tight">
                  Olá, eu sou o Bruno Ortiz.<br /> Sua voz tem peso aqui.
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] italic uppercase mx-auto">
                DENUNCIA MS<br />
                <span className="text-secondary">Direto ao ponto.</span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
                Sem senhas. Sem demora. Relate o problema agora e nós levamos sua voz direto aos órgãos de controle para cobrar resultados.
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

      {/* Proposta de Valor */}
      <section className="section bg-dark text-white">
        <div className="container-page space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic uppercase">
              Rápido. Oficial. <span className="text-secondary">Seguro.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Sua fiscalização vira ação oficial. O canal direto para oficializar seu relato e cobrar resultados reais da gestão pública.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-all">
              <div className="p-3 bg-secondary/20 text-secondary rounded-2xl w-fit">
                <Fingerprint size={28} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Sem Cadastro ou Senha</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">
                Nada de perder tempo criando login. Você preenche o que aconteceu e a informação atravessa direto para o órgão responsável.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-all">
              <div className="p-3 bg-secondary/20 text-secondary rounded-2xl w-fit">
                <Radio size={28} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Ponte de Ligação Direta</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">
                A plataforma funciona como um túnel direto. Suas fotos e documentos vão direto para o e-mail do órgão de controle, com segurança total.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-all">
              <div className="p-3 bg-secondary/20 text-secondary rounded-2xl w-fit">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Dentro da Lei</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">
                Seguimos a LGPD e a Lei de Acesso à Informação. Guardamos apenas o registro oficial da denúncia. Seus dados pessoais são criptografados e protegidos.
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
              Fazer minha denúncia agora
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Categorias */}
      <section className="section bg-surface">
        <div className="container-page space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-dark tracking-tight italic">O que você deseja reportar?</h2>
            <p className="text-muted max-w-xl mx-auto text-sm">
              Selecione uma categoria abaixo para iniciar o registro. Sem senha, sem cadastro, em poucos minutos.
            </p>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {categorias?.map((cat) => (
              <Link
                key={cat.id}
                href={`/denunciar?categoria=${cat.slug}`}
                className="bg-white rounded-2xl p-2 sm:p-8 border border-border/60 shadow-sm hover:shadow-glow-cyan hover:border-primary/30 transition-all group flex flex-col items-center justify-center gap-1 sm:gap-4 aspect-square sm:aspect-auto"
              >
                <div className="text-primary/80 group-hover:scale-110 transition-transform duration-300 transform-gpu">
                  <LucideIcon name={cat.icon_name} size={48} strokeWidth={1.5} className="w-8 h-8 sm:w-12 sm:h-12" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-dark text-[7px] sm:text-lg leading-none uppercase tracking-tighter sm:tracking-tight px-0.5">
                    {cat.label}
                  </h3>
                  <p className="hidden sm:block text-[10px] text-muted font-bold uppercase mt-1">Reportar</p>
                </div>
                <div className="hidden sm:flex mt-2 p-2 rounded-full bg-surface text-muted group-hover:bg-primary group-hover:text-white transition-all">
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

      {/* Por que pedimos identificação */}
      <section className="section bg-white border-b border-border">
        <div className="container-page max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter italic uppercase">
            Identificação <span className="text-primary">Obrigatória por Lei</span>
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-2xl mx-auto">
            Pedimos seus dados apenas para validar o protocolo oficial e garantir a segurança jurídica da sua denúncia, protegendo o seu sigilo de fonte.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
            <div className="bg-surface rounded-2xl p-5 border border-border space-y-2">
              <div className="text-primary font-black text-xs uppercase tracking-widest">LGPD</div>
              <p className="text-sm text-dark font-bold">Seus dados são criptografados e protegidos por lei.</p>
            </div>
            <div className="bg-surface rounded-2xl p-5 border border-border space-y-2">
              <div className="text-primary font-black text-xs uppercase tracking-widest">LAI — Art. 31</div>
              <p className="text-sm text-dark font-bold">Sua identidade é ocultada no relato enviado ao órgão.</p>
            </div>
            <div className="bg-surface rounded-2xl p-5 border border-border space-y-2">
              <div className="text-primary font-black text-xs uppercase tracking-widest">Código Penal</div>
              <p className="text-sm text-dark font-bold">Denúncias falsas são crimes. A identificação protege você e o sistema.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Engajamento: Enquete & Newsletter */}
      {enqueteLanding && (
        <section className="section bg-surface">
          <div className="container-page">
            <EnqueteDinamica initialData={enqueteLanding} />
          </div>
        </section>
      )}

      <FeedbackNewsletter ativa={configMap['funcionalidade.pesquisa_satisfacao_ativa'] === 'true'} />

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
