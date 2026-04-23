import React from 'react'
import { PainelImpacto } from '@/components/public/painel-impacto'
import { ShieldCheck, BarChart3, Globe, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Transparência e Impacto | DENUNCIA MS',
  description: 'Acompanhe em tempo real as métricas de impacto e o feed de inteligência da plataforma.',
}

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Transparência */}
      <section className="bg-dark text-white py-12 sm:py-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container-page relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
             <ShieldCheck size={14} className="text-secondary" />
             Dados Auditáveis & Transparência
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic uppercase">
              Governança de <span className="text-secondary italic">Dados</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-lg max-w-2xl font-medium leading-relaxed">
              O compromisso da Denúncia MS com a transparência total. Veja como sua voz está transformando Mato Grosso do Sul através de dados e ações reais.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <BarChart3 size={18} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Impacto Real</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <Globe size={18} className="text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Todo o Estado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Componente de Impacto (Movido da Home) */}
      <PainelImpacto />

      {/* Seção Adicional de Transparência */}
      <section className="section bg-white border-t border-border">
        <div className="container-page max-w-4xl mx-auto text-center space-y-8">
          <div className="p-4 bg-surface rounded-3xl space-y-4 border border-border">
            <h2 className="text-xl font-black text-dark tracking-tighter uppercase italic">Nosso Compromisso Ético</h2>
            <p className="text-muted text-sm leading-relaxed font-medium">
              A <strong>Denúncia MS</strong> não manipula dados. Nosso feed reflete a realidade das interações cidadãs, 
              utilizando algoritmos de anonimização para proteger identidades enquanto expõe problemas estruturais 
              que necessitam de atenção imediata do poder público.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-muted hover:text-primary transition-colors uppercase tracking-[0.2em]">
              <ArrowLeft size={12} />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
