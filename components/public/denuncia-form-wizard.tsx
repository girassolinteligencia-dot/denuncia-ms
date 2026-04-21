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
  Camera,
  Shield,
  AlertTriangle
} from 'lucide-react'
import type { Categoria, ConfigCampoFormulario, ConfigTipoArquivo } from '@/types'
import { registrarDenuncia } from '@/lib/actions/denuncia'
import { solicitarCodigoOTP } from '@/lib/actions/auth'
import { buscarCEP } from '@/lib/actions/cep'
import { toast } from 'sonner'
import Link from 'next/link'

interface DenunciaFormData {
  categoria_id: string
  titulo: string
  local: string
  cep: string
  numero: string
  bairro: string
  cidade: string
  data_ocorrido: string
  descricao_original: string
  anonima: boolean
  nome: string
  email: string
  telefone: string
  cpf: string
  arquivos: File[]
  consentimento: boolean
  otpToken: string
}

interface Props {
  categorias: Categoria[]
  campos: ConfigCampoFormulario[]
  politicasArquivo: ConfigTipoArquivo[]
}

export const DenunciaFormWizard: React.FC<Props> = ({ categorias, campos, politicasArquivo }) => {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('categoria')

  const allowAnonymous = process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS !== 'false';
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null)
  const [chaveGerada, setChaveGerada] = useState<string | null>(null)
  const [otpEnviado, setOtpEnviado] = useState(false)
  const [loadingOtp, setLoadingOtp] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<DenunciaFormData>({
    categoria_id: categorias.find(c => c.slug === initialCat)?.id || '',
    titulo: '',
    local: '',
    cep: '',
    numero: '',
    bairro: '',
    cidade: '',
    data_ocorrido: '',
    descricao_original: '',
    anonima: true,
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    arquivos: [] as File[],
    consentimento: false,
    otpToken: ''
  })

  // Filtra campos visíveis
  const camposVisiveis = campos.filter(c => c.visivel).sort((a, b) => a.ordem - b.ordem)
  
  // Agrupa as categorias por bloco para exibição organizada
  interface NominatimResult {
    display_name: string
    address?: {
      road?: string
      house_number?: string
      suburb?: string
      neighbourhood?: string
      city?: string
      town?: string
      village?: string
      state?: string
      postcode?: string
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
    const addr = suggestion.address
    const road = addr?.road || suggestion.display_name.split(',')[0]
    const cidade = addr?.city || addr?.town || addr?.village || ''
    const bairro = addr?.suburb || addr?.neighbourhood || ''
    const cep = addr?.postcode || ''
    const numero = addr?.house_number || ''

    setFormData(prev => ({
      ...prev,
      local: road,
      cidade: cidade || prev.cidade,
      bairro: bairro || prev.bairro,
      cep: cep || prev.cep,
      numero: numero || prev.numero
    }))
    
    setSugestoesEndereco([])
  }

  const handleCepChange = async (cep: string) => {
    // Máscara simples
    const raw = cep.replace(/\D/g, '')
    let formatted = raw
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5, 8)}`
    }
    
    handleInputChange('cep', formatted)

    if (raw.length === 8) {
      setLoadingEnderecos(true)
      try {
        const result = await buscarCEP(raw)
        if (result.success && result.data) {
          const { data } = result
          setFormData(prev => ({
            ...prev,
            local: data.logradouro || prev.local,
            bairro: data.bairro || prev.bairro,
            cidade: data.cidade || prev.cidade,
            cep: formatted
          }))
          toast.success('Endereço preenchido via CEP!')
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      } finally {
        setLoadingEnderecos(false)
      }
    }
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
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }

  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleNext = () => {
    setStep(s => s + 1)
    scrollToTop()
  }
  const handleBack = () => {
    setStep(s => s - 1)
    scrollToTop()
  }

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
        setChaveGerada(result.chaveAcesso)
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

  // --- TELA DE SUCESSO ---
  if (protocoloGerado) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-fade-in px-4">
         <div className="w-24 h-24 bg-secondary text-white rounded-full flex items-center justify-center mx-auto shadow-glow-green transform scale-110">
            <CheckCircle2 size={48} />
         </div>
         <div className="space-y-2">
            <h2 className="text-3xl font-black text-dark tracking-tighter uppercase italic">Protocolo Realizado!</h2>
            <p className="text-muted text-sm font-medium">Sua denúncia foi enviada com sucesso para a Ouvidoria MS.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-border shadow-card-sm space-y-4">
               <p className="text-[10px] text-muted font-black uppercase tracking-widest">Número do Protocolo</p>
               <div className="text-xl font-black text-dark tracking-wider select-all bg-surface p-3 rounded-xl border border-border/50">
                  {protocoloGerado}
               </div>
            </div>
            <div className="bg-primary p-6 rounded-3xl shadow-glow-cyan space-y-4">
               <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Chave de Acesso</p>
               <div className="text-xl font-black text-white tracking-widest select-all bg-white/10 p-3 rounded-xl border border-white/20">
                  {chaveGerada}
               </div>
            </div>
         </div>

         <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4 text-left">
            <Lock size={24} className="text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-900 font-bold leading-relaxed">
               <span className="block text-amber-950 mb-1">ATENÇÃO: ANOTE ESTES DADOS!</span>
               Por motivos de segurança e para garantir seu total anonimato, estas credenciais são geradas apenas uma vez e são a única forma de consultar o andamento da sua denúncia.
            </p>
         </div>

         <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/" className="btn-outline flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
               Voltar ao Início
            </Link>
            <Link href="/acompanhar" className="btn-primary flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-dark border-none hover:bg-black">
               Consultar Status
            </Link>
         </div>
      </div>
    )
  }

  // Helper para renderizar o resumo da revisão
  const currentCategory = categorias.find(c => c.id === formData.categoria_id)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-12 relative px-4">
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>
         {[1, 2, 3, 4, 5].map(s => (
           <div key={s} className="flex flex-col items-center gap-2 text-center w-12 sm:w-16">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex mx-auto items-center justify-center font-bold text-sm transition-all border-2 ${step >= s ? 'bg-primary border-primary text-white shadow-glow-cyan' : 'bg-white border-border text-muted'}`}>
                 {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-muted/50'}`}>
                 {s === 1 ? 'Tipo' : s === 2 ? 'O Que' : s === 3 ? 'Onde' : s === 4 ? 'Provas' : 'Revisão'}
              </span>
           </div>
         ))}
      </div>

      <div ref={topRef} className="card shadow-card-lg border-t-4 border-primary">
        
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
                   <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3">
                      {cats.map(cat => (
                        <button 
                         key={cat.slug} 
                         onClick={() => handleInputChange('categoria_id', cat.id)}
                         className={`p-2 sm:p-4 rounded-xl border-2 text-center sm:text-left transition-all flex flex-col sm:flex-row items-center gap-2 sm:gap-4 group ${formData.categoria_id === cat.id ? 'border-primary bg-primary-50 ring-2 ring-primary/10' : 'border-border hover:border-primary/30 hover:bg-surface'}`}
                        >
                           <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                              {cat.emoji}
                           </div>
                           <div className="flex-grow min-w-0">
                              <h4 className="font-extrabold text-[9px] sm:text-xs text-dark uppercase tracking-tight leading-tight sm:truncate">{cat.label}</h4>
                              <p className="hidden sm:block text-[9px] text-muted font-bold truncate mt-1">
                                 {cat.instrucao_publica}
                              </p>
                           </div>
                           {formData.categoria_id === cat.id && (
                              <div className="hidden sm:block flex-shrink-0 text-primary">
                                 <CheckCircle2 size={16} />
                              </div>
                           )}
                        </button>
                      ))}
                   </div>
                 </div>
               ))}
            </div>

            {formData.categoria_id && currentCategory?.aviso_legal && (
               <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex gap-4 animate-fade-in shadow-sm">
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl h-fit">
                     <AlertTriangle size={24} className="fill-amber-700/10" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                        Atendimento de Emergência & Urgência
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                     </p>
                     <p className="text-sm font-black text-amber-800 leading-tight">
                        {currentCategory?.aviso_legal}
                     </p>
                     <p className="text-[9px] text-amber-700/60 font-bold uppercase mt-1">Se houver risco imediato à vida, acione os órgãos acima antes de prosseguir com o relato digital.</p>
                  </div>
               </div>
            )}

            <div ref={bottomRef} className="flex justify-end pt-4">
               <button 
                onClick={handleNext}
                disabled={!formData.categoria_id}
                className="btn-primary btn-md sm:btn-lg gap-2 w-full sm:w-auto sm:min-w-[200px]"
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
               <div className="space-y-6">
                  {/* Campos dinâmicos (não-endereço, não-identificação) */}
                  {camposVisiveis.map(campo => {
                     const isEndereco = ['local', 'numero', 'bairro', 'cidade', 'cep'].includes(campo.campo);
                     const isIdentificacao = ['nome', 'email', 'telefone', 'cpf'].includes(campo.campo);
                     
                     if (isEndereco || isIdentificacao || campo.campo === 'data_ocorrido') return null;

                     return (
                        <div key={campo.id} className="space-y-2">
                           <label className={`label text-[10px] font-black uppercase tracking-widest ${campo.obrigatorio ? 'label-required' : ''}`}>
                              {campo.label}
                           </label>
                           <input 
                             className="input h-12" 
                             placeholder={campo.placeholder || undefined} 
                             value={(formData as unknown as Record<string, string>)[campo.campo] || ''}
                             onChange={(e) => handleInputChange(campo.campo as keyof DenunciaFormData, e.target.value)}
                           />
                        </div>
                     )
                  })}

                  {/* Data do Ocorrido */}
                  {camposVisiveis.find(c => c.campo === 'data_ocorrido') && (
                     <div className="space-y-2">
                        <label className="label text-[10px] font-black uppercase tracking-widest label-required">Data do Ocorrido</label>
                        <input 
                          type="date" 
                          className="input h-12" 
                          value={formData.data_ocorrido}
                          onChange={(e) => handleInputChange('data_ocorrido', e.target.value)}
                        />
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="label label-required text-[10px] font-black uppercase tracking-widest">Descrição Detalhada</label>
                     <textarea 
                       className="input min-h-[180px] py-4 leading-relaxed text-sm" 
                       placeholder="Descreva aqui os fatos, pessoas envolvidas e qualquer detalhe que ajude na investigação."
                       value={formData.descricao_original}
                       onChange={(e) => handleInputChange('descricao_original', e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-6">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={() => {
                   if (!formData.titulo || !formData.descricao_original) {
                      toast.error("Preencha o título e a descrição principal")
                      return
                   }
                   handleNext()
                }}
                className="btn-primary btn-md sm:btn-lg gap-2 min-w-[200px]"
               >
                  Localização da Ocorrência
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Localização</h2>
                  <p className="text-muted text-sm font-medium">Onde o fato aconteceu? Comece pelo CEP.</p>
               </div>
               <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-glow-cyan">
                  <FileText size={28} />
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="label text-[10px] font-black uppercase tracking-widest label-required">CEP (Preenchimento Automático)</label>
                  <input 
                    className="input h-14 text-lg font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal" 
                    placeholder="00000-000" 
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  {loadingEnderecos && <p className="text-[10px] font-bold text-primary animate-pulse">Buscando endereço localmente...</p>}
               </div>
            
               <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3 relative">
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Local / Rua / Logradouro</label>
                     <input 
                       className="input h-12 pr-10" 
                       placeholder="Ex: Av. Afonso Pena" 
                       value={formData.local}
                       onChange={(e) => handleSearchEndereco(e.target.value)}
                       autoComplete="off"
                     />
                     {sugestoesEndereco.length > 0 && (
                       <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary shadow-2xl rounded-2xl overflow-hidden animate-slide-up">
                          {sugestoesEndereco.map((s, idx) => (
                             <button
                               key={idx}
                               type="button"
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
                       </div>
                     )}
                  </div>
                  <div className="sm:col-span-1">
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Número</label>
                     <input 
                       className="input h-12" 
                       placeholder="Ex: 123" 
                       value={formData.numero}
                       onChange={(e) => handleInputChange('numero', e.target.value)}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Bairro</label>
                     <input 
                       className="input h-12" 
                       placeholder="Ex: Centro" 
                       value={formData.bairro}
                       onChange={(e) => handleInputChange('bairro', e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Cidade / Município</label>
                     <input 
                       className="input h-12" 
                       placeholder="Ex: Campo Grande" 
                       value={formData.cidade}
                       onChange={(e) => handleInputChange('cidade', e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-6">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleNext}
                className="btn-primary btn-md sm:btn-lg gap-2 min-w-[200px]"
               >
                  Enviar Evidências
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Provas & Evidências</h2>
                  <p className="text-muted text-sm font-medium">Anexe fotos, vídeos ou documentos que ajudem no caso.</p>
               </div>
               <div className="text-primary">
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
                    <div className="text-muted group-hover:text-primary transition-colors">
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

            <div className="p-6 bg-surface border border-border rounded-2xl flex gap-4 text-muted text-xs leading-relaxed">
               <ShieldCheck size={24} className="shrink-0 text-primary" />
               <p className="font-medium">Seus arquivos serão criptografados e armazenados em servidores seguros de alta disponibilidade em Mato Grosso do Sul. Anonimato técnico garantido.</p>
            </div>

            <div className="flex items-center justify-between pt-6 gap-4">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleNext}
                className="btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[280px] bg-dark hover:bg-black border-none"
               >
                  Ir Para Identificação & Revisão
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase text-primary">Privacidade e Revisão Final</h2>
                  <p className="text-muted text-sm font-medium">Configure seu anonimato e confira os dados antes de gerar o protocolo.</p>
               </div>
               <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <ShieldCheck size={32} />
               </div>
            </div>

            {/* Configuração de Privacidade */}
            <div className="p-8 bg-dark text-white rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
               
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                     <Lock size={20} className="text-secondary" />
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-tighter">Nível de Sigilo Desejado</h3>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allowAnonymous && (
                    <button 
                     onClick={() => { handleInputChange('anonima', true); setOtpEnviado(false); }}
                     className={`p-4 rounded-xl border-2 flex flex-col items-start gap-1 transition-all ${formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                       <div className="flex items-center gap-3 w-full">
                         <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                            {formData.anonima && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest leading-tight text-left">Manter Anônimo</span>
                       </div>
                    </button>
                  )}

                  <button 
                   onClick={() => handleInputChange('anonima', false)}
                   className={`p-4 rounded-xl border-2 flex flex-col gap-1 transition-all ${!formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'} ${!allowAnonymous ? 'col-span-2' : ''}`}
                  >
                     <div className="flex items-center gap-3 w-full">
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                          {!formData.anonima && <div className="w-2 h-2 rounded-full bg-white"></div>}
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-widest leading-tight text-left">Identificar-me</span>
                     </div>
                  </button>
               </div>

               {/* Nudges Psicológicos */}
               {formData.anonima && allowAnonymous && (
                 <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl animate-fade-in flex gap-3">
                   <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                   <p className="text-[11px] text-amber-200/90 leading-tight">
                     <strong>Atenção:</strong> Ao optar pelo anonimato, você não receberá e-mails automáticos com as resoluções do caso, e a Equipe da plataforma DenunciaMS não terá como solicitar mais provas ou detalhes. Isso pode causar o arquivamento da investigação por falta de dados básicos.
                   </p>
                 </div>
               )}

               {!allowAnonymous && formData.anonima === false && (
                 <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-2xl animate-fade-in flex gap-3">
                   <ShieldCheck className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                   <p className="text-[11px] text-blue-200/90 leading-tight">
                     Por exigência das diretrizes de responsabilização vigentes para este canal, a identificação mínima autenticada foi tornada obrigatória, garantindo-se o total sigilo da sua identidade (LAI).
                   </p>
                 </div>
               )}

               {!formData.anonima && (
                 <div className="space-y-4 pt-2 animate-slide-up">
                    <p className="text-[10px] text-white/60 leading-tight border-l-2 border-secondary/50 pl-3">
                      A Equipe da plataforma DenunciaMS aplica técnicas de pseudonimização. Seus dados são legalmente protegidos (Art. 31, §1º, I da LAI) e ocultados no relato principal. A identificação mínima blinda o canal contra fraudes e acelera o tratamento sério da sua denúncia.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/40 uppercase pl-1">Nome Completo</p>
                          <input 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                            placeholder="Seu nome completo" 
                            disabled={otpEnviado}
                            value={formData.nome || ''}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                          />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/40 uppercase pl-1">E-mail (Para Receber o Código)</p>
                          <input 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                            placeholder="seu@email.com" 
                            disabled={otpEnviado}
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                       </div>
                    </div>

                    {/* Bloco de OTP */}
                    <div className="pt-2">
                      {!otpEnviado ? (
                        <button 
                          onClick={async () => {
                            if (!formData.email || !formData.email.includes('@')) {
                               toast.error('Informe um e-mail válido.'); return;
                            }
                            if (!formData.nome || formData.nome.length < 3) {
                               toast.error('Informe seu nome.'); return;
                            }
                            setLoadingOtp(true);
                            const res = await solicitarCodigoOTP(formData.email, formData.nome);
                            setLoadingOtp(false);
                            if (res.success) {
                               setOtpEnviado(true);
                               toast.success('Código enviado! Verifique sua caixa de entrada.');
                            } else {
                               toast.error(res.error || 'Erro ao enviar código.');
                            }
                          }}
                          disabled={loadingOtp || !formData.email || !formData.nome}
                          className="w-full bg-secondary/20 hover:bg-secondary/30 text-secondary font-black uppercase text-[11px] tracking-widest p-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                           {loadingOtp ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                           Solicitar Código de Segurança
                        </button>
                      ) : (
                        <div className="bg-white/10 border border-secondary/30 p-4 rounded-xl space-y-3 animate-fade-in">
                           <p className="text-[11px] font-black uppercase tracking-widest text-secondary text-center">Código Enviado</p>
                           <p className="text-[10px] text-white/70 text-center leading-tight">Enviamos um PIN de 6 dígitos para {formData.email}. Insira-o abaixo para validar sua identidade.</p>
                           <input 
                              className="bg-black/20 border border-white/20 rounded-xl p-4 text-center text-2xl font-black tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-secondary w-full max-w-[200px] mx-auto block uppercase" 
                              placeholder="000000" 
                              maxLength={6}
                              value={formData.otpToken || ''}
                              onChange={(e) => handleInputChange('otpToken', e.target.value.replace(/\D/g, ''))}
                           />
                           <button onClick={() => setOtpEnviado(false)} className="text-[9px] text-white/40 uppercase hover:text-white mx-auto block pt-2 underline">Mudar E-mail / Reenviar</button>
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-4">
               {/* Resumo Card */}
               <div className="bg-surface rounded-3xl p-6 border border-border space-y-6">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                     <span className="text-4xl">{currentCategory?.emoji}</span>
                     <div>
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Categoria Selecionada</p>
                        <h4 className="text-lg font-black text-dark leading-tight">{currentCategory?.label}</h4>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Localização</p>
                        <p className="font-bold text-dark">{formData.local}, {formData.numero}</p>
                        <p className="text-xs text-muted font-medium">{formData.bairro} — {formData.cidade} / MS (CEP {formData.cep})</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Fato</p>
                        <h5 className="font-black text-dark text-base">{formData.titulo}</h5>
                     </div>
                  </div>

                  {formData.arquivos.length > 0 && (
                     <div className="pt-4 border-t border-border flex items-center justify-between">
                         <p className="text-[10px] font-black uppercase text-muted tracking-widest">Evidências Anexadas</p>
                         <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black">{formData.arquivos.length} ARQUIVO(S)</span>
                     </div>
                  )}
               </div>

               {/* Seção de Consentimento Jurídico */}
               <div className={`p-6 rounded-2xl border transition-all ${formData.consentimento ? 'bg-white border-primary shadow-glow-cyan' : 'bg-surface border-border'}`}>
                  <label className="flex items-start gap-4 cursor-pointer group">
                     <div className="pt-1">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary transition-all cursor-pointer"
                          checked={formData.consentimento}
                          onChange={(e) => handleInputChange('consentimento', e.target.checked)}
                        />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[11px] font-black text-dark uppercase tracking-widest flex items-center gap-2">
                           Termo de Responsabilidade e Ciência
                           <Shield size={14} className="text-primary" />
                        </p>
                        <ul className="text-[10px] text-muted leading-relaxed font-bold space-y-1">
                           <li>• Declaro estar ciente de que sou o único responsável pela veracidade dos fatos narrados.</li>
                           <li>• O uso de má-fé neste canal ou denúncia falsa são crimes (Arts. 339 e 340 do Código Penal).</li>
                           <li>• Compreendo que a Equipe da plataforma DenunciaMS atua como facilitador e encaminha dados aos órgãos competentes.</li>
                        </ul>
                     </div>
                  </label>
               </div>
            </div>

            <div className="flex items-center justify-between pt-6 gap-4">
               <button onClick={handleBack} disabled={loading} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar para Alterar
               </button>
               <button 
                onClick={() => {
                   if (!formData.consentimento) {
                      toast.error("Você precisa concordar com os termos de responsabilidade para protocolar.")
                      return
                   }
                   if (!allowAnonymous) formData.anonima = false;
                   if (!formData.anonima && (!formData.otpToken || formData.otpToken.length !== 6)) {
                      toast.error("Efetue a validação do código de segurança recebido no e-mail.")
                      return
                   }
                   handleSubmit()
                }}
                disabled={loading || !formData.consentimento || (!formData.anonima && (!formData.otpToken || formData.otpToken.length !== 6))}
                className={`btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[300px] bg-secondary hover:bg-secondary-600 border-none shadow-glow-green transition-all ${!formData.consentimento || (!formData.anonima && (!formData.otpToken || formData.otpToken.length !== 6)) ? 'opacity-50 grayscale' : ''}`}
               >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      CONFIRMAR E PROTOCOLAR
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
