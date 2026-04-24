import React from 'react'
import { Shield, Scale, Gavel, Lock, Info, ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Termos e Responsabilidades | DENUNCIA MS',
  description: 'Documento jurídico fundamentado na LAI e LGPD sobre os deveres e direitos dos usuários da plataforma.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-surface py-12 sm:py-20">
      <div className="container-page max-w-4xl space-y-8 sm:space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 px-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto">
              <Scale size={12} />
              Segurança Jurídica
           </div>
           <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter italic uppercase">
              Termos e <span className="text-primary">Responsabilidades</span>
           </h1>
           <p className="text-xs sm:text-md text-muted font-medium max-w-2xl mx-auto">
              Diretrizes legais fundamentadas na legislação federal brasileira.
           </p>
        </div>

        {/* Navigation Shortcut */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 px-4">
           <a href="#lai" className="p-3 sm:p-4 bg-white border border-border/50 rounded-xl sm:rounded-2xl hover:border-primary transition-all flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 group">
              <FileText size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-tighter">Lei de Acesso</span>
           </a>
           <a href="#lgpd" className="p-3 sm:p-4 bg-white border border-border/50 rounded-xl sm:rounded-2xl hover:border-primary transition-all flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 group">
              <Lock size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-tighter">Proteção LGPD</span>
           </a>
           <a href="#deveres" className="p-3 sm:p-4 bg-white border border-border/50 rounded-xl sm:rounded-2xl hover:border-primary transition-all flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 group">
              <Gavel size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-tighter">Seus Deveres</span>
           </a>
        </div>

        {/* Content Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] sm:rounded-[40px] shadow-card-lg border border-border/40 overflow-hidden p-6 sm:p-16 space-y-10 sm:space-y-12 leading-relaxed mx-2 sm:mx-0">
           
           {/* Section 1 */}
           <section id="lai" className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">01</div>
                 <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Da Natureza da Plataforma (LAI)</h2>
              </div>
              <p className="text-muted text-sm text-justify">
                O <strong>DENUNCIA MS</strong> atua exclusivamente como um canal mediador de inteligência cívica, fundamentado na <strong>Lei nº 12.527/2011 (Lei de Acesso à Informação)</strong>. 
                Sua finalidade é viabilizar o exercício do direito fundamental de petição e obtenção de informações de interesse público. 
                A plataforma não possui competência investigativa direta, sendo sua responsabilidade limitada à recepção, processamento técnico e encaminhamento protocolar das denuncias aos órgãos de controle e execução competentes no Estado de Mato Grosso do Sul.
              </p>
           </section>

           <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

           {/* Section 2 */}
           <section id="lgpd" className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">02</div>
                 <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Privacidade e Dados (LGPD)</h2>
              </div>
              <p className="text-muted text-sm text-justify">
                Em total conformidade com a <strong>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais)</strong>, a plataforma garante:
              </p>
              <ul className="space-y-3 text-sm text-muted list-disc pl-5 font-medium">
                 <li><strong>Proteção de Dados Sensíveis:</strong> Todos os dados de identificação são criptografados com AES-256-GCM e armazenados em tabelas segregadas, acessíveis apenas por autoridades competentes mediante autorização judicial.</li>
                 <li><strong>Finalidade Estrita:</strong> Os dados coletados são utilizados exclusivamente para o processamento da denuncia e fins estatísticos de impacto social.</li>
                 <li><strong>Segurança:</strong> Armazenamento em servidores criptografados com controle de acesso rigoroso por parte dos moderadores.</li>
              </ul>
           </section>

           <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

           {/* Section 3 */}
           <section id="deveres" className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-secondary text-dark rounded-xl flex items-center justify-center font-black">03</div>
                 <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Responsabilidades do Denunciante</h2>
              </div>
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl space-y-4">
                 <div className="flex items-center gap-2 text-error font-black text-xs uppercase tracking-widest">
                    <Info size={16} />
                    Atenção Crítica & Deveres Legais
                 </div>
                 <p className="text-error text-sm font-bold leading-relaxed">
                   De acordo com o Código Penal Brasileiro, o usuário é o único e exclusivo responsável pela veracidade dos fatos narrados. 
                   A plataforma adverte que: &quot;Denuncia caluniosa é crime (Art. 339 do Código Penal)&quot; e &quot;Falsa denuncia é crime (Art. 340 do Código Penal)&quot;. 
                   A utilização indevida sujeita o infrator a sanções civis e criminais imediatas.
                 </p>
              </div>
              <p className="text-muted text-sm text-justify">
                A plataforma resguarda o direito de registrar os logs de acesso (endereço IP, data e hora), conforme exigência legal do Marco Civil, para subsidiar eventuais investigações sobre mau uso do serviço.
              </p>
           </section>

        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-10 bg-dark rounded-[2.5rem] sm:rounded-[30px] text-white mx-2 sm:mx-0">
           <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden sm:flex w-14 h-14 bg-primary/20 text-primary rounded-2xl items-center justify-center shadow-glow-cyan">
                 <Shield size={28} />
              </div>
              <div className="space-y-1">
                 <p className="text-xl sm:text-lg font-black tracking-tighter italic uppercase">Pronto para colaborar?</p>
                 <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Sua voz é uma ferramenta de mudança.</p>
              </div>
           </div>
           <Link href="/denunciar" className="btn-primary gap-3 px-8 h-12 sm:h-14 shadow-glow-cyan border-none w-full sm:w-auto text-xs font-black uppercase tracking-widest">
              Denunciar Agora
              <ArrowRight size={18} />
           </Link>
        </div>

        {/* Footer Link */}
        <div className="text-center px-4">
           <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-muted hover:text-primary transition-colors uppercase tracking-[0.2em]">
              <ArrowLeft size={12} />
              Voltar ao Início
           </Link>
        </div>

      </div>
    </div>
  )
}
