import React from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Search, 
  ExternalLink,
  ChevronLeft,
  FileText,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'

const STATUS_MAP: any = {
  recebida: {
    label: 'Recebida',
    desc: 'Sua denúncia foi registrada com sucesso e aguarda triagem inicial.',
    icon: Clock,
    color: 'text-primary',
    bgColor: 'bg-primary-50',
    step: 1
  },
  em_analise: {
    label: 'Em Análise',
    desc: 'Nossa equipe está revisando os detalhes e evidências fornecidas.',
    icon: Search,
    color: 'text-info',
    bgColor: 'bg-blue-50',
    step: 2
  },
  encaminhada: {
    label: 'Encaminhada',
    desc: 'A denúncia foi oficializada e encaminhada ao órgão competente do Mato Grosso do Sul.',
    icon: Send,
    color: 'text-secondary',
    bgColor: 'bg-secondary-50',
    step: 3
  },
  resolvida: {
    label: 'Resolvida',
    desc: 'O processo foi concluído e as medidas cabíveis foram tomadas.',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-green-50',
    step: 4
  },
  arquivada: {
    label: 'Arquivada',
    desc: 'A denúncia foi encerrada por insuficiência de provas ou duplicidade.',
    icon: AlertTriangle,
    color: 'text-muted',
    bgColor: 'bg-surface',
    step: 4
  }
}

export default async function DetalhesProtocoloPage({ params }: { params: { protocolo: string } }) {
  const supabase = createAdminClient()
  
  const { data: denuncia, error } = await supabase
    .from('denuncias')
    .select('*, categorias(label)')
    .eq('protocolo', params.protocolo)
    .single()

  if (!denuncia || error) {
    return (
      <div className="container-page py-20 text-center space-y-6">
        <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">Protocolo não encontrado</h1>
        <p className="text-muted">Verifique se o código <span className="font-bold text-primary">{params.protocolo}</span> está correto.</p>
        <Link href="/acompanhar" className="btn-primary inline-flex gap-2">Tentar novamente</Link>
      </div>
    )
  }

  const status = STATUS_MAP[denuncia.status] || STATUS_MAP.recebida

  return (
    <div className="container-page py-12 sm:py-20 animate-fade-in max-w-4xl">
      <Link href="/acompanhar" className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-[0.2em] mb-8">
         <ChevronLeft size={16} /> Voltar para busca
      </Link>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">Status da <span className="text-primary underline decoration-secondary decoration-4 underline-offset-8">Denúncia</span></h1>
            <p className="text-muted text-sm mt-3">Protocolo: <span className="font-bold text-dark">{denuncia.protocolo}</span> • Registrado em {new Date(denuncia.criado_em).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-card border border-border">
             <div className={`p-2 rounded-lg ${status.bgColor} ${status.color}`}>
                <status.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">Situação Atual</p>
                <p className={`text-lg font-black uppercase tracking-tight leading-none ${status.color}`}>{status.label}</p>
             </div>
          </div>
        </div>

        {/* Linha do Tempo Visual */}
        <div className="bg-white rounded-card shadow-card-lg border border-border p-8 py-12">
           <div className="flex items-center justify-between relative px-4 sm:px-12">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface -z-10 -translate-y-1/2"></div>
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex flex-col items-center gap-3">
                   <div className={`w-8 h-8 rounded-full border-4 transition-all ${status.step >= s ? 'bg-primary border-primary shadow-glow-cyan scale-110' : 'bg-white border-surface'}`}>
                   </div>
                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${status.step >= s ? 'text-primary' : 'text-muted/30'}`}>
                      Passo {s}
                   </span>
                </div>
              ))}
           </div>
           
           <div className={`mt-12 p-6 rounded-xl border-l-4 ${status.color.replace('text', 'border')} ${status.bgColor} space-y-2 animate-slide-up`}>
              <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <AlertTriangle size={14} />
                 Informações do Órgão Gestor
              </p>
              <p className="text-sm text-dark/70 font-medium leading-relaxed">
                 {status.desc}
              </p>
           </div>
        </div>

        {/* Resumo dos Dados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white rounded-card border border-border p-6 space-y-6">
              <h3 className="text-sm font-black text-dark uppercase tracking-widest border-b border-border pb-4 flex items-center gap-2">
                 <FileText size={18} className="text-primary" />
                 Detalhes Registrados
              </h3>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] text-muted font-bold uppercase mb-1">Categoria</p>
                    <p className="text-sm font-bold text-dark italic">{denuncia.categorias?.label}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-muted font-bold uppercase mb-1">Título da Ocorrência</p>
                    <p className="text-sm font-bold text-dark">{denuncia.titulo}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-muted font-bold uppercase mb-1">Localização</p>
                    <p className="text-sm font-medium text-dark">{denuncia.local || 'Não informado'}</p>
                 </div>
              </div>
           </div>

           <div className="bg-dark text-white rounded-card p-8 flex flex-col justify-center gap-6 relative overflow-hidden group">
              <div className="absolute -bottom-8 -right-8 text-white/5 group-hover:text-white/10 transition-colors">
                 <ShieldCheck size={200} />
              </div>
              <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Controle Cidadão</h3>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                 Para visualização do documento completo, clique no botão abaixo. Este link expira em 30 minutos após a geração por questões de segurança.
              </p>
              <button className="btn-primary w-full gap-2 bg-secondary border-none hover:bg-secondary-600 shadow-glow-green uppercase italic font-black text-sm py-4">
                 Baixar Documento Original
                 <ExternalLink size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
