import React from 'react'
import { ShieldCheck, EyeOff, UserCheck, Database, ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade | DENUNCIA MS',
  description: 'Saiba como tratamos seus dados em conformidade com a LGPD (Lei 13.709/2018).',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-surface py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={14} />
              Proteção de Dados
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-dark tracking-tighter italic uppercase">
              Política de <span className="text-secondary">Privacidade</span>
           </h1>
           <p className="text-muted font-medium max-w-2xl mx-auto">
              Sua segurança e anonimato são as bases da nossa plataforma. Entenda como protegemos sua identidade em Mato Grosso do Sul.
           </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[40px] shadow-card-lg border border-border overflow-hidden p-8 md:p-16 space-y-10 leading-relaxed">
           
           <section className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
                 <EyeOff size={20} className="text-secondary" />
                 1. Compromisso com o Anonimato
              </h2>
              <p className="text-muted text-sm text-justify font-medium">
                O <strong>DENUNCIA MS</strong> permite o envio de denúncias sem a necessidade de identificação. Quando você escolhe a opção "Anônimo", nosso sistema remove metadados dos arquivos e não armazena vínculos diretos entre sua identidade e o protocolo gerado, garantindo o sigilo técnico absoluto.
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <Link href="/termos" className="flex items-center gap-2 text-xs font-black text-muted hover:text-secondary transition-colors uppercase tracking-[0.2em]">
              Ver Termos de Responsabilidade
              <ArrowRight size={14} />
           </Link>
           <Link href="/" className="btn-outline h-12 px-6 gap-2 border-border text-muted uppercase text-[10px] font-black tracking-widest">
              <ArrowLeft size={16} /> Voltar para o Início
           </Link>
        </div>

      </div>
    </div>
  )
}
