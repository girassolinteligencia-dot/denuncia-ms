'use client'

import React, { useState, useRef } from 'react'
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
  const bottomRef = useRef<HTMLDivElement>(null)

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
  interface NominatimResult {
    display_name: string
    address?: {
      state?: string
    }
  }

  const [sugestoesEndereco, setSugestoesEndereco] = useState<NominatimResult[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(false)

  const handleSearchEndereco = async (query: string) => {
    handleInputChange('local', query)
    
    if (query.length < 4) {
      setSugestoesEndereco([])
      return
    }

    setLoadingEnderecos(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=br&viewbox=-58.16,-24.04,-50.92,-17.15&bounded=1`
      )
      const data = await response.json()
      // Filtro extra opcional para garantir MS caso a viewbox falhe em ser estrita
      const filtered = data.filter((item: NominatimResult) => 
        item.address?.state === 'Mato Grosso do Sul' || 
        item.display_name.includes('Mato Grosso do Sul')
      )
      setSugestoesEndereco(filtered)
    } catch (error) {
      console.error('Erro ao buscar endereços:', error)
    } finally {
      setLoadingEnderecos(false)
    }
  }

  const handleSelectEndereco = (suggestion: NominatimResult) => {
    handleInputChange('local', suggestion.display_name)
    setSugestoesEndereco([])
  }

  const categoriasPorBloco = React.useMemo(() => {
    return categorias.reduce((acc, cat) => {
      const b = cat.bloco || 'Geral'
      if (!acc[b]) acc[b] = []
      acc[b].push(cat)
      return acc
    }, {} as Record<string, Categoria[]>)
  }, [categorias])

  const handleInputChange = (field: keyof DenunciaFormData, value: string | boolean | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Autoscroll para o botão se for categoria
    if (field === 'categoria_id') {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Validação básica
      if (!formData.titulo || !formData.descricao_original) {
        toast.error("Por favor, preencha o título e a descrição.")
        setLoading(false)
        return
      }

      // Prepara os arquivos para a Action
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, arquivos: [...prev.arquivos, ...newFiles] }))
      toast.success(`${newFiles.length} arquivo(s) adicionado(s)`)
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
                         key={cat.slug} 
                         onClick={() => handleInputChange('categoria_id', cat.id)}
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

            <div ref={bottomRef} className="flex justify-end pt-4">
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
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Relato do Ocorrido</h2>
                  <p className="text-muted text-sm font-medium">Conte-nos os detalhes fundamentais para a apuração.</p>
               </div>
               <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-glow-cyan">
                  <FileText size={28} />
               </div>
            </div>

            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {camposVisiveis.map(campo => {
                     if (['nome', 'email', 'telefone', 'cpf'].includes(campo.campo)) return null;

                     return (
                        <div key={campo.id} className="space-y-2">
                           <label className={`label text-[10px] font-black uppercase tracking-widest ${campo.obrigatorio ? 'label-required' : ''}`}>
                              {campo.label}
                           </label>
                           {campo.campo === 'data_ocorrido' ? (
                              <input 
                                type="date" 
                                className="input h-12" 
                                value={formData.data_ocorrido}
                                onChange={(e) => handleInputChange('data_ocorrido', e.target.value)}
                              />
                           ) : campo.campo === 'local' ? (
                              <div className="relative">
                                 <input 
                                   className="input h-12 pr-10" 
                                   placeholder={campo.placeholder || undefined} 
                                   value={formData.local}
                                   onChange={(e) => handleSearchEndereco(e.target.value)}
                                   autoComplete="off"
                                 />
                                 {loadingEnderecos && (
                                   <div className="absolute right-3 top-3.5">
                                      <Loader2 size={18} className="animate-spin text-primary" />
                                   </div>
                                 )}
                                 
                                 {sugestoesEndereco.length > 0 && (
                                   <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
                                      {sugestoesEndereco.map((s, idx) => (
                                         <button
                                           key={idx}
                                           onClick={() => handleSelectEndereco(s)}
                                           className="w-full p-4 text-left hover:bg-surface border-b border-border last:border-none flex items-start gap-3 transition-colors group"
                                         >
                                            <div className="mt-1 p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                               <Camera size={14} />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                               <p className="text-[11px] font-black text-dark uppercase tracking-tighter leading-none mb-1">
                                                  {s.display_name.split(',')[0]}
                                               </p>
                                               <p className="text-[10px] text-muted font-bold truncate">
                                                  {s.display_name}
                                               </p>
                                            </div>
                                         </button>
                                      ))}
                                      <div className="p-2 bg-surface text-center">
                                         <p className="text-[8px] font-black text-muted/50 uppercase tracking-[0.2em]">OpenStreetMap Contributors</p>
                                      </div>
                                   </div>
                                 )}
                              </div>
                           ) : (
                              <input 
                                className="input h-12" 
                                placeholder={campo.placeholder || undefined} 
                                value={(formData as unknown as Record<string, string>)[campo.campo] || ''}
                                onChange={(e) => handleInputChange(campo.campo as keyof DenunciaFormData, e.target.value)}
                              />
                           )
                           }
                        </div>
                     )
                  })}
               </div>

               <div className="space-y-2">
                  <label className="label label-required text-[10px] font-black uppercase tracking-widest">Descrição Detalhada</label>
                  <textarea 
                    className="input min-h-[180px] py-4 leading-relaxed text-sm" 
                    placeholder="Descreva aqui os fatos, pessoas envolvidas e qualquer detalhe que ajude na investigação."
                    value={formData.descricao_original}
                    onChange={(e) => handleInputChange('descricao_original', e.target.value)}
                  />
               </div>

               <div className="p-8 bg-dark text-white rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-secondary/20 rounded-lg">
                        <Lock size={20} className="text-secondary" />
                     </div>
                     <h3 className="font-extrabold text-sm uppercase tracking-tighter">Privacidade e Identificação</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button 
                      onClick={() => handleInputChange('anonima', true)}
                      className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                     >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                           {formData.anonima && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">Manter Anônimo</span>
                     </button>

                     <button 
                      onClick={() => handleInputChange('anonima', false)}
                      className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${!formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                     >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                           {!formData.anonima && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">Identificar-me</span>
                     </button>
                  </div>

                  {!formData.anonima && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-slide-up">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/40 uppercase pl-1">Nome Completo</p>
                          <input 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                            placeholder="Seu nome completo" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                          />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/40 uppercase pl-1">E-mail para Contato</p>
                          <input 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                            placeholder="seu@email.com" 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center justify-between pt-6">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={() => {
                   if (!formData.titulo || !formData.descricao_original) {
                      toast.error("Preencha o título e a descrição")
                      return
                   }
                   handleNext()
                }}
                className="btn-primary btn-lg gap-3 min-w-[200px]"
               >
                  Enviar Evidências
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Provas & Evidências</h2>
                  <p className="text-muted text-sm font-medium">Anexe fotos, vídeos ou documentos que ajudem no caso.</p>
               </div>
               <div className="p-4 bg-electric/10 text-electric rounded-2xl border border-electric/20 shadow-glow-cyan">
                  <Camera size={28} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {politicasArquivo.filter(t => t.ativo).map(tipo => (
                 <label 
                  key={tipo.tipo} 
                  className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface hover:border-primary/50 transition-all cursor-pointer group"
                 >
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    <div className="p-4 bg-surface rounded-full text-muted group-hover:text-primary transition-colors">
                       <Paperclip size={28} />
                    </div>
                    <div>
                       <p className="font-extrabold text-dark uppercase text-xs tracking-tight">Anexar {tipo.tipo}</p>
                       <p className="text-[10px] text-muted font-bold mt-1">Até {tipo.qtd_maxima} arquivos de {tipo.tamanho_max_mb}MB</p>
                    </div>
                 </label>
               ))}
            </div>

            {formData.arquivos.length > 0 && (
               <div className="bg-surface rounded-2xl p-4 space-y-2 border border-border">
                  <p className="text-[10px] font-black uppercase text-secondary">Arquivos Selecionados ({formData.arquivos.length})</p>
                  <div className="flex flex-wrap gap-2">
                     {formData.arquivos.map((f, i) => (
                        <div key={i} className="px-3 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold flex items-center gap-2">
                           <FileText size={12} className="text-primary" />
                           <span className="truncate max-w-[100px]">{f.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 text-primary-900 text-xs leading-relaxed">
               <ShieldCheck size={24} className="shrink-0 text-primary" />
               <p className="font-medium">Seus arquivos serão criptografados e armazenados em servidores seguros de alta disponibilidade em Mato Grosso do Sul. Anonimato técnico garantido.</p>
            </div>

            <div className="flex items-center justify-between pt-6">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary btn-lg gap-3 min-w-[280px] bg-secondary hover:bg-secondary-600 border-none shadow-glow-green"
               >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      PROTOCOLAR DENÚNCIA
                      <Send size={20} />
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
