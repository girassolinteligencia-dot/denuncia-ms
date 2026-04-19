'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ShieldCheck, 
  FileText, 
  Paperclip, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Send,
  Lock,
  Camera
} from 'lucide-react'
import type { Categoria, ConfigCampoFormulario, ConfigTipoArquivo } from '@/types'
import { registrarDenuncia } from '@/lib/actions/denuncia'
import { toast } from 'sonner'
import Link from 'next/link'

interface DenunciaFormData {
  categoria_id: string
  titulo: string
  local: string
  data_ocorrido: string
  descricao_original: string
  anonima: boolean
  nome: string
  email: string
  telefone: string
  cpf: string
  arquivos: File[]
}

interface Props {
  categorias: Categoria[]
  campos: ConfigCampoFormulario[]
  politicasArquivo: ConfigTipoArquivo[]
}

export const DenunciaFormWizard: React.FC<Props> = ({ categorias, campos, politicasArquivo }) => {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('categoria')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null)

  const [formData, setFormData] = useState<DenunciaFormData>({
    categoria_id: categorias.find(c => c.slug === initialCat)?.id || '',
    titulo: '',
    local: '',
    data_ocorrido: '',
    descricao_original: '',
    anonima: true,
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    arquivos: [] as File[]
  })

  // Filtra campos visíveis
  const camposVisiveis = campos.filter(c => c.visivel).sort((a, b) => a.ordem - b.ordem)
  
  // Agrupa as categorias por bloco para exibição organizada
  const categoriasPorBloco = React.useMemo(() => {
    return categorias.reduce((acc, cat) => {
      const b = cat.bloco || 'Geral'
      if (!acc[b]) acc[b] = []
      acc[b].push(cat)
      return acc
    }, {} as Record<string, Categoria[]>)
  }, [categorias])

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Prepara os arquivos para a Action (precisam ser buffers ou FormData)
      const arquivosFiles = formData.arquivos as File[]
      const bufferData = await Promise.all(arquivosFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        return {
          name: file.name,
          type: file.type,
          buffer: Buffer.from(arrayBuffer)
        }
      }))

      const result = await registrarDenuncia(formData, bufferData)

      if (result.success && result.protocolo) {
        setProtocoloGerado(result.protocolo)
        setStep(4)
        toast.success("Denúncia registrada com sucesso!")
      } else {
        toast.error(result.error || "Erro ao registrar denúncia")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erro inesperado no envio")
    } finally {
      setLoading(false)
    }
  }

  if (step === 4) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-8 animate-fade-in">
         <div className="w-24 h-24 bg-secondary text-white rounded-full flex items-center justify-center mx-auto shadow-glow-green transform scale-125">
            <CheckCircle2 size={48} />
         </div>
         <div className="space-y-2">
            <h2 className="text-3xl font-black text-dark">Denúncia Protocolada!</h2>
            <p className="text-muted text-sm">Sua denúncia foi recebida e encaminhada aos órgãos responsáveis.</p>
         </div>

         <div className="bg-dark p-8 rounded-card border-t-4 border-secondary shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 text-white/5 group-hover:text-white/10 transition-colors">
               <ShieldCheck size={120} />
            </div>
            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em] mb-4">Número do seu Protocolo</p>
            <div className="text-4xl font-black text-white tracking-widest">{protocoloGerado}</div>
            <p className="text-[10px] text-white/40 mt-6 uppercase font-bold">Guarde esse código para acompanhar o status</p>
         </div>

         <div className="flex flex-col gap-3 pt-8">
            <button className="btn-primary w-full h-12 gap-2 bg-secondary hover:bg-secondary-600 border-none">
               Baixar PDF da Denúncia
            </button>
            <Link href="/" className="btn-ghost text-xs uppercase font-bold tracking-widest">
               Voltar ao Início
            </Link>
         </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-12 relative px-4">
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>
         {[1, 2, 3].map(s => (
           <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step >= s ? 'bg-primary border-primary text-white shadow-glow-cyan' : 'bg-white border-border text-muted'}`}>
                 {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-muted/50'}`}>
                 {s === 1 ? 'Categoria' : s === 2 ? 'Detalhes' : 'Evidências'}
              </span>
           </div>
         ))}
      </div>

      <div className="card shadow-card-lg border-t-4 border-primary">
        
        {step === 1 && (
          <div className="space-y-8 animate-slide-up">
            <div>
               <h2 className="text-xl font-black text-dark tracking-tight">O que você deseja reportar?</h2>
               <p className="text-muted text-sm">Selecione a categoria que melhor descreve o ocorrido.</p>
            </div>

            <div className="space-y-12">
               {Object.entries(categoriasPorBloco).map(([bloco, cats]) => (
                 <div key={bloco} className="space-y-4">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 border-l-4 border-secondary pl-3">
                      Bloco: {bloco}
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cats.map(cat => (
                        <button 
                         key={cat.slug} // Usando slug como key para evitar problemas se ids mudarem
                         onClick={() => setFormData({ ...formData, categoria_id: cat.id })}
                         className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 group ${formData.categoria_id === cat.id ? 'border-primary bg-primary-50 ring-2 ring-primary/10' : 'border-border hover:border-primary/30 hover:bg-surface'}`}
                        >
                           <div className="text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                              {cat.emoji}
                           </div>
                           <div className="flex-grow min-w-0">
                              <h4 className="font-extrabold text-xs text-dark uppercase tracking-tight leading-tight truncate">{cat.label}</h4>
                              <p className="text-[9px] text-muted font-bold truncate mt-1">
                                 {cat.instrucao_publica}
                              </p>
                           </div>
                           {formData.categoria_id === cat.id && (
                              <div className="flex-shrink-0 text-primary">
                                 <CheckCircle2 size={16} />
                              </div>
                           )}
                        </button>
                      ))}
                   </div>
                 </div>
               ))}
            </div>

            <div className="flex justify-end pt-4">
               <button 
                onClick={handleNext}
                disabled={!formData.categoria_id}
                className="btn-primary btn-lg gap-2 min-w-[200px]"
               >
                  Próximo Passo
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black text-dark tracking-tight italic">Relato do Ocorrido</h2>
                  <p className="text-muted text-sm">Conte-nos os detalhes do que aconteceu.</p>
               </div>
               <div className="p-3 bg-secondary/5 text-secondary rounded-xl border border-secondary/10">
                  <FileText size={24} />
               </div>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {camposVisiveis.map(campo => {
                     // Lógica simplificada de render de campos dinâmicos
                     if (['nome', 'email', 'telefone', 'cpf'].includes(campo.campo)) return null;

                     return (
                        <div key={campo.id} className="space-y-2">
                           <label className={`label ${campo.obrigatorio ? 'label-required' : ''}`}>
                              {campo.label}
                           </label>
                           {campo.campo === 'data_ocorrido' ? (
                              <input type="date" className="input" />
                           ) : (
                              <input className="input" placeholder={campo.placeholder || undefined} />
                           )
                           }
                        </div>
                     )
                  })}
               </div>

               <div>
                  <label className="label label-required">Descrição Detalhada</label>
                  <textarea 
                    className="input min-h-[150px] py-4 leading-relaxed" 
                    placeholder="Descreva aqui os fatos, pessoas envolvidas e qualquer detalhe que ajude na investigação."
                  />
               </div>

               <div className="p-6 bg-dark text-white rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                     <Lock size={18} className="text-secondary" />
                     <h3 className="font-bold text-sm">Deseja manter o anonimato?</h3>
                  </div>
                  <div className="flex items-center gap-6">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                           {formData.anonima && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <input 
                         type="radio" 
                         className="hidden" 
                         checked={formData.anonima} 
                         onChange={() => setFormData({...formData, anonima: true})} 
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-white">Sim, manter anônimo</span>
                     </label>

                     <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                           {!formData.anonima && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <input 
                         type="radio" 
                         className="hidden" 
                         checked={!formData.anonima} 
                         onChange={() => setFormData({...formData, anonima: false})} 
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Não, identificar-me</span>
                     </label>
                  </div>

                  {!formData.anonima && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-fade-in">
                       <input className="bg-white/5 border border-white/10 rounded-btn p-3 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Seu nome completo" />
                       <input className="bg-white/5 border border-white/10 rounded-btn p-3 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Seu e-mail" />
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center justify-between pt-4">
               <button onClick={handleBack} className="btn-ghost flex items-center gap-2 text-xs uppercase font-black">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleNext}
                className="btn-primary btn-lg gap-2 min-w-[200px]"
               >
                  Enviar Evidências
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black text-dark tracking-tight">Fotos, Vídeos e Áudios</h2>
                  <p className="text-muted text-sm">Anexe provas que ajudem a fundamentar sua denúncia.</p>
               </div>
               <div className="p-3 bg-electric/5 text-electric rounded-xl border border-electric/10">
                  <Camera size={24} />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {politicasArquivo.filter(t => t.ativo).map(tipo => (
                 <div key={tipo.tipo} className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface hover:border-primary/30 transition-all cursor-pointer">
                    <div className="p-3 bg-surface rounded-full text-muted group-hover:text-primary">
                       <Paperclip size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-dark uppercase text-xs">Anexar {tipo.tipo}</p>
                       <p className="text-[10px] text-muted">Até {tipo.qtd_maxima} arquivos de {tipo.tamanho_max_mb}MB</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 text-primary-700 text-xs">
               <ShieldCheck size={20} className="shrink-0" />
               <p>Seus arquivos serão criptografados e armazenados em servidores seguros. Metadados de localização de fotos são preservados para fins de auditoria interna, caso necessário.</p>
            </div>

            <div className="flex items-center justify-between pt-4">
               <button onClick={handleBack} className="btn-ghost flex items-center gap-2 text-xs uppercase font-black">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary btn-lg gap-2 min-w-[250px] bg-secondary hover:bg-secondary-600 border-none shadow-glow-green"
               >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      PROTOCOLAR DENÚNCIA
                      <Send size={18} />
                    </>
                  )}
               </button>
            </div>
          </div>
        )}

      </div>
      
      <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-muted font-black uppercase tracking-[0.2em]">
         <Lock size={14} className="text-secondary" />
         Conexão Criptografada SSL/TLS
      </div>
    </div>
  )
}
