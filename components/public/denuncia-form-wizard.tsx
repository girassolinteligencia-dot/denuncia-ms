'use client'

import React, { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ShieldCheck, FileText, Paperclip, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Send, Lock,
  Camera, Shield, AlertTriangle, Info, MapPin,
  Check, UploadCloud
} from 'lucide-react'
import type { Categoria, ConfigCampoFormulario, ConfigTipoArquivo } from '@/types'
import { registrarDenuncia } from '@/lib/actions/denuncia'
import { solicitarCodigoOTP } from '@/lib/actions/auth'
import { buscarCEP } from '@/lib/actions/cep'
import { toast } from 'sonner'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const EmailPreview = dynamic(
  () => import('./email-preview').then(m => m.EmailPreview),
  { ssr: false }
)

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

export const DenunciaFormWizard: React.FC<Props> = ({ categorias, campos, politicasArquivo }) => {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('categoria')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null)
  const [chaveGerada, setChaveGerada] = useState<string | null>(null)
  const [otpEnviado, setOtpEnviado] = useState(false)
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [previewAberto, setPreviewAberto] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sugestoesEndereco, setSugestoesEndereco] = useState<NominatimResult[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(false)

  const otpInputRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<DenunciaFormData>({
    categoria_id: categorias.find(c => c.slug === initialCat)?.id || '',
    titulo: '', local: '', cep: '', numero: '', bairro: '', cidade: '',
    data_ocorrido: '', descricao_original: '', anonima: false,
    nome: '', email: '', telefone: '', cpf: '',
    arquivos: [] as File[], consentimento: false, otpToken: ''
  })

  const camposVisiveis = campos.filter(c => c.visivel).sort((a, b) => a.ordem - b.ordem)

  const categoriasPorBloco = React.useMemo(() => {
    return categorias.reduce((acc, cat) => {
      const b = cat.bloco || 'Geral'
      if (!acc[b]) acc[b] = []
      acc[b].push(cat)
      return acc
    }, {} as Record<string, Categoria[]>)
  }, [categorias])

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleInputChange = (field: keyof DenunciaFormData, value: string | boolean | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'categoria_id') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100)
    }
  }

  const scrollToTop = () => {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleNext = () => { setStep(s => s + 1); scrollToTop() }
  const handleBack = () => { setStep(s => s - 1); scrollToTop() }

  const handleTelefoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '')
    let f = raw
    if (raw.length > 0) {
      f = `(${raw.slice(0, 2)}`
      if (raw.length > 2) { f += `) ${raw.slice(2, 7)}`; if (raw.length > 7) f += `-${raw.slice(7, 11)}` }
    }
    handleInputChange('telefone', f)
  }

  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, '')
    let f = raw
    if (raw.length > 3) {
      f = `${raw.slice(0, 3)}.${raw.slice(3, 6)}`
      if (raw.length > 6) { f += `.${raw.slice(6, 9)}`; if (raw.length > 9) f += `-${raw.slice(9, 11)}` }
    }
    handleInputChange('cpf', f)
  }

  const handleSearchEndereco = async (query: string) => {
    handleInputChange('local', query)
    if (query.length < 4) { setSugestoesEndereco([]); return }
    setLoadingEnderecos(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=br&viewbox=-58.16,-24.04,-50.92,-17.15&bounded=1`)
      const data = await res.json()
      setSugestoesEndereco(data.filter((i: NominatimResult) =>
        i.address?.state === 'Mato Grosso do Sul' || i.display_name.includes('Mato Grosso do Sul')
      ))
    } catch (e) { console.error(e) } finally { setLoadingEnderecos(false) }
  }

  const handleSelectEndereco = (s: NominatimResult) => {
    const a = s.address
    setFormData(prev => ({
      ...prev,
      local: a?.road || s.display_name.split(',')[0],
      cidade: a?.city || a?.town || a?.village || prev.cidade,
      bairro: a?.suburb || a?.neighbourhood || prev.bairro,
      cep: a?.postcode || prev.cep,
      numero: a?.house_number || prev.numero,
    }))
    setSugestoesEndereco([])
  }

  const handleCepChange = async (cep: string) => {
    const raw = cep.replace(/\D/g, '')
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5, 8)}` : raw
    handleInputChange('cep', formatted)
    if (raw.length === 8) {
      setLoadingEnderecos(true)
      try {
        const result = await buscarCEP(raw)
        if (result.success && result.data) {
          const { data } = result
          setFormData(prev => ({ ...prev, local: data.logradouro || prev.local, bairro: data.bairro || prev.bairro, cidade: data.cidade || prev.cidade, cep: formatted }))
          toast.success('Endereço preenchido via CEP!')
        }
      } catch (e) { console.error(e) } finally { setLoadingEnderecos(false) }
    }
  }

  const handleSolicitarOTP = async () => {
    if (!formData.email?.includes('@')) { toast.error('Informe um e-mail válido.'); return }
    if (!formData.nome || formData.nome.length < 3) { toast.error('Informe seu nome completo.'); return }
    setLoadingOtp(true)
    try {
      const res = await solicitarCodigoOTP(formData.email, formData.nome)
      if (res.success) {
        setOtpEnviado(true); setCooldown(60)
        toast.success('Código enviado! Verifique sua caixa de entrada.')
        setTimeout(() => otpInputRef.current?.focus(), 500)
      } else {
        toast.error(res.error || 'Erro ao enviar código.')
      }
    } catch (e) {
      console.error('[OTP]', e)
      toast.error('Falha na comunicação. Tente novamente.')
    } finally { setLoadingOtp(false) }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]
        resolve(base64String)
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (!formData.titulo || !formData.descricao_original) {
        toast.error('Preencha o título e a descrição.'); setLoading(false); return
      }

      // Prepara arquivos para o servidor (Base64)
      const arquivosBase64 = await Promise.all(
        formData.arquivos.map(async (file) => ({
          name: file.name,
          type: file.type,
          content: await fileToBase64(file)
        }))
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { arquivos: _, ...formDataSemArquivos } = formData
      const result = await registrarDenuncia(formDataSemArquivos, arquivosBase64)
      
      if (result.success) {
        setProtocoloGerado(result.protocolo!)
        setChaveGerada(result.chaveAcesso!)
        toast.success('Denúncia registrada com sucesso!')
      } else {
        toast.error((result as { error?: string }).error || 'Erro ao registrar denúncia.')
      }
    } catch (e) {
      console.error(e); toast.error('Erro inesperado no envio.')
    } finally { setLoading(false) }
  }

  const TIPOS_PERMITIDOS = ['image/jpeg','image/png','image/webp','image/gif','application/pdf','audio/mpeg','audio/mp4','audio/wav','audio/ogg']
  const MAX_MB = politicasArquivo?.[0]?.tamanho_max_mb || 5
  const MAX_ARQUIVOS = politicasArquivo?.[0]?.qtd_maxima || 3

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const novos = Array.from(e.target.files)
    if (formData.arquivos.length + novos.length > MAX_ARQUIVOS) { toast.error(`Máximo de ${MAX_ARQUIVOS} arquivos.`); return }
    
    for (const f of novos) {
      if (!TIPOS_PERMITIDOS.includes(f.type)) { toast.error(`Tipo não permitido: ${f.name}`); return }
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name} excede ${MAX_MB}MB.`); return }
    }

    setFormData(prev => ({ ...prev, arquivos: [...prev.arquivos, ...novos] }))
    toast.success(`${novos.length} arquivo(s) adicionado(s) para envio.`)
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      arquivos: prev.arquivos.filter((_, i) => i !== index)
    }))
  }

  // Tela de sucesso
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
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-card-sm space-y-4">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Número do Protocolo</p>
            <div className="text-xl font-black text-dark tracking-wider select-all bg-white p-3 rounded-xl border border-border/50">{protocoloGerado}</div>
          </div>
          <div className="bg-primary p-6 rounded-3xl shadow-glow-cyan space-y-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-[10px] text-white/70 font-black uppercase tracking-widest relative z-10">Chave de Acesso</p>
            <div className="text-xl font-black text-white tracking-widest select-all bg-white/10 p-3 rounded-xl border border-white/20 relative z-10">{chaveGerada}</div>
          </div>
        </div>
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-6 rounded-3xl flex gap-4 text-left">
          <Lock size={24} className="text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-900 font-bold leading-relaxed">
            <span className="block text-amber-950 mb-1">ATENÇÃO: ANOTE ESTES DADOS!</span>
            Estas credenciais são geradas apenas uma vez e são a única forma de consultar o andamento da sua denúncia.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/" className="btn-outline flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2">Voltar ao Início</Link>
          <Link href="/acompanhar" className="btn-primary flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-dark border-none hover:bg-black hover:scale-[1.02] transition-transform">Consultar Status</Link>
        </div>
      </div>
    )
  }

  const currentCategory = categorias.find(c => c.id === formData.categoria_id)

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Progress Stepper - Premium Design */}
      <div className="mb-12 px-4">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-border/40 -z-10">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out" 
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            ></div>
          </div>
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 transform ${
                step === s ? 'bg-primary border-primary text-white shadow-glow-cyan scale-110 -translate-y-1' : 
                step > s ? 'bg-secondary border-secondary text-white' : 
                'bg-white border-border/60 text-muted/60'
              }`}>
                {step > s ? <Check size={20} strokeWidth={3} /> : s}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${step >= s ? 'text-dark' : 'text-muted/40'}`}>
                {s === 1 ? 'Tipo' : s === 2 ? 'O Que' : s === 3 ? 'Onde' : s === 4 ? 'Evidências' : 'Finalizar'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div ref={topRef} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-electric to-secondary"></div>
        
        <div className="p-8 sm:p-12">
          {/* STEP 1 — Categoria */}
          {step === 1 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-dark tracking-tighter italic uppercase">Qual o motivo do seu contato?</h2>
                <p className="text-muted text-sm font-medium">Selecione uma categoria para que possamos direcionar ao órgão correto.</p>
              </div>
              <div className="space-y-12">
                {Object.entries(categoriasPorBloco).map(([bloco, cats]) => (
                  <div key={bloco} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-1 bg-secondary rounded-full"></div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Setor: {bloco}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cats.map(cat => (
                        <button 
                          key={cat.slug} 
                          onClick={() => handleInputChange('categoria_id', cat.id)}
                          className={`group p-5 rounded-3xl border-2 text-left transition-all duration-300 flex items-center gap-5 relative overflow-hidden ${
                            formData.categoria_id === cat.id 
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/5' 
                            : 'border-border/50 hover:border-primary/30 hover:bg-white hover:shadow-xl'
                          }`}
                        >
                          {formData.categoria_id === cat.id && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-8 -mt-8 animate-pulse"></div>
                          )}
                          <div className={`text-4xl transition-transform duration-500 ${formData.categoria_id === cat.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {cat.emoji}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-black text-sm text-dark uppercase tracking-tight leading-tight">{cat.label}</h4>
                            <p className="text-[10px] text-muted font-bold truncate mt-1 group-hover:text-primary transition-colors italic">
                              {cat.instrucao_publica || 'Toque para selecionar esta categoria'}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.categoria_id === cat.id ? 'bg-primary border-primary text-white' : 'border-border'
                          }`}>
                            {formData.categoria_id === cat.id && <Check size={14} strokeWidth={4} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.categoria_id && currentCategory?.aviso_legal && (
                <div className="p-6 bg-amber-50/50 backdrop-blur-sm border-l-4 border-amber-400 rounded-2xl flex gap-4 animate-fade-in shadow-inner">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl h-fit"><AlertTriangle size={20} /></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Informação Importante</p>
                    <p className="text-sm font-bold text-amber-800 leading-snug italic">{currentCategory?.aviso_legal}</p>
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="flex justify-end pt-6">
                <button 
                  onClick={handleNext} 
                  disabled={!formData.categoria_id} 
                  className="btn-primary h-16 px-10 rounded-2xl gap-3 shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <span className="font-black uppercase tracking-widest text-xs">Avançar para o Relato</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Descrição */}
          {step === 2 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-dark tracking-tighter italic uppercase">Relato do Ocorrido</h2>
                  <p className="text-muted text-sm font-medium">Seja o mais específico possível nos detalhes.</p>
                </div>
                <div className="hidden sm:flex p-5 bg-primary/5 text-primary rounded-[2rem] border border-primary/10"><FileText size={32} /></div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="label text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Info size={14} /> Título da Ocorrência *
                  </label>
                  <input 
                    className="input h-16 rounded-2xl text-lg font-bold border-2 focus:ring-4 focus:ring-primary/5 transition-all" 
                    placeholder="Ex: Obra abandonada no centro"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {camposVisiveis.map(campo => {
                    if (['local','numero','bairro','cidade','cep','nome','email','telefone','cpf','data_ocorrido','titulo'].includes(campo.campo)) return null
                    return (
                      <div key={campo.id} className="space-y-2">
                        <label className="label text-[10px] font-black uppercase tracking-widest text-muted">{campo.label} {campo.obrigatorio ? '*' : ''}</label>
                        <input className="input h-14 rounded-xl border-2" placeholder={campo.placeholder || ''}
                          value={(formData as unknown as Record<string, string>)[campo.campo] || ''}
                          onChange={(e) => handleInputChange(campo.campo as keyof DenunciaFormData, e.target.value)} />
                      </div>
                    )
                  })}
                  {camposVisiveis.find(c => c.campo === 'data_ocorrido') && (
                    <div className="space-y-2">
                      <label className="label text-[10px] font-black uppercase tracking-widest text-primary label-required">Data do Ocorrido</label>
                      <div className="relative">
                        <input type="date" className="input h-14 rounded-xl border-2 font-bold uppercase text-xs" value={formData.data_ocorrido} onChange={(e) => handleInputChange('data_ocorrido', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="label text-[10px] font-black uppercase tracking-[0.2em] text-primary label-required">Descrição Detalhada</label>
                  <div className="relative group">
                    <textarea 
                      className="input min-h-[220px] rounded-[2rem] p-6 leading-relaxed text-base border-2 group-focus-within:ring-4 group-focus-within:ring-primary/5 transition-all"
                      placeholder="Descreva aqui os fatos, pessoas envolvidas e qualquer detalhe que ajude na investigação..."
                      value={formData.descricao_original} 
                      onChange={(e) => handleInputChange('descricao_original', e.target.value)} 
                    />
                    <div className="absolute bottom-6 right-6 text-[10px] font-black text-muted/30 uppercase tracking-widest pointer-events-none">Canal Seguro 256-bit</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-border/40">
                <button onClick={handleBack} className="group flex items-center gap-3 text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                  <div className="p-2 rounded-lg group-hover:bg-surface transition-colors"><ArrowLeft size={18} /></div>
                  Voltar
                </button>
                <button 
                  onClick={() => { if (!formData.titulo || !formData.descricao_original) { toast.error('Preencha o título e a descrição'); return }; handleNext() }} 
                  className="btn-primary h-16 px-10 rounded-2xl gap-3 shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span className="font-black uppercase tracking-widest text-xs">Confirmar Localização</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Localização */}
          {step === 3 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-dark tracking-tighter italic uppercase">Onde aconteceu?</h2>
                  <p className="text-muted text-sm font-medium">A localização exata agiliza a resposta das autoridades.</p>
                </div>
                <div className="hidden sm:flex p-5 bg-electric/10 text-primary rounded-[2rem] border border-electric/20"><MapPin size={32} /></div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="max-w-xs space-y-2">
                  <label className="label text-[10px] font-black uppercase tracking-widest text-primary">CEP do Mato Grosso do Sul</label>
                  <div className="relative group">
                    <input 
                      className="input h-16 rounded-2xl text-2xl font-black tracking-[0.2em] border-2 focus:ring-4 focus:ring-primary/5 transition-all text-center" 
                      placeholder="00000-000" 
                      value={formData.cep} 
                      onChange={(e) => handleCepChange(e.target.value)} 
                      maxLength={9} 
                    />
                    {loadingEnderecos && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={20} className="animate-spin text-primary" /></div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="sm:col-span-3 relative group">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-muted">Logradouro / Rua</label>
                    <input className="input h-14 rounded-xl border-2 font-bold" placeholder="Digite o nome da rua..." value={formData.local} onChange={(e) => handleSearchEndereco(e.target.value)} autoComplete="off" />
                    {sugestoesEndereco.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border-2 border-primary/20 shadow-2xl rounded-[2rem] overflow-hidden animate-slide-up">
                        {sugestoesEndereco.map((s, idx) => (
                          <button key={idx} type="button" onClick={() => handleSelectEndereco(s)} className="w-full p-5 text-left hover:bg-primary/5 border-b border-border/40 last:border-none flex items-start gap-4 group/item transition-colors">
                            <div className="mt-1 p-2 bg-primary/5 text-primary rounded-xl group-hover/item:bg-primary group-hover/item:text-white transition-colors"><MapPin size={16} /></div>
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-black text-dark uppercase">{s.display_name.split(',')[0]}</p>
                              <p className="text-[10px] text-muted font-bold truncate">{s.display_name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-muted">Nº</label>
                    <input className="input h-14 rounded-xl border-2 font-black text-center" placeholder="S/N" value={formData.numero} onChange={(e) => handleInputChange('numero', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-muted">Bairro</label>
                    <input className="input h-14 rounded-xl border-2 font-bold" placeholder="Ex: Centro" value={formData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[10px] font-black uppercase tracking-widest text-muted">Cidade / Município</label>
                    <input className="input h-14 rounded-xl border-2 font-bold" placeholder="Ex: Campo Grande" value={formData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-border/40">
                <button onClick={handleBack} className="group flex items-center gap-3 text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                  <div className="p-2 rounded-lg group-hover:bg-surface transition-colors"><ArrowLeft size={18} /></div>
                  Voltar
                </button>
                <button onClick={handleNext} className="btn-primary h-16 px-10 rounded-2xl gap-3 shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <span className="font-black uppercase tracking-widest text-xs">Anexar Evidências</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Arquivos */}
          {step === 4 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-dark tracking-tighter italic uppercase">Provas & Evidências</h2>
                  <p className="text-muted text-sm font-medium">Anexe fotos, PDFs ou áudios que comprovem o ocorrido.</p>
                </div>
                <div className="hidden sm:flex p-5 bg-secondary/10 text-secondary rounded-[2rem] border border-secondary/20"><Camera size={32} /></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="relative border-4 border-dashed border-border/40 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-4 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden">
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                  
                  <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 border border-border/20">
                    <UploadCloud size={32} strokeWidth={2.5} />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-black text-dark uppercase text-sm tracking-tight">Clique ou Arraste Arquivos</p>
                    <p className="text-[10px] text-muted font-bold">Máximo de {MAX_ARQUIVOS} arquivos (até {MAX_MB}MB cada)</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {['JPG','PNG','PDF','MP3'].map(ext => (
                      <span key={ext} className="px-2 py-1 bg-surface text-[8px] font-black rounded-lg border border-border/50 text-muted/60">{ext}</span>
                    ))}
                  </div>
                </label>

                <div className="bg-surface/50 rounded-[2.5rem] p-8 border border-border/30 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase text-secondary tracking-widest flex items-center gap-2">
                        <Check size={16} /> Lista de Arquivos
                      </p>
                      <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-border/50">
                        {formData.arquivos.length}/{MAX_ARQUIVOS}
                      </span>
                    </div>
                    
                    {formData.arquivos.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-muted/30 gap-2 italic">
                        <Paperclip size={24} className="opacity-20" />
                        <p className="text-[10px] font-bold">Nenhum arquivo selecionado</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.arquivos.map((f, i) => (
                          <div key={i} className="group/file p-3 bg-white border border-border/50 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-primary/5 text-primary rounded-xl"><FileText size={14} /></div>
                              <div className="truncate min-w-0">
                                <p className="text-[10px] font-black text-dark truncate">{f.name}</p>
                                <p className="text-[8px] text-muted font-bold">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFile(i)}
                              className="p-2 text-muted hover:text-error hover:bg-error/5 rounded-xl transition-colors"
                            >
                              <Check size={14} className="rotate-45" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-white/40 rounded-2xl flex gap-3 border border-white/60 shadow-inner">
                    <ShieldCheck size={18} className="shrink-0 text-secondary" />
                    <p className="text-[9px] font-bold text-muted-foreground leading-tight italic">
                      Seus arquivos são criptografados e armazenados em infraestrutura segura do Estado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-border/40">
                <button onClick={handleBack} className="group flex items-center gap-3 text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                  <div className="p-2 rounded-lg group-hover:bg-surface transition-colors"><ArrowLeft size={18} /></div>
                  Voltar
                </button>
                <button onClick={handleNext} className="btn-primary h-16 px-10 rounded-2xl gap-3 shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all bg-dark hover:bg-black">
                  <span className="font-black uppercase tracking-widest text-xs">Revisão & Identificação</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Identificação e Revisão */}
          {step === 5 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-dark tracking-tighter italic uppercase text-primary">Segurança & Finalização</h2>
                  <p className="text-muted text-sm font-medium">Valide sua identidade para garantir a legitimidade da denúncia.</p>
                </div>
                <div className="hidden sm:flex p-5 bg-secondary/10 text-secondary rounded-[2rem] border border-secondary/20"><ShieldCheck size={32} /></div>
              </div>

              {/* Bloco de Identificação Premium */}
              <div className="p-8 sm:p-10 bg-dark text-white rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-secondary/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-secondary/20 rounded-2xl border border-secondary/30 backdrop-blur-md"><Lock size={24} className="text-secondary" /></div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tighter">Protocolo de Identidade</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Proteção Nível Governamental (LGPD)</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex gap-4 relative z-10 backdrop-blur-md">
                  <Info className="text-electric flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-[11px] text-white/70 leading-relaxed font-medium italic">
                    Utilizamos pseudonimização. Seus dados pessoais são criptografados antes de chegarem ao banco de dados, sendo visíveis apenas para a autoridade responsável pela investigação.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Nome Completo *</p>
                    <input className="bg-white/5 border-2 border-white/10 rounded-2xl h-14 p-4 text-sm focus:outline-none focus:ring-4 focus:ring-secondary/20 focus:border-secondary w-full transition-all"
                      placeholder="Seu nome completo" disabled={otpEnviado} value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">E-mail Corporativo/Pessoal *</p>
                    <input type="email" className="bg-white/5 border-2 border-white/10 rounded-2xl h-14 p-4 text-sm focus:outline-none focus:ring-4 focus:ring-secondary/20 focus:border-secondary w-full transition-all"
                      placeholder="seu@email.com" disabled={otpEnviado} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Celular / WhatsApp *</p>
                    <input className="bg-white/5 border-2 border-white/10 rounded-2xl h-14 p-4 text-sm focus:outline-none focus:ring-4 focus:ring-secondary/20 focus:border-secondary w-full transition-all"
                      placeholder="(67) 99999-9999" disabled={otpEnviado} value={formData.telefone} onChange={(e) => handleTelefoneChange(e.target.value)} maxLength={15} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">CPF *</p>
                    <input className="bg-white/5 border-2 border-white/10 rounded-2xl h-14 p-4 text-sm focus:outline-none focus:ring-4 focus:ring-secondary/20 focus:border-secondary w-full transition-all"
                      placeholder="000.000.000-00" disabled={otpEnviado} value={formData.cpf} onChange={(e) => handleCpfChange(e.target.value)} maxLength={14} />
                  </div>
                </div>

                {/* OTP Section Premium */}
                <div className="pt-4 relative z-10">
                  {!otpEnviado ? (
                    <button onClick={handleSolicitarOTP} disabled={loadingOtp || !formData.email || !formData.nome || cooldown > 0}
                      className="w-full h-16 bg-secondary text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl disabled:opacity-30 flex justify-center items-center gap-3 shadow-glow-green hover:scale-[1.01] active:scale-[0.99] transition-all">
                      {loadingOtp ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                      {cooldown > 0 ? `Tentar novamente em ${cooldown}s` : 'Gerar Token de Autenticação'}
                    </button>
                  ) : (
                    <div className="bg-white/5 border border-secondary/30 p-8 rounded-[2rem] space-y-6 animate-slide-up backdrop-blur-xl">
                      <div className="text-center space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Token Enviado</p>
                        <p className="text-[10px] text-white/50 font-medium">Insira o código de 6 dígitos enviado para seu e-mail</p>
                      </div>
                      <input ref={otpInputRef}
                        className="bg-black/40 border-2 border-secondary/40 rounded-2xl h-20 text-center text-4xl font-black tracking-[0.6em] text-white focus:outline-none focus:ring-8 focus:ring-secondary/10 focus:border-secondary w-full max-w-[320px] mx-auto block shadow-2xl"
                        placeholder="000000" maxLength={6} value={formData.otpToken}
                        onChange={(e) => handleInputChange('otpToken', e.target.value.replace(/\D/g, ''))} />
                      <button onClick={() => { setOtpEnviado(false); handleInputChange('otpToken', '') }}
                        className="text-[9px] text-white/30 uppercase font-black hover:text-white mx-auto block pt-2 underline underline-offset-4 tracking-widest transition-colors">
                        Corrigir e-mail ou reenviar código
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo & Consentimento */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-surface/50 rounded-[3rem] p-8 border border-border/40 space-y-8">
                  <div className="flex items-center gap-6 border-b border-border/40 pb-6">
                    <span className="text-6xl filter drop-shadow-xl">{currentCategory?.emoji}</span>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest">Protocolo Destinado a</p>
                      <h4 className="text-2xl font-black text-dark tracking-tighter italic uppercase">{currentCategory?.label}</h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><MapPin size={14} /> Local do Fato</p>
                      <p className="text-sm font-black text-dark uppercase">{formData.local}{formData.numero ? `, ${formData.numero}` : ''}</p>
                      <p className="text-xs text-muted font-bold italic">{formData.bairro} — {formData.cidade}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><FileText size={14} /> Título do Relato</p>
                      <h5 className="font-black text-dark text-lg uppercase tracking-tight italic leading-tight">{formData.titulo}</h5>
                    </div>
                  </div>

                  {formData.arquivos.length > 0 && (
                    <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest flex items-center gap-2"><Paperclip size={14} /> Evidências anexadas</p>
                      <span className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black tracking-widest shadow-glow-cyan">{formData.arquivos.length} ARQUIVO(S)</span>
                    </div>
                  )}
                </div>

                {/* Email Preview Accordion */}
                <div className="rounded-[2rem] border-2 border-border/40 overflow-hidden group">
                  <button onClick={() => setPreviewAberto(p => !p)}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-surface transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:scale-110 transition-transform"><FileText size={20} /></div>
                      <div className="text-left">
                        <p className="text-[11px] font-black text-dark uppercase tracking-[0.2em]">Visualizar Cópia Digital</p>
                        <p className="text-[10px] text-muted font-bold italic">Confira o documento que será encaminhado</p>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full transition-transform duration-300 ${previewAberto ? 'rotate-180 bg-primary text-white' : 'bg-surface text-muted'}`}>
                      <ArrowRight size={16} className="rotate-90" />
                    </div>
                  </button>
                  {previewAberto && (
                    <div className="border-t-2 border-border/20 p-6 bg-surface/30 animate-slide-up">
                      <EmailPreview
                        protocolo="PREVIEW"
                        categoria={currentCategory?.label || formData.categoria_id}
                        titulo={formData.titulo}
                        descricao={formData.descricao_original}
                        local={[formData.local, formData.numero, formData.bairro, formData.cidade].filter(Boolean).join(', ')}
                        data_ocorrido={formData.data_ocorrido || ''}
                        nome={formData.nome}
                        email={formData.email}
                        telefone={formData.telefone}
                        cpf={formData.cpf}
                        totalArquivos={formData.arquivos.length}
                      />
                    </div>
                  )}
                </div>

                {/* Consentimento Premium */}
                <div className={`p-8 rounded-[3rem] border-2 transition-all duration-500 ${formData.consentimento ? 'bg-primary/5 border-primary shadow-xl' : 'bg-surface/50 border-border/50'}`}>
                  <label className="flex items-start gap-6 cursor-pointer group">
                    <div className="pt-1 relative">
                      <input type="checkbox" className="peer hidden"
                        checked={formData.consentimento} onChange={(e) => handleInputChange('consentimento', e.target.checked)} />
                      <div className="w-8 h-8 rounded-xl border-2 border-border/60 bg-white flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary peer-checked:shadow-glow-cyan">
                        <Check size={20} className={`text-white transition-opacity ${formData.consentimento ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[11px] font-black text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                        Declaração de Veracidade e Ciência <Shield size={16} className="text-secondary" />
                      </p>
                      <ul className="text-[11px] text-muted-foreground leading-relaxed font-bold space-y-2 italic">
                        <li className="flex gap-2"><span className="text-primary">•</span> Declaro que os fatos aqui narrados são verdadeiros e de minha inteira responsabilidade.</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Estou ciente das penalidades legais em caso de denúncia falsa ou má-fé (Art. 339 CP).</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Autorizo o encaminhamento destes dados aos órgãos competentes para fins de apuração.</li>
                      </ul>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-10 gap-6 border-t border-border/40">
                <button onClick={handleBack} disabled={loading} className="group flex items-center gap-3 text-[11px] uppercase font-black text-muted hover:text-dark transition-all order-2 sm:order-1">
                  <div className="p-3 rounded-xl group-hover:bg-surface transition-colors"><ArrowLeft size={20} /></div>
                  Revisar Dados
                </button>
                <button
                  onClick={() => {
                    if (!formData.consentimento) {
                      toast.error('Você precisa concordar com os termos para protocolar.'); return
                    }
                    if (!formData.otpToken || formData.otpToken.length !== 6) {
                      toast.error('Efetue a validação do código de segurança recebido no e-mail.'); return
                    }
                    handleSubmit()
                  }}
                  disabled={loading || !formData.consentimento || !formData.otpToken || formData.otpToken.length !== 6}
                  className={`btn-primary h-20 px-12 rounded-[2rem] gap-4 w-full sm:w-auto shadow-[0_20px_50px_rgba(0,132,62,0.3)] bg-secondary hover:bg-secondary-600 border-none transition-all duration-500 order-1 sm:order-2 ${
                    !formData.consentimento || !formData.otpToken || formData.otpToken.length !== 6 ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="font-black uppercase tracking-widest">Protocolando...</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-black uppercase tracking-[0.2em] text-sm">Finalizar e Gerar Protocolo</span>
                      <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-6 text-[10px] text-muted/40 font-black uppercase tracking-[0.4em]">
        <div className="flex items-center gap-2"><Lock size={12} /> Conexão Segura</div>
        <div className="h-1 w-1 bg-border rounded-full"></div>
        <div className="flex items-center gap-2"><Shield size={12} /> Proteção LGPD</div>
        <div className="h-1 w-1 bg-border rounded-full"></div>
        <div className="flex items-center gap-2"><CheckCircle2 size={12} /> Canal Oficial</div>
      </div>
    </div>
  )
}
