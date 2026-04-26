export const dynamic = 'force-dynamic'
import React from 'react'
import { getDenunciaDetalhes } from '@/lib/actions/admin-denuncias'
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  FileText, 
  User, 
  Mail, 
  Phone,
  Paperclip,
  Shield,
  Download,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { StatusActions } from '@/components/admin/status-actions'
import { ExportButton } from '@/components/admin/export-button'

export const metadata = {
  title: 'Detalhes da Denuncia | Painel Admin',
}

export default async function DetalheDenunciaPage({ params }: { params: { id: string } }) {
  const result = await getDenunciaDetalhes(params.id)

  if (!result.success || !result.data) {
    return <div className="p-8 text-error">Erro ao carregar detalhes: {result.error}</div>
  }

  const denuncia = result.data

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin/denuncias" className="inline-flex items-center gap-2 text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest">
           <ChevronLeft size={16} /> Voltar para listagem
        </Link>
        <div className="flex items-center gap-4">
           <ExportButton denuncia={denuncia} />
           <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-amber-50 text-amber-700 border-amber-200">
              Denuncia Identificada
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Conteúdo da Denuncia */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-card shadow-card border border-border overflow-hidden">
              <div className="p-8 space-y-8">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-2xl">{denuncia.categorias?.icon_name}</span>
                       <p className="text-xs font-black text-primary uppercase tracking-widest">{denuncia.categorias?.label}</p>
                    </div>
                    <h1 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">{denuncia.titulo}</h1>
                    <div className="flex items-center gap-6 mt-4 pb-6 border-b border-border">
                       <div className="flex items-center gap-2 text-muted text-xs font-bold">
                          <MapPin size={16} className="text-primary" />
                          {denuncia.local ? (
                            <span>
                               {denuncia.local}, {denuncia.numero || 'S/N'}<br/>
                               <span className="text-[10px] opacity-70">
                                  {denuncia.bairro} — {denuncia.cidade} {denuncia.cep && `(CEP: ${denuncia.cep})`}
                                </span>
                            </span>
                          ) : 'Local não informado'}
                       </div>
                       <div className="flex items-center gap-2 text-muted text-xs font-bold">
                          <Calendar size={16} className="text-primary" />
                          Ocorrido em: {denuncia.data_ocorrido ? new Date(denuncia.data_ocorrido).toLocaleDateString() : 'Não informada'}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h2 className="text-sm font-black text-dark uppercase tracking-widest flex items-center gap-2">
                       <FileText size={18} className="text-primary" />
                       Relato da Ocorrência
                    </h2>
                    <div className="bg-surface/50 p-6 rounded-xl border border-border text-dark leading-relaxed whitespace-pre-wrap font-medium">
                       {denuncia.descricao_original}
                    </div>
                 </div>

                 {denuncia.arquivos_denuncia?.length > 0 && (
                   <div className="space-y-4">
                      <h2 className="text-sm font-black text-dark uppercase tracking-widest flex items-center gap-2">
                        <Paperclip size={18} className="text-primary" />
                        Evidências e Anexos ({denuncia.arquivos_denuncia.length})
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         {denuncia.arquivos_denuncia.map((arq: any) => (
                           <a 
                             key={arq.id} 
                             href={arq.url} 
                             target="_blank" 
                             className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-surface hover:border-primary transition-all shadow-none hover:shadow-card-md"
                           >
                              {arq.tipo === 'foto' ? (
                                <img src={arq.url} alt="Evidência" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted group-hover:text-primary">
                                   <FileText size={32} />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Download size={20} className="text-white" />
                              </div>
                           </a>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Coluna Lateral: Gestão e Dados do Denunciante */}
        <div className="space-y-6">
           {/* Painel de Controle de Status */}
           <div className="bg-dark text-white rounded-card p-6 shadow-glow-cyan border border-white/10 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
                 <Shield size={180} />
              </div>
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest mb-6">Controle Operacional</h3>
              
              <StatusActions 
                denunciaId={denuncia.id} 
                currentStatus={denuncia.status} 
              />
           </div>

           {/* Dados do Denunciante */}
           <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
              <div className="p-4 bg-surface border-b border-border">
                 <h3 className="text-[10px] font-black text-dark uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    Dados do Denunciante
                 </h3>
              </div>
              <div className="p-6 space-y-5">
                 {!denuncia.denunciante_nome ? (
                    <div className="p-6 bg-surface border-2 border-dashed border-border/50 rounded-3xl space-y-4 text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-muted/30">
                        <Lock size={20} />
                      </div>
                      <p className="text-xs text-muted/60 font-medium leading-relaxed">Informações de identidade protegidas por criptografia. Use as chaves de acesso autorizadas para decriptação.</p>
                    </div>
                 ) : (
                   <div className="space-y-4">
                      <div className="flex items-start gap-4">
                         <div className="p-2 bg-primary-50 rounded-lg text-primary">
                            <User size={18} />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-muted uppercase leading-none mb-1">Nome Completo</p>
                            <p className="text-sm font-bold text-dark italic">{denuncia.denunciante_nome}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="p-2 bg-blue-50 rounded-lg text-info">
                            <Mail size={18} />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-muted uppercase leading-none mb-1">E-mail de Contato</p>
                            <p className="text-sm font-bold text-dark">{denuncia.denunciante_email}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="p-2 bg-green-50 rounded-lg text-success">
                            <Phone size={18} />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-muted uppercase leading-none mb-1">Telefone / WhatsApp</p>
                            <p className="text-sm font-bold text-dark">{denuncia.denunciante_telefone}</p>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>

           {/* Timeline Simplificada */}
           <div className="bg-white rounded-card border border-border p-6 shadow-card">
              <h3 className="text-[10px] font-black text-dark uppercase tracking-widest mb-4">Registro do Sistema</h3>
              <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-surface">
                 <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary border-4 border-primary-100"></div>
                    <p className="text-[10px] font-black text-dark uppercase">Denuncia Recebida</p>
                    <p className="text-[9px] text-muted font-bold">{new Date(denuncia.criado_em).toLocaleString()}</p>
                 </div>
                 <div className="relative pl-8 opacity-40">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-surface border-4 border-white"></div>
                    <p className="text-[10px] font-black text-muted uppercase">Documento Finalizado</p>
                    <p className="text-[9px] text-muted font-bold">Processamento Automático</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
