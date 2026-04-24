'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Download,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

function SucessoContent() {
  const searchParams = useSearchParams()
  const protocolo = searchParams.get('protocolo')
  const chave = searchParams.get('chave')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  if (!protocolo || !chave) {
    return (
      <div className="container-page py-32 text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
          <AlertTriangle size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">Dados não localizados</h1>
          <p className="text-muted max-w-md mx-auto font-medium">Houve um problema ao recuperar as credenciais da sua denuncia. Por favor, verifique seu e-mail para encontrar os dados oficiais.</p>
        </div>
        <Link href="/" className="btn-primary inline-flex gap-3 px-12 h-16 rounded-2xl bg-dark border-none shadow-xl">
          Voltar ao Início
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-12 sm:py-24 max-w-4xl animate-fade-in">
      <div className="text-center space-y-6 mb-16">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-glow-cyan animate-bounce-slow">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-black text-dark tracking-tighter uppercase italic">
            Denuncia <span className="text-primary underline decoration-secondary decoration-8 underline-offset-4">Protocolada</span>
          </h1>
          <p className="text-muted font-bold uppercase tracking-[0.2em] text-sm">Registro concluído com sucesso</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* CARD PRINCIPAL - PROTOCOLO */}
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-6 sm:space-y-8 border-2 border-primary/20 shadow-xl relative overflow-hidden group hover:border-primary transition-all">
          <div className="absolute top-0 right-0 p-8 text-primary/5 -z-10 group-hover:scale-110 transition-transform">
             <ShieldCheck size={180} />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Número do Protocolo</p>
            </div>
            <div className="flex items-center justify-between bg-surface p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/50 group-hover:border-primary/30 transition-all">
              <span className="text-xl sm:text-3xl font-black text-dark tracking-tighter">{protocolo}</span>
              <button onClick={() => copyToClipboard(protocolo)} className="p-2 sm:p-3 bg-white text-muted hover:text-primary rounded-xl transition-all shadow-sm">
                <Copy size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Chave de Acesso Única</p>
            </div>
            <div className="flex items-center justify-between bg-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl">
              <span className="text-xl sm:text-3xl font-black text-secondary tracking-tighter">{chave}</span>
              <button onClick={() => copyToClipboard(chave)} className="p-2 sm:p-3 bg-white/10 text-secondary hover:bg-white/20 rounded-xl transition-all">
                <Copy size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted font-medium italic">
              * Importante: Guarde esta chave em local seguro. Você precisará dela para acompanhar o andamento da sua denuncia.
            </p>
          </div>
        </div>

        {/* CARD DE AÇÃO */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex-1 flex flex-col justify-between border-2 border-transparent hover:border-secondary/20 transition-all gap-8">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-dark uppercase italic leading-none">O que acontece agora?</h3>
              <p className="text-xs sm:text-sm text-muted font-medium leading-relaxed">
                Seu relato foi criptografado e enviado para a nossa central de triagem. Você receberá um e-mail com a cópia digital do protocolo. Acompanhe a evolução do caso usando suas credenciais.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link 
                href={`/acompanhar/${protocolo}?key=${chave}`}
                className="btn-primary w-full h-14 sm:h-16 rounded-2xl bg-secondary hover:bg-secondary-600 gap-3 shadow-glow-green"
              >
                <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Acompanhar Status</span>
                <ExternalLink size={18} />
              </Link>
              
              <Link 
                href="/"
                className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black text-muted uppercase tracking-widest hover:text-dark transition-colors"
              >
                Voltar para a Página Inicial
              </Link>
            </div>
          </div>

          <div className="bg-primary/5 rounded-[2rem] p-6 flex items-center gap-4 border border-primary/10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic underline decoration-secondary">Segurança de Dados</p>
              <p className="text-[11px] text-dark/70 font-medium">Seus dados estão protegidos sob o Art. 5º da CF.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="container-page py-32 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full mx-auto"></div>
          <div className="h-8 bg-muted w-48 mx-auto rounded"></div>
          <div className="h-4 bg-muted w-64 mx-auto rounded"></div>
        </div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  )
}
