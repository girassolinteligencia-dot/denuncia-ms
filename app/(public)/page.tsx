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
  ArrowUpRight,
  Fingerprint,
  Radio
} from 'lucide-react'
import { MascoteParallax } from '@/components/public/mascote-parallax'

export default async function PublicHomePage() {
  const supabase = createAdminClient()

  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  return (
    <div className="flex flex-col">

      {/* Hero Section */}
      <section className="relative bg-[#021691] overflow-hidden min-h-[500px] sm:min-h-[700px] flex items-center border-b border-white/5 transition-all">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 z-0 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 z-0"></div>

        <MascoteParallax />

        <div className="container-page relative z-20 py-12 sm:py-20 lg:py-32">
          <div className="max-w-2xl text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] animate-fade-in mx-auto lg:mx-0">
               <Zap size={14} className="text-secondary fill-secondary" />
               Canal Independente de Ouvidoria — Mato Grosso do Sul
            </div>

            <div className="space-y-3 sm:space-y-4">
              <span className="text-[#FFD700] font-black text-xl sm:text-4xl tracking-tighter block animate-slide-up italic uppercase">
                Olá, eu sou Bruno Ortiz
              </span>
              <h1 className="text-3xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95] sm:leading-[0.9] animate-slide-up italic">
                Sem burocracia. <br />
                Direto ao <span className="text-secondary underline decoration-2 sm:decoration-4 decoration-secondary/30 underline-offset-4 sm:underline-offset-8">ponto.</span>
              </h1>
            </div>

            <p className="text-sm sm:text-xl text-white/70 max-w-xl lg:mx-0 mx-auto leading-relaxed animate-fade-in font-medium px-4 sm:px-0">
              Viu algo errado? Não precisa de senha nem de cadastro. Relate agora e a{' '}
              <span className="text-white font-black uppercase tracking-tighter">Denuncia MS</span>{' '}
              faz a ponte direta com quem resolve.{' '}
              <span className="text-secondary font-black">Sua voz vira ação!</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 pt-4">
              <Link
                href="/denunciar"
                className="btn-primary w-full sm:w-auto gap-3 text-lg py-5 bg-secondary hover:bg-secondary-600 border-none text-dark shadow-glow-green group"
              >
                DENUNCIAR AGORA
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/acompanhar" className="btn-outline w-full sm:w-auto gap-3 text-white border-white/20 hover:bg-white/10 bg-white/5 backdrop-blur-sm h-[60px] px-8">
                Consultar Protocolo
              </Link>
            </div>

            <div className="flex items-center lg:justify-start justify-center gap-8 pt-8 text-xs font-black text-white/40 uppercase tracking-[0.3em]">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-secondary" />
                Sem Senha ou Cadastro
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-secondary" />
                Dentro da Lei (LGPD)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proposta de Valor */}
      <section className="section bg-dark text-white">
        <div className="container-page space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic uppercase">
              Aqui não tem <span className="text-secondary">enrolação</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Sabe aquela denúncia que você já costumava mandar para o Bruno Ortiz pelas redes sociais?
              Agora ela tem um lugar oficial para ser resolvida, sem complicação.
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

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {categorias?.map((cat) => (
              <Link
                key={cat.id}
                href={`/denunciar?categoria=${cat.slug}`}
                className="bg-white rounded-2xl p-2 sm:p-8 border border-border/60 shadow-sm hover:shadow-glow-cyan hover:border-primary/30 transition-all group flex flex-col items-center justify-center gap-1 sm:gap-4 aspect-square sm:aspect-auto"
              >
                <div className="text-2xl sm:text-5xl group-hover:scale-110 transition-transform duration-300 transform-gpu text-dark">
                  {cat.emoji || '📂'}
                </div>
                <div>
                  <h3 className="font-black text-dark text-[8px] sm:text-lg leading-tight uppercase tracking-tighter sm:tracking-tight px-1">{cat.label}</h3>
                  <p className="hidden sm:block text-[10px] text-muted font-bold uppercase mt-1">Reportar ocorrência</p>
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
            desc="Ao concluir, você recebe um número único de protocolo e uma chave de acesso para acompanhar o status da sua denúncia."
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
            Por que pedimos <span className="text-primary">identificação?</span>
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-2xl mx-auto">
            Assim como você já se identificava ao mandar uma mensagem nas redes sociais do Bruno,
            aqui pedimos o mesmo. Isso é uma exigência dos próprios órgãos de controle para que a
            denúncia seja levada a sério e não seja descartada por falta de responsabilidade.
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
