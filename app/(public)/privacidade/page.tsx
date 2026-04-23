import React from 'react'
import { ShieldCheck, EyeOff, UserCheck, Database, ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade | DENUNCIA MS',
  description: 'Saiba como tratamos seus dados em conformidade com a LGPD (Lei 13.709/2018).',
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
           <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter italic uppercase">
              Política de <span className="text-secondary">Privacidade</span>
           </h1>
           <p className="text-xs sm:text-md text-muted font-medium max-w-2xl mx-auto">
              Sua segurança e anonimato são as bases da nossa plataforma.
           </p>
        </div>

        {/* Content Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] sm:rounded-[40px] shadow-card-lg border border-border/40 overflow-hidden p-6 sm:p-16 space-y-8 sm:space-y-10 leading-relaxed mx-2 sm:mx-0">
           
           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <EyeOff size={20} className="text-secondary" />
                 1. Compromisso com o Anonimato
              </h2>
              <p className="text-muted text-xs sm:text-sm text-justify font-medium">
                O <strong>DENUNCIA MS</strong> permite o envio de denúncias sem a necessidade de identificação. Quando você escolhe a opção &quot;Anônimo&quot;, nosso sistema remove metadados dos arquivos e não armazena vínculos diretos entre sua identidade e o protocolo gerado, garantindo o sigilo técnico absoluto.
              </p>
           </section>

           <div className="h-px bg-border/50"></div>

           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <Database size={20} className="text-secondary" />
                 2. Coleta de Dados Sob a LGPD
              </h2>
              <p className="text-muted text-sm text-justify font-medium">
                Para usuários que optam por se identificar, coletamos: nome, e-mail e telefone. Esses dados são tratados conforme a <strong>Lei nº 13.709/2018 (LGPD)</strong>, com as seguintes finalidades:
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
