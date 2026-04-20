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
  Search
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Como Funciona | DENUNCIA MS',
  description: 'Saiba como registrar sua denúncia de forma segura, anônima e eficaz no Mato Grosso do Sul.',
}

export default function ComoFuncionaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      
      {/* Hero Section */}
      <section className="relative bg-[#021691] py-20 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 z-0 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/2 z-0"></div>
        
        <div className="container-page relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] animate-fade-in">
               <Zap size={14} className="text-secondary fill-secondary" />
               Transparência e Inteligência Cívica
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] italic">
               Sua denúncia percorre um <span className="text-secondary">caminho seguro.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl font-medium leading-relaxed">
              Entenda como a plataforma <span className="text-white font-black">DENUNCIA MS</span> utiliza tecnologia de ponta para garantir seu anonimato e a entrega rápida aos órgãos competentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
               <Link href="/denunciar" className="btn-primary gap-3 px-8 bg-secondary hover:bg-secondary-600 text-dark border-none shadow-glow-green h-14">
                  Iniciar Registro agora
                  <ArrowRight size={20} />
               </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center relative">
             <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
             <img 
               src="/assets/mascote.jpg" 
               alt="Representante Denúncia MS" 
               className="w-full max-w-md h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-float"
             />
          </div>
        </div>
      </section>

      {/* Grid de Processo - 4 Passos */}
      <section className="py-24 bg-white relative">
         <div className="container-page space-y-16">
            <div className="text-center space-y-4">
               <h2 className="text-3xl md:text-4xl font-black text-dark tracking-tight italic uppercase">O Fluxo da Informação</h2>
               <p className="text-muted max-w-2xl mx-auto font-medium">Desde o primeiro clique até o encaminhamento institucional, cada etapa é monitorada com rigor técnico.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <ProcessStep 
                 num="01"
                 title="Registro & Fatos"
                 desc="Você seleciona a categoria e narra os fatos. Nosso formulário é otimizado para que você não esqueça nenhum detalhe importante."
                 icon={FileText}
                 color="bg-primary/10 text-primary"
               />
               <ProcessStep 
                 num="02"
                 title="Anexos de Mídia"
                 desc="Insira fotos, vídeos ou documentos. Todos os arquivos são criptografados no momento do upload para proteger a fonte."
                 icon={Camera}
                 color="bg-secondary/10 text-secondary"
               />
               <ProcessStep 
                 num="03"
                 title="Chave de Acesso"
                 desc="O sistema gera um protocolo único e uma chave de consulta. É sua única forma de acompanhar o caso sem se identificar."
                 icon={Lock}
                 color="bg-dark text-white shadow-lg"
               />
               <ProcessStep 
                 num="04"
                 title="Triagem & Ação"
                 desc="A denúncia é enviada automaticamente aos órgãos responsáveis, que iniciam os procedimentos de apuração e fiscalização."
                 icon={CheckCircle2}
                 color="bg-electric/10 text-electric"
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
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-secondary">
                        <ShieldCheck size={14} />
                        Blindagem Digital
                     </div>
                     <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight italic uppercase">
                        Como garantimos seu <span className="text-secondary underline decoration-4 underline-offset-8">Anonimato?</span>
                     </h2>
                     <div className="space-y-6">
                        <FeatureItem 
                          title="Criptografia de Ponta-a-Ponta" 
                          desc="Os dados são embaralhados antes de serem salvos no banco de dados, tornando-os ilegíveis para acessos não autorizados."
                        />
                        <FeatureItem 
                          title="Sem Rastreamento de Identidade" 
                          desc="Não armazenamos cookies persistentes ou dados de perfil que possam vincular sua denúncia ao seu navegador pessoal."
                        />
                        <FeatureItem 
                          title="Protocolo Independente" 
                          desc="O número gerado não contém nenhuma informação sobre quem o gerou, apenas sobre o conteúdo da ocorrência."
                        />
                        
                        {/* Alerta MPMS */}
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl mt-4 space-y-3">
                           <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                              <ShieldCheck size={16} />
                              Nota sobre Manifestação Anônima
                           </p>
                           <p className="text-xs text-white/70 leading-relaxed font-medium italic">
                              Conforme orientação do Ministério Público (MPMS), ao optar por não se identificar, saiba que &quot;o manifestante não será identificado, porém a manifestação poderá não ser atendida. O manifestante poderá optar por não fornecer dados sobre sua identificação. Atenção! Isso prejudica a investigação dos fatos&quot;.
                           </p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-4 pt-12">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                           <Lock className="text-secondary" />
                           <h4 className="font-bold text-sm">SSL/TLS 1.3</h4>
                           <p className="text-[10px] text-white/50 leading-relaxed font-medium">Camada de transporte ultra-segura para envio de dados.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                           <Search className="text-secondary" />
                           <h4 className="font-bold text-sm">Auditoria Interna</h4>
                           <p className="text-[10px] text-white/50 leading-relaxed font-medium">Rigoroso controle de quem acessa cada denúncia.</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                           <MessageSquare className="text-secondary" />
                           <h4 className="font-bold text-sm">Proteção LGPD</h4>
                           <p className="text-[10px] text-white/50 leading-relaxed font-medium">Tratamento de dados em conformidade com a lei federal.</p>
                        </div>
                        <div className="bg-secondary rounded-3xl p-6 text-dark flex flex-col gap-3">
                           <ShieldCheck size={32} />
                           <h4 className="font-black text-xs uppercase tracking-widest leading-none">Certificado</h4>
                           <p className="text-[10px] font-bold opacity-70">Selo de Integridade Digital MS</p>
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
                 q="A denúncia é realmente anônima?" 
                 a="Sim. Ao escolher a opção 'Manter Anônimo', nenhum dado pessoal seu será coletado ou armazenado no envio da denúncia." 
               />
               <FaqItem 
                 q="Perdi meu protocolo, e agora?" 
                 a="Por segurança, protocolos perdidos não podem ser recuperados. É fundamental anotar a chave de acesso gerada ao final do processo." 
               />
               <FaqItem 
                 q="Como sei que minha denúncia foi lida?" 
                 a="Você pode usar seu número de protocolo na área 'Acompanhar'. Lá constarão atualizações de status conforme o órgão der andamento." 
               />
               <FaqItem 
                 q="Quanto tempo leva para resolver?" 
                 a="O prazo varia conforme a complexidade e o órgão responsável, mas o sistema garante o encaminhamento imediato após o registro." 
               />
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-white">
         <div className="container-page pb-20">
            <div className="bg-primary rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-glow-cyan">
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Pronto para colaborar?</h3>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Inicie sua denúncia em menos de 2 minutos.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <Link href="/" className="btn-outline border-white/20 text-white hover:bg-white/10 font-black h-14 px-8 uppercase tracking-widest text-xs">
                     Voltar ao Início
                  </Link>
                  <Link href="/denunciar" className="btn-primary bg-secondary text-dark border-none hover:bg-secondary-600 font-black h-14 px-10 uppercase tracking-widest text-xs">
                     Denunciar Agora
                  </Link>
               </div>
            </div>
            
            <div className="mt-8 text-center uppercase text-[10px] font-black text-muted tracking-[0.3em]">
               Plataforma Independente — Transparência e Inteligência Cívica
            </div>
         </div>
      </section>

    </div>
  )
}

function ProcessStep({ num, title, desc, icon: Icon, color }: { num: string, title: string, desc: string, icon: React.ElementType, color: string }) {
  return (
    <div className="bg-surface p-8 rounded-[40px] border border-border group hover:border-primary/30 transition-all hover:shadow-card-md flex flex-col gap-6 relative overflow-hidden">
       <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
       <div className="flex items-center justify-between">
          <span className="text-5xl font-black text-dark/10 italic leading-none">{num}</span>
          <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
             <Icon size={24} />
          </div>
       </div>
       <div className="space-y-3">
          <h3 className="text-xl font-black text-dark uppercase tracking-tighter italic">{title}</h3>
          <p className="text-sm text-muted font-medium leading-relaxed">{desc}</p>
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

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="p-6 bg-surface border border-border rounded-3xl hover:border-primary/20 transition-all">
       <h4 className="text-base font-black text-dark uppercase tracking-tight mb-3 italic">{q}</h4>
       <p className="text-sm text-muted font-medium leading-relaxed">{a}</p>
    </div>
  )
}
