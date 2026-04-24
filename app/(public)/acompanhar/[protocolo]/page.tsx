import React from 'react'
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
    label: 'Protocolada',
    desc: 'Sua denuncia foi registrada formalmente na plataforma DENUNCIA MS e o documento oficial foi gerado com sucesso.',
    icon: ShieldCheck,
    color: 'text-primary',
    bgColor: 'bg-primary-50',
    step: 1
  },
  em_analise: {
    label: 'Protocolada',
    desc: 'Sua denuncia foi registrada formalmente na plataforma DENUNCIA MS e o documento oficial foi gerado com sucesso.',
    icon: ShieldCheck,
    color: 'text-primary',
    bgColor: 'bg-primary-50',
    step: 1
  },
  encaminhada: {
    label: 'Enviada ao Órgão',
    desc: 'O protocolo oficial foi despachado para o órgão competente do Mato Grosso do Sul para as devidas providências.',
    icon: Send,
    color: 'text-secondary',
    bgColor: 'bg-secondary-50',
    step: 2
  },
  resolvida: {
    label: 'Enviada ao Órgão',
    desc: 'O protocolo oficial foi despachado para o órgão competente do Mato Grosso do Sul para as devidas providências.',
    icon: Send,
    color: 'text-secondary',
    bgColor: 'bg-secondary-50',
    step: 2
  },
  arquivada: {
    label: 'Arquivada',
    desc: 'O registro foi encerrado pela plataforma. Verifique os termos de uso para mais informações.',
    icon: AlertTriangle,
    color: 'text-muted',
    bgColor: 'bg-surface',
    step: 0
  }
}

import { consultarStatusDenuncia } from '@/lib/actions/consulta'

export default async function DetalhesProtocoloPage({ 
  params,
  searchParams 
}: { 
  params: { protocolo: string },
  searchParams: { key?: string }
}) {
  const chaveAcesso = searchParams.key
  
  if (!chaveAcesso) {
    return (
      <div className="container-page py-20 text-center space-y-6">
        <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic text-red-600">Acesso Negado</h1>
        <p className="text-muted">É necessário informar a Chave de Acesso para visualizar os detalhes desta denuncia.</p>
        <Link href="/acompanhar" className="btn-primary inline-flex gap-2 bg-dark border-none">Voltar para Consulta</Link>
      </div>
    )
  }

  const result = await consultarStatusDenuncia(params.protocolo, chaveAcesso)

  if (!result.success || !result.denuncia) {
    return (
      <div className="container-page py-20 text-center space-y-6">
        <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">Credenciais Inválidas</h1>
        <p className="text-muted font-medium">{result.error || 'Verifique se o protocolo e a chave estão corretos.'}</p>
        <div className="bg-amber-50 p-4 rounded-xl max-w-md mx-auto border border-amber-100 mt-4">
           <p className="text-xs text-amber-900 font-bold">Por segurança, após 5 tentativas falhas seu IP será bloqueado temporariamente.</p>
        </div>
        <Link href="/acompanhar" className="btn-primary inline-flex gap-2 mt-8">Tentar novamente</Link>
      </div>
    )
  }

  const denuncia = result.denuncia
  const status = STATUS_MAP[denuncia.status] || STATUS_MAP.recebida

  return (
    <div className="container-page py-12 sm:py-20 animate-fade-in max-w-4xl">
      <Link href="/acompanhar" className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-[0.2em] mb-8">
         <ChevronLeft size={16} /> Voltar para busca
      </Link>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">Status da <span className="text-primary underline decoration-secondary decoration-4 underline-offset-8">Denuncia</span></h1>
            <p className="text-muted text-sm mt-3">Protocolo: <span className="font-bold text-dark">{denuncia.protocolo}</span> • Registrado em {new Date((denuncia as any).criado_em).toLocaleDateString()}</p>
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

        {/* Card de Informação Único (Sem Timeline) */}
        <div className="bg-white rounded-card shadow-card-lg border border-border p-8">
           <div className={`p-6 rounded-xl border-l-4 ${status.color.replace('text', 'border')} ${status.bgColor} space-y-2 animate-slide-up`}>
              <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={14} />
                 Confirmação de Registro
              </p>
              <p className="text-sm text-dark/70 font-medium leading-relaxed">
                 {status.desc}
              </p>
           </div>
           <p className="text-[10px] text-muted font-medium mt-6 italic text-center">
             A plataforma DENUNCIA MS atua como canal de oficialização e entrega. 
             O andamento interno da denuncia após o envio é de responsabilidade exclusiva do órgão destinatário.
           </p>
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
                     <p className="text-sm font-bold text-dark italic">{(denuncia as any).categorias?.label}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-muted font-bold uppercase mb-1">Título da Ocorrência</p>
                    <p className="text-sm font-bold text-dark">{denuncia.titulo}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-muted font-bold uppercase mb-1">Localização</p>
                    <p className="text-sm font-medium text-dark leading-relaxed">
                        {denuncia.local}, {denuncia.numero || 'S/N'}<br/>
                        <span className="text-[11px] opacity-60">
                           {denuncia.bairro} — {denuncia.cidade} {denuncia.cep && `(CEP: ${denuncia.cep})`}
                        </span>
                    </p>
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
              <a 
                href={`/api/pdf/download?protocolo=${denuncia.protocolo}&chave=${chaveAcesso}`}
                className="btn-primary w-full gap-2 bg-secondary border-none hover:bg-secondary-600 shadow-glow-green uppercase italic font-black text-sm py-4 flex items-center justify-center"
              >
                 Baixar Documento Original
                 <ExternalLink size={18} />
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}
