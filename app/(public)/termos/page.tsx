import React from 'react'
import { Shield, Scale, Gavel, Lock, Info, ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Termos e Responsabilidades | DENUNCIA MS',
  description: 'Documento jurídico fundamentado na LAI e LGPD sobre os deveres e direitos dos usuários da plataforma.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-surface py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <Scale size={14} />
              Segurança Jurídica
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-dark tracking-tighter italic uppercase">
              Termos e <span className="text-primary">Responsabilidades</span>
           </h1>
           <p className="text-muted font-medium max-w-2xl mx-auto">
              Este documento estabelece as diretrizes legais da plataforma DENUNCIA MS, fundamentado na legislação federal brasileira.
           </p>
        </div>

        {/* Navigation Shortcut */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <a href="#lai" className="p-4 bg-white border border-border rounded-2xl hover:border-primary transition-all flex flex-col gap-2 group">
              <FileText size={20} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs uppercase tracking-tighter">Lei de Acesso à Informação</span>
           </a>
           <a href="#lgpd" className="p-4 bg-white border border-border rounded-2xl hover:border-primary transition-all flex flex-col gap-2 group">
              <Lock size={20} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs uppercase tracking-tighter">Proteção de Dados (LGPD)</span>
           </a>
           <a href="#deveres" className="p-4 bg-white border border-border rounded-2xl hover:border-primary transition-all flex flex-col gap-2 group">
              <Gavel size={20} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs uppercase tracking-tighter">Deveres do Denunciante</span>
           </a>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[40px] shadow-card-lg border border-border overflow-hidden p-8 md:p-16 space-y-12 leading-relaxed">
           
           {/* Section 1 */}
           <section id="lai" className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">01</div>
                 <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Da Natureza da Plataforma (LAI)</h2>
              </div>
              <p className="text-muted text-sm text-justify">
                O <strong>DENUNCIA MS</strong> atua exclusivamente como um canal mediador de inteligência cívica, fundamentado na <strong>Lei nº 12.527/2011 (Lei de Acesso à Informação)</strong>. 
                Sua finalidade é viabilizar o exercício do direito fundamental de petição e obtenção de informações de interesse público. 
                A plataforma não possui competência investigativa direta, sendo sua responsabilidade limitada à recepção, processamento técnico e encaminhamento protocolar das denúncias aos órgãos de controle e execução competentes no Estado de Mato Grosso do Sul.
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
                 <li><strong>Anonimização Técnica:</strong> Processos de desindentificação para denúncias anônimas, impedindo a reversão de identidade, exceto por ordem judicial.</li>
                 <li><strong>Finalidade Estrita:</strong> Os dados coletados são utilizados exclusivamente para o processamento da denúncia e fins estatísticos de impacto social.</li>
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
                   A plataforma adverte que: &quot;Denúncia caluniosa é crime (Art. 339 do Código Penal)&quot; e &quot;Falsa denúncia é crime (Art. 340 do Código Penal)&quot;. 
                   A utilização indevida sujeita o infrator a sanções civis e criminais imediatas.
                 </p>
              </div>
              <p className="text-muted text-sm text-justify">
                A plataforma resguarda o direito de registrar os logs de acesso (endereço IP, data e hora), conforme exigência legal do Marco Civil, para subsidiar eventuais investigações sobre mau uso do serviço.
              </p>
           </section>

        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-dark rounded-[30px] text-white">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-glow-cyan">
                 <Shield size={28} />
              </div>
              <div>
                 <p className="text-lg font-black tracking-tighter italic uppercase">Pronto para colaborar?</p>
                 <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Sua voz é uma ferramenta de mudança.</p>
              </div>
           </div>
           <Link href="/denunciar" className="btn-primary gap-3 px-8 h-14 shadow-glow-cyan border-none">
              Iniciar Denúncia Segura
              <ArrowRight size={20} />
           </Link>
        </div>

        {/* Footer Link */}
        <div className="text-center">
           <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest">
              <ArrowLeft size={14} />
              Voltar ao Início
           </Link>
        </div>

      </div>
    </div>
  )
}
