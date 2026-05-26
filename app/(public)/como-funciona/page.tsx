import React from 'react'
import { 
  ShieldCheck, 
  FileText, 
  Camera, 
  Lock, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  Search,
  UserCheck,
  MapPin,
  ClipboardCheck
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Como Funciona | DENUNCIA MS',
  description: 'Entenda exatamente como funciona: de um clique até sua voz chegar a quem pode agir.',
}

export default function ComoFuncionaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      
      {/* Hero Section */}
      <section className="relative bg-[#021691] pt-10 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 z-0 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/2 z-0"></div>
        
        <div className="container-page relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left px-2 sm:px-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in mx-auto lg:mx-0">
               <Zap size={12} className="text-secondary fill-secondary" />
               Inteligência Cívica
            </div>
            <h1 className="text-3xl sm:text-7xl font-black text-white tracking-tighter leading-[1] sm:leading-[0.9] italic">
               Sua Denuncia num <span className="text-secondary">Caminho Seguro</span>
            </h1>
            <p className="text-sm sm:text-lg text-white/70 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
              Vamos mostrar exatamente como funciona: de um clique até sua voz chegar a quem pode agir. Tudo transparente, tudo protegido.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
               <Link href="/denunciar" className="btn-primary gap-3 px-8 bg-secondary hover:bg-secondary-600 text-dark border-none shadow-glow-green h-12 sm:h-14 text-xs font-black uppercase tracking-widest">
                  Começar agora
                  <ArrowRight size={18} />
               </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center relative">
             <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
             <img 
               src="/assets/mascote_sem_fundo.png" 
               alt="Representante Denuncia MS" 
               className="w-full max-w-2xl h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
             />
          </div>
        </div>
      </section>

      {/* Grid de Processo */}
      <section className="py-16 sm:py-24 bg-white relative">
         <div className="container-page space-y-12 sm:space-y-16">
            <div className="text-center space-y-3 px-4">
               <h2 className="text-2xl sm:text-4xl font-black text-dark tracking-tight italic uppercase">O Caminho da Denuncia</h2>
               <p className="text-muted text-xs sm:text-base max-w-2xl mx-auto font-medium">Cada etapa foi desenhada para você se sentir seguro e para garantir que seu relato seja útil de verdade.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <ProcessStep 
                 num="01"
                 title="ESCOLHA A CATEGORIA"
                 desc="Você diz que tipo de problema viu — pode ser corrupção, má conduta pública, crime, ou outra coisa. Essa escolha ajuda a encaminhar tudo para o órgão certo."
                 icon={Zap}
                 color="bg-primary/10 text-primary"
               />
               <ProcessStep 
                 num="02"
                 title="DECIDA SE QUER SE IDENTIFICAR"
                 desc="Você pode colocar seu nome e contato — ou não. Se não quiser se identificar, a categoria precisa permitir. Você saberá na hora."
                 icon={UserCheck}
                 color="bg-secondary/10 text-secondary"
               />
               <ProcessStep 
                 num="03"
                 title="CONTE O QUE VIU"
                 desc="Descreva os fatos do jeito que entender. Coloque nomes, datas, horários, detalhes. Se não souber algo, deixe em branco — a verdade é mais importante que perfeição."
                 icon={FileText}
                 color="bg-dark text-white shadow-lg"
               />
               <ProcessStep 
                 num="04"
                 title="DIGA O LOCAL"
                 desc="Pode ser uma rua, um bairro, um órgão. Ajuda quem vai investigar a entender melhor o contexto. Opcionalmente, a gente pode usar sua localização (se você permitir)."
                 icon={MapPin}
                 color="bg-electric/10 text-electric"
               />
               <ProcessStep 
                 num="05"
                 title="ANEXE O QUE TIVER"
                 desc="Fotos, vídeos, áudio, documento — tudo que prove o que você está dizendo. Coisas concretas fortalecem muito o relato."
                 icon={Camera}
                 color="bg-primary/10 text-primary"
               />
               <ProcessStep 
                 num="06"
                 title="RECEBA SEU NÚMERO"
                 desc="Ao terminar, o sistema cria um protocolo único. Guarde esse número — é seu comprovante e seu caminho para acompanhar tudo."
                 icon={CheckCircle2}
                 color="bg-secondary/10 text-secondary"
               />
            </div>
         </div>
      </section>

      {/* Comparativo de Caminhos */}
      <section className="py-16 sm:py-20 bg-surface border-y border-border">
         <div className="container-page space-y-10">
            <div className="max-w-3xl space-y-3">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">
                  <ClipboardCheck size={12} />
                  Escolha orientada
               </div>
               <h2 className="text-2xl sm:text-4xl font-black text-dark tracking-tight italic uppercase">Identificado ou Anônimo?</h2>
               <p className="text-sm sm:text-base text-muted font-medium leading-relaxed">
                  A depender da categoria, você pode escolher se colocar seu nome ou não. Cada caminho tem vantagens.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <PathCard
                 icon={ShieldCheck}
                 title="DENUNCIA COM SEU NOME"
                 bestFor="Melhor quando você quer acompanhar o processo e pode ser contatado se precisarem esclarecer algo."
                 requires="O que você informa: nome, e-mail, telefone, CPF (só para validação — não ficamos com dados desnecessários)."
                 limit="O que a gente faz: protege tudo com criptografia, valida seu e-mail por código, e bloqueia acesso público aos seus dados."
               />
               <PathCard
                 icon={Lock}
                 title="DENUNCIA ANÔNIMA"
                 bestFor="Melhor quando sua segurança pessoal é prioridade e a categoria permite anonimato."
                 requires="O que você informa: os detalhes do caso (o que, quando, onde, quem fez) — mas sem seu nome."
                 limit="O que muda: sem contato posterior, então sua descrição precisa ser bem completa logo de saída. Ajuda quem vai apurar a ter contexto total."
               />
            </div>
         </div>
      </section>

      {/* Seção de Segurança */}
      <section className="py-20 bg-surface border-y border-border overflow-hidden">
         <div className="container-page">
            <div className="bg-dark rounded-[40px] p-8 md:p-20 relative overflow-hidden text-white">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8 relative z-10">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-secondary">
                        <ShieldCheck size={12} />
                        Blindagem Digital
                     </div>
                     <h2 className="text-2xl sm:text-5xl font-black tracking-tighter leading-tight italic uppercase">
                        Seus Dados Estão <span className="text-secondary underline decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">Protegidos</span>
                     </h2>
                     <div className="space-y-6">
                        <FeatureItem 
                          title="CRIPTOGRAFIA FORTE" 
                          desc="Tudo o que você manda é embaralhado antes de chegar no servidor. Mesmo que alguém conseguisse acessar ilegalmente, veria só código vazio."
                        />
                        <FeatureItem 
                          title="VALIDAÇÃO POR CÓDIGO"
                          desc="Se você coloca seu e-mail, mandamos um código. Você confirma. Isso garante que é você mesmo — e nos protege contra abuso da plataforma."
                        />
                        <FeatureItem 
                          title="ANONIMATO QUANDO PERMITIDO"
                          desc="Se você quer ficar anônimo, sua identidade não sai daqui. O sistema exclui seu nome do relato que vai para o órgão público."
                        />
                        <FeatureItem 
                          title="RASCUNHO GUARDADO"
                          desc="Enquanto você está preenchendo, o navegador salva tudo localmente (no seu computador). A gente não vê enquanto você está digitando."
                        />
                        
                        {/* Alerta MPMS */}
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl mt-4 space-y-3">
                           <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                              <ShieldCheck size={16} />
                              Sobre Identificação e Anonimato
                           </p>
                           <p className="text-xs text-white/70 leading-relaxed font-medium italic">
                              Algumas categorias precisam de seu nome por exigência legal — para que o processo tenha validade oficial. Outras permitem anonimato. Quando você escolher ser anônimo, o sistema protege sua identidade, mas pede que você descreva os fatos com mais detalhes, para que quem apurar tenha tudo que precisa.
                           </p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-4 pt-12">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                           <Lock className="text-secondary" />
                           <h4 className="font-bold text-sm">SSL/TLS 1.3</h4>
                           <p className="text-[10px] text-white/50 leading-relaxed font-medium">Camada de proteção na transmissão de dados. Padrão bancário.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                           <Search className="text-secondary" />
                           <h4 className="font-bold text-sm">Auditoria Interna</h4>
                           <p className="text-[10px] text-white/50 leading-relaxed font-medium">Nós mesmos checamos quem acessa cada denuncia. Registro de tudo.</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                           <MessageSquare className="text-secondary" />
                           <h4 className="font-bold text-sm">Proteção LGPD</h4>
                           <p className="text-[10px] text-white/50 leading-relaxed font-medium">Lei de proteção de dados brasileira. A gente segue à risca.</p>
                        </div>
                        <div className="bg-secondary rounded-3xl p-6 text-dark flex flex-col gap-3">
                           <ShieldCheck size={32} />
                           <h4 className="font-black text-xs uppercase tracking-widest leading-none">Certificado</h4>
                           <p className="text-[10px] font-bold opacity-70">Integridade Digital MS</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
         <div className="container-page space-y-16">
            <div className="max-w-2xl mx-auto text-center space-y-4">
               <div className="p-3 bg-surface rounded-2xl w-fit mx-auto text-primary border border-border">
                  <HelpCircle size={32} />
               </div>
               <h2 className="text-3xl font-black text-dark tracking-tight uppercase italic">Dúvidas Frequentes</h2>
               <p className="text-muted font-medium">Respostas rápidas para as principais questões sobre o uso da plataforma.</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
               <FaqItem 
                 q="A identificação é obrigatória?"
                 a="Depende da categoria. Algumas categorias (como crimes contra a vida, por exemplo) exigem identificação para que o processo tenha validade legal. Outras permitem anonimato. O sistema avisa qual é o seu caso antes de você começar."
               />
               <FaqItem 
                 q="O que muda se eu não me identificar?"
                 a="Você não coloca nome, e-mail ou CPF. A gente não consegue te contatr depois se precisar perguntar algo. Então sua descrição dos fatos precisa ser bem clara e completa desde o começo."
               />
               <FaqItem 
                 q="Por que validar o e-mail?"
                 a="Um código é mandado para o seu e-mail. Você copia e cola aqui. Isso confirma que é você mesmo — protege você de alguém abrir uma denuncia falsa com seu e-mail, e protege a gente contra abuso."
               />
               <FaqItem 
                 q="Perdi meu protocolo, e agora?" 
                 a="O protocolo é seu comprovante legal. Se perdeu, pode voltar aqui e consultar com seu e-mail ou CPF (se se identificou). Se foi anônimo, guarde bem: não tem como recuperar."
               />
                <FaqItem 
                  q="Como sei que minha denuncia foi entregue?" 
                  a="O número de protocolo é seu recibo. Você pode colar ele em um documento, mandar por e-mail, mostrar em um processo. Ele prova que você denunciou." 
                />
                <FaqItem 
                  q="Quanto tempo leva para o órgão responder?" 
                  a="A DENUNCIA MS garante a entrega imediata. O tempo de resposta e as providências tomadas são de responsabilidade exclusiva da instituição que recebeu a denuncia." 
                />
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-white">
         <div className="container-page pb-20">
            <div className="bg-primary rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-glow-cyan">
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Pronto para Registrar?</h3>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Escolha a categoria e vamos junto nessa.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <Link href="/denunciar" className="btn-primary bg-secondary text-dark border-none hover:bg-secondary-600 font-black h-14 px-10 uppercase tracking-widest text-xs">
                    Denunciar Agora
                 </Link>
                 <Link href="/" className="inline-flex items-center gap-2 text-white border border-white/20 bg-white/10 hover:bg-white/20 font-black h-14 px-8 uppercase tracking-widest text-xs transition-colors">
                    Voltar ao Início
                 </Link>
               </div>
            </div>
            
            <div className="mt-8 text-center uppercase text-[10px] font-black text-muted tracking-[0.3em]">
               Plataforma Independente — Protegendo Vozes Cidadãs desde 2024
            </div>
         </div>
      </section>

    </div>
  )
}

function ProcessStep({ num, title, desc, icon: Icon, color }: { num: string, title: string, desc: string, icon: React.ElementType, color: string }) {
  return (
    <div className="bg-surface p-6 sm:p-8 rounded-[2rem] sm:rounded-[40px] border border-border group hover:border-primary/30 transition-all hover:shadow-card-md flex flex-col gap-4 sm:gap-6 relative overflow-hidden mx-2 sm:mx-0">
       <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
       <div className="flex items-center justify-between">
          <span className="text-3xl sm:text-5xl font-black text-dark/10 italic leading-none">{num}</span>
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
             <Icon size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
       </div>
       <div className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-black text-dark uppercase tracking-tighter italic">{title}</h3>
          <p className="text-xs sm:text-sm text-muted font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
       <div className="mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
       </div>
       <div className="space-y-1">
          <h4 className="font-extrabold text-sm uppercase tracking-tight text-white">{title}</h4>
          <p className="text-xs text-white/50 leading-relaxed font-medium">{desc}</p>
       </div>
    </div>
  )
}

function PathCard({ icon: Icon, title, bestFor, requires, limit }: { icon: React.ElementType, title: string, bestFor: string, requires: string, limit: string }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
       <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-primary/5 text-primary border border-primary/10 shrink-0">
             <Icon size={26} />
          </div>
          <div className="space-y-2">
             <h3 className="text-lg sm:text-2xl font-black text-dark uppercase tracking-tight italic">{title}</h3>
             <p className="text-sm text-muted font-medium leading-relaxed">{bestFor}</p>
          </div>
       </div>
       <div className="grid grid-cols-1 gap-3">
          <div className="p-4 rounded-2xl bg-surface border border-border/70">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Exige</p>
             <p className="text-xs sm:text-sm text-dark/70 font-medium leading-relaxed">{requires}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-border/70">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Atenção</p>
             <p className="text-xs sm:text-sm text-dark/70 font-medium leading-relaxed">{limit}</p>
          </div>
       </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="p-6 bg-surface border border-border rounded-3xl hover:border-primary/20 transition-all">
       <h4 className="text-base font-black text-dark uppercase tracking-tight mb-3 italic">{q}</h4>
       <p className="text-sm text-muted font-medium leading-relaxed">{a}</p>
    </div>
  )
}
