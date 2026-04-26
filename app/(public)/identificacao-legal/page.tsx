import React from 'react'
import { ShieldCheck, Lock, Gavel, Scale, Info, ArrowLeft, ArrowRight, Fingerprint, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Identificação Obrigatória por Lei | DENUNCIA MS',
  description: 'Entenda por que a identificação é necessária e como protegemos seus dados conforme a LGPD.',
}

export default function IdentificacaoLegalPage() {
  return (
    <div className="min-h-screen bg-surface py-12 sm:py-24">
      <div className="container-page max-w-4xl space-y-12 sm:space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 px-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.3em] mx-auto border border-secondary/20">
              <ShieldCheck size={14} />
              Segurança Jurídica & Transparência
           </div>
           <h1 className="text-4xl sm:text-7xl font-black text-dark tracking-tighter italic uppercase leading-[0.9]">
              Por que a <span className="text-primary">Identificação</span> é obrigatória?
           </h1>
           <p className="text-sm sm:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
              O <strong>DENUNCIA MS</strong> preza pela qualidade da informação e pela proteção de todos os envolvidos. Entenda os fundamentos legais.
           </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
           <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-border/50 shadow-card-sm space-y-6">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit">
                 <Gavel size={32} />
              </div>
              <h3 className="text-2xl font-black text-dark uppercase tracking-tighter italic">Base Legal (LAI)</h3>
              <p className="text-muted text-sm leading-relaxed font-medium">
                 De acordo com a <strong>Lei nº 12.527/2011 (Lei de Acesso à Informação)</strong>, o direito de petição exige que o requerente se identifique para que os órgãos públicos possam processar a demanda de forma oficial e transparente.
              </p>
           </div>

           <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-border/50 shadow-card-sm space-y-6">
              <div className="p-4 bg-secondary/10 text-secondary rounded-2xl w-fit">
                 <Fingerprint size={32} />
              </div>
              <h3 className="text-2xl font-black text-dark uppercase tracking-tighter italic">Prevenção de Abusos</h3>
              <p className="text-muted text-sm leading-relaxed font-medium">
                 A identificação via OTP (E-mail) e CPF impede que robôs ou pessoas de má-fé utilizem o sistema para saturação de serviços públicos com falsos relatos, garantindo que denuncias reais tenham prioridade.
              </p>
           </div>
        </div>

        {/* LGPD Highlight */}
        <div className="bg-dark rounded-[4rem] p-10 sm:p-20 relative overflow-hidden text-white">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-secondary">
                    <Lock size={12} />
                    Proteção LGPD Ativada
                 </div>
                 <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight italic uppercase">
                    Seus dados estão <span className="text-secondary">Blindados.</span>
                 </h2>
                 <p className="text-white/60 text-lg font-medium leading-relaxed italic">
                    A identificação é obrigatória para o envio, mas seu sigilo é garantido pela tecnologia. Seus dados pessoais nunca são expostos publicamente.
                 </p>
                 <ul className="space-y-4">
                    <li className="flex gap-4">
                       <Zap className="text-secondary shrink-0" size={20} />
                       <p className="text-sm text-white/80 font-medium"><strong>Criptografia AES-256:</strong> Seus dados são embaralhados imediatamente após o envio.</p>
                    </li>
                    <li className="flex gap-4">
                       <Zap className="text-secondary shrink-0" size={20} />
                       <p className="text-sm text-white/80 font-medium"><strong>Acesso Restrito:</strong> Somente autoridades autorizadas por lei podem acessar sua identidade em casos específicos.</p>
                    </li>
                 </ul>
              </div>
              <div className="flex justify-center">
                 <div className="relative group">
                    <div className="absolute -inset-10 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
                    <ShieldCheck size={200} className="text-secondary relative z-10 drop-shadow-glow-green" />
                 </div>
              </div>
           </div>
        </div>

        {/* Disclaimer Penal */}
        <div className="max-w-3xl mx-auto p-8 sm:p-12 bg-red-50 border-2 border-red-100 rounded-[3rem] space-y-6">
           <div className="flex items-center gap-3 text-error">
              <Info size={24} />
              <h3 className="text-lg font-black uppercase tracking-widest italic">Atenção ao Código Penal</h3>
           </div>
           <p className="text-error/80 text-sm font-bold leading-relaxed text-justify">
              A identificação oficial também serve como um compromisso de veracidade. Lembramos que a <strong>Denuncia Caluniosa (Art. 339)</strong> e a <strong>Comunicação Falsa de Crime ou de Contravenção (Art. 340)</strong> são crimes previstos no Código Penal Brasileiro. Use esta ferramenta com responsabilidade cidadã.
           </p>
        </div>

        {/* Footer CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-border">
           <Link href="/como-funciona" className="flex items-center gap-3 text-sm font-black text-muted hover:text-primary transition-all uppercase tracking-widest">
              <ArrowLeft size={18} />
              Entender o Fluxo
           </Link>
           <Link href="/denunciar" className="btn-primary gap-4 px-10 h-16 bg-secondary text-dark border-none shadow-glow-green text-sm font-black uppercase tracking-widest">
              Fazer minha denuncia
              <ArrowRight size={20} />
           </Link>
        </div>

      </div>
    </div>
  )
}
