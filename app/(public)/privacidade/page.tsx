import React from 'react'
import { ShieldCheck, EyeOff, UserCheck, Database, ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade | DENUNCIA MS',
  description: 'Saiba como registrar sua denúncia de forma segura e eficaz no Mato Grosso do Sul.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-surface py-12 sm:py-20">
      <div className="container-page max-w-4xl space-y-8 sm:space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 px-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto">
              <ShieldCheck size={12} />
              Proteção de Dados
           </div>
           <h2 className="text-2xl sm:text-5xl font-black tracking-tighter leading-tight italic uppercase">
              Como garantimos seu <span className="text-secondary underline decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">Sigilo?</span>
           </h2>
           <p className="text-xs sm:text-md text-muted font-medium max-w-2xl mx-auto">
              Sua segurança e a integridade da sua denúncia são as bases da nossa plataforma.
           </p>
        </div>

        {/* Content Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] sm:rounded-[40px] shadow-card-lg border border-border/40 overflow-hidden p-6 sm:p-16 space-y-8 sm:space-y-10 leading-relaxed mx-2 sm:mx-0">
           
           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <EyeOff size={20} className="text-secondary" />
                 1. Compromisso com o Sigilo
              </h2>
              <p className="text-muted text-xs sm:text-sm text-justify font-medium">
                O <strong>DENUNCIA MS</strong> exige identificação para garantir a seriedade do processo, mas garante o sigilo absoluto dos seus dados. Nossa tecnologia criptografa suas informações pessoais imediatamente, e elas só são acessíveis por autoridades competentes sob estrita necessidade legal e técnica.
              </p>
           </section>

           <div className="h-px bg-border/50"></div>

           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <Database size={20} className="text-secondary" />
                 2. Coleta de Dados Sob a LGPD
              </h2>
              <p className="text-muted text-sm text-justify font-medium">
                Para validar a denúncia, coletamos: nome, e-mail, telefone e CPF. Esses dados são tratados conforme a <strong>Lei nº 13.709/2018 (LGPD)</strong>, com as seguintes finalidades:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <li className="p-4 bg-surface rounded-xl flex items-center gap-3 text-xs font-bold text-muted">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    Retorno sobre o andamento do caso
                 </li>
                 <li className="p-4 bg-surface rounded-xl flex items-center gap-3 text-xs font-bold text-muted">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    Validação de autenticidade da denúncia
                 </li>
              </ul>
              
              <div className="p-6 bg-dark/5 rounded-2xl border border-dark/10">
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-dark text-white rounded-xl shadow-lg">
                       <Lock size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-dark uppercase">Identificação Segura</h3>
                       <p className="text-xs text-muted mt-1">A validação por e-mail (OTP) garante que sua denúncia seja legítima e oficial, protegendo o sistema contra falsos relatos.</p>
                    </div>
                 </div>
              </div>
           </section>

           <div className="h-px bg-border/50"></div>

           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <Lock size={20} className="text-secondary" />
                 3. Segurança Cibernética
              </h2>
              <p className="text-muted text-sm text-justify font-medium">
                Utilizamos criptografia de ponta-a-ponta (SSL/TLS) em todo o tráfego de dados. As fotos e documentos enviados são armazenados em buckets privados, acessíveis apenas por moderadores autorizados mediante autenticação de múltiplos fatores (MFA).
              </p>
           </section>

           <div className="h-px bg-border/50"></div>

           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <UserCheck size={20} className="text-secondary" />
                 4. Seus Direitos
              </h2>
              <p className="text-muted text-sm text-justify font-medium">
                Você pode solicitar a exclusão de seus dados pessoais identificáveis a qualquer momento através do e-mail de suporte, desde que a denúncia já tenha sido processada pelos órgãos competentes, respeitando os prazos de guarda legal do <strong>Marco Civil da Internet</strong>.
              </p>
           </section>

        </div>

        {/* Footer Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 px-4">
           <Link href="/termos" className="flex items-center gap-2 text-[10px] font-black text-muted hover:text-secondary transition-colors uppercase tracking-[0.2em]">
              Termos de Responsabilidade
              <ArrowRight size={12} />
           </Link>
           <Link href="/" className="btn-outline h-10 sm:h-12 px-5 sm:px-6 gap-2 border-border text-muted uppercase text-[9px] sm:text-[10px] font-black tracking-widest w-full sm:w-auto">
              <ArrowLeft size={14} /> Início
           </Link>
        </div>

      </div>
    </div>
  )
}
