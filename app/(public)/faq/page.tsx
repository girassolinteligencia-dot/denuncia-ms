'use client'

import React from 'react'
import { 
  HelpCircle, 
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const FAQ_ITEMS = [
  {
    category: 'Segurança & Identidade',
    items: [
      {
        q: 'A identificação é obrigatória?',
        a: 'Sim. Para garantir a legitimidade das informações e evitar denúncias falsas, o DENUNCIA MS exige a validação de identidade via código de segurança (OTP) enviado ao seu e-mail.'
      },
      {
        q: 'Meus dados estão protegidos?',
        a: 'Sim. Seus dados são criptografados e protegidos conforme a LGPD. Eles são usados exclusivamente para validar a denúncia e permitir que os órgãos competentes deem retornos sobre o caso.'
      },
      {
        q: 'A plataforma é segura?',
        a: 'Utilizamos criptografia de ponta-a-ponta (SSL/TLS) e todos os anexos são armazenados em servidores protegidos, acessíveis apenas por pessoal autorizado.'
      }
    ]
  },
  {
    category: 'Processo de Denúncia',
    items: [
      {
        q: 'Quais tipos de irregularidades posso denunciar?',
        a: 'Qualquer fato que se enquadre em nossas categorias, como Saúde, Segurança, Meio Ambiente, Infraestrutura, entre outras, desde que ocorridas em Mato Grosso do Sul.'
      },
      {
        q: 'Posso anexar provas à minha denúncia?',
        a: 'Sim. Você pode enviar fotos, vídeos e documentos que ajudem a comprovar os fatos. Recomendamos anexos claros e objetivos.'
      },
      {
        q: 'Perdi meu número de protocolo, e agora?',
        a: 'Por segurança, protocolos perdidos não podem ser recuperados manualmente. Você deve guardar sua chave de acesso gerada ao final do registro para consultar o andamento.'
      },
    ]
  },
  {
    category: 'Acompanhamento',
    items: [
      {
        q: 'Como sei se minha denúncia está sendo apurada?',
        a: 'Basta acessar a área "Acompanhar" no menu principal e inserir seu número de protocolo. Lá você verá o status atualizado em tempo real.'
      },
      {
        q: 'Quanto tempo leva para uma resposta?',
        a: 'O encaminhamento ao órgão responsável é imediato. O tempo de resposta final depende da complexidade do fato e dos prazos internos de cada instituição.'
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface py-12 sm:py-20">
      <div className="container-page max-w-4xl space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 px-4">
          <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto text-primary border border-primary/20">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter italic uppercase">
            Dúvidas <span className="text-primary italic">Frequentes</span>
          </h1>
          <p className="text-xs sm:text-md text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Encontre respostas rápidas sobre o funcionamento, segurança e transparência da nossa plataforma.
          </p>
        </header>

        {/* FAQ Grid */}
        <div className="space-y-12 px-2 sm:px-0">
          {FAQ_ITEMS.map((group, idx) => (
            <section key={idx} className="space-y-6">
              <div className="flex items-center gap-3 px-4">
                <div className="h-px flex-1 bg-border/50"></div>
                <h2 className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] whitespace-nowrap bg-surface px-4">
                  {group.category}
                </h2>
                <div className="h-px flex-1 bg-border/50"></div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {group.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className="bg-white/95 backdrop-blur-sm rounded-3xl border border-border/40 p-6 sm:p-8 hover:border-primary/30 transition-all hover:shadow-card-md group"
                  >
                    <h3 className="text-base sm:text-lg font-black text-dark tracking-tight mb-3 italic group-hover:text-primary transition-colors">
                      {item.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted font-medium leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="bg-dark rounded-[2.5rem] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 mx-2 sm:mx-0">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none">Ainda tem dúvidas?</h3>
            <p className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Nossa equipe está pronta para ajudar.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link href="/" className="btn-outline border-white/10 text-white hover:bg-white/10 h-12 px-8 text-[10px] font-black uppercase tracking-widest">
              Início
            </Link>
            <Link href="/denunciar" className="btn-primary bg-secondary text-dark border-none h-12 px-8 text-[10px] font-black uppercase tracking-widest">
              Denunciar Agora
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-muted hover:text-primary transition-colors uppercase tracking-[0.2em]">
            <ArrowLeft size={12} />
            Voltar ao Início
          </Link>
        </div>

      </div>
    </div>
  )
}
