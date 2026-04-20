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
  const [chaveGerada, setChaveGerada] = useState<string | null>(null)
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
    consentimento: false
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
         {[1, 2, 3, 4].map(s => (
           <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step >= s ? 'bg-primary border-primary text-white shadow-glow-cyan' : 'bg-white border-border text-muted'}`}>
                 {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-muted/50'}`}>
                 {s === 1 ? 'Tipo' : s === 2 ? 'Fatos' : s === 3 ? 'Anexos' : 'Revisão'}
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bloco de Endereço Consolidado */}
                  <div className="md:col-span-2 space-y-4">
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
                           {loadingEnderecos && (
                             <div className="absolute right-3 top-10">
                                <Loader2 size={18} className="animate-spin text-primary" />
                             </div>
                           )}
                           
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

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div>
                           <label className="label text-[10px] font-black uppercase tracking-widest label-required">CEP</label>
                           <input 
                             className="input h-12" 
                             placeholder="00000-000" 
                             value={formData.cep}
                             onChange={(e) => handleInputChange('cep', e.target.value)}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Outros campos dinâmicos que não sejam de endereço ou identificação */}
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

                  {/* Data do Ocorrido (Sempre visível se configurada) */}
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
               </div>

               <div className="space-y-2">
                  <label className="label label-required text-[10px] font-black uppercase tracking-widest">Descrição Detalhada</label>
                  <textarea 
                    className="input min-h-[180px] py-4 leading-relaxed text-sm" 
                    placeholder="Descreva aqui os fatos, pessoas envolvidas, endereços e qualquer detalhe que ajude na investigação."
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

               {/* Seção de Consentimento Jurídico (LAI/LGPD) */}
               <div className={`mt-6 p-6 rounded-2xl border transition-all ${formData.consentimento ? 'bg-white border-primary' : 'bg-surface border-border'}`}>
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
                        <p className="text-[10px] text-muted leading-relaxed font-bold text-justify">
                           Ao prosseguir, declaro estar ciente de que sou o único responsável pela veracidade dos fatos narrados e pela autenticidade das evidências anexadas, sob as penas da lei. 
                           Compreendo que esta plataforma atua exclusivamente como meio de conexão e encaminhamento da denúncia aos órgãos competentes 
                           (conforme <Link href="/termos" target="_blank" className="text-primary underline">Lei nº 12.527/2011 - LAI</Link> e <Link href="/termos" target="_blank" className="text-primary underline">Lei nº 13.709/2018 - LGPD</Link>), não possuindo responsabilidade sobre o teor da denúncia ou sobre a conduta das partes envolvidas.
                        </p>
                     </div>
                  </label>
               </div>
            </div>

            <div className="flex items-center justify-between pt-6 gap-4">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={() => {
                   if (!formData.titulo || !formData.descricao_original) {
                      toast.error("Preencha o título e a descrição")
                       return
                   }
                   if (!formData.consentimento) {
                      toast.error("Você precisa concordar com os termos de responsabilidade")
                      return
                   }
                   handleNext()
                }}
                disabled={!formData.consentimento}
                className={`btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[200px] transition-all ${!formData.consentimento ? 'opacity-50 grayscale' : ''}`}
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
                  REVISAR DENÚNCIA
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase text-primary">Revisão Final</h2>
                  <p className="text-muted text-sm font-medium">Confira os dados antes de gerar o protocolo oficial.</p>
               </div>
               <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <ShieldCheck size={32} />
               </div>
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
                        <p className="text-xs text-muted font-medium">{formData.bairro} — {formData.cidade} / MS</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Identificação</p>
                        <p className="font-bold text-dark">{formData.anonima ? 'MANTIDO EM TOTAL ANONIMATO' : formData.nome}</p>
                        {!formData.anonima && <p className="text-xs text-muted font-medium">{formData.email}</p>}
                     </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                     <p className="text-[10px] font-black uppercase text-muted tracking-widest">Relato Principal</p>
                     <h5 className="font-black text-dark text-base">{formData.titulo}</h5>
                     <p className="text-xs text-muted font-medium line-clamp-3 leading-relaxed italic">&quot;{formData.descricao_original}&quot;</p>
                  </div>

                  {formData.arquivos.length > 0 && (
                     <div className="pt-4 border-t border-border flex items-center justify-between">
                         <p className="text-[10px] font-black uppercase text-muted tracking-widest">Evidências Anexadas</p>
                         <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black">{formData.arquivos.length} ARQUIVO(S)</span>
                     </div>
                  )}
               </div>

               <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tight">Ao clicar em confirmar, um protocolo oficial e imutável será gerado.</p>
               </div>
            </div>

            <div className="flex items-center justify-between pt-6 gap-4">
               <button onClick={handleBack} disabled={loading} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Corrigir Algo
               </button>
               <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[300px] bg-secondary hover:bg-secondary-600 border-none shadow-glow-green"
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
