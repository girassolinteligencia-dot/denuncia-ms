'use client'

import React from 'react'
import { Megaphone, Mail, ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface flex items-center justify-center p-4 sm:p-6 bg-grid-slate-100">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8 group font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para o Login
          </Link>
          
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6 border-2 border-amber-500/20 shadow-glow-amber">
            <ShieldAlert size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Recuperação de <span className="text-primary">Acesso</span></h2>
          <p className="text-muted text-sm font-medium mt-2">Protocolo de Segurança Administrativa</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-card-lg border border-border/40 p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
          
          <div className="space-y-4">
            <p className="text-sm text-dark/70 leading-relaxed font-medium">
              Por questões de segurança e integridade da plataforma **Denuncia MS**, a redefinição de senhas administrativas deve ser solicitada diretamente ao **Super Administrador** ou ao setor de TI responsável.
            </p>
            
            <div className="bg-surface p-6 rounded-2xl border border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Mail size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Suporte Técnico</span>
              </div>
              <p className="text-xs font-bold text-dark italic">
                Envie um e-mail para: <br/>
                <span className="text-primary text-sm not-italic mt-1 block">suporte@denunciams.com.br</span>
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link 
              href="mailto:suporte@denunciams.com.br?subject=Recuperação de Senha Administrativa - Denuncia MS"
              className="btn-primary w-full h-14 rounded-2xl bg-dark hover:bg-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
              <Mail size={18} />
              Solicitar via E-mail
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-[9px] text-muted font-black uppercase tracking-[0.3em] italic">
          Sistema de Gestão de Denuncias - MS
        </p>
      </div>
    </div>
  )
}
