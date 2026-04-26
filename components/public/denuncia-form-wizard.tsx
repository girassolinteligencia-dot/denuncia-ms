'use client'

import React, { useState, useEffect, useRef } from 'react'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MapPin, 
  FileText, 
  Paperclip, 
  Lock, 
  ShieldCheck, 
  Send,
  Loader2,
  Info,
  CheckCircle2,
  Zap,
  AlertTriangle,
  CloudOff,
  Wifi,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { EmailPreview } from './email-preview'
import { solicitarCodigoOTP, verificarOTP } from '@/lib/actions/auth'
import { salvarRascunhoOffline, removerRascunho } from '@/lib/offline-storage'

const STEPS = [
  { id: 1, label: 'Categoria', icon: Zap },
  { id: 2, label: 'Relato', icon: FileText },
  { id: 3, label: 'Onde?', icon: MapPin },
  { id: 4, label: 'Evidências', icon: Paperclip },
  { id: 5, label: 'Segurança', icon: ShieldCheck },
]

const MAX_ARQUIVOS = 5
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB individual

interface Categoria {
  id: string
  slug: string
  label: string
  bloco: string
  icon_name: string | null
  instrucao_publica: string | null
  aviso_legal: string | null
  template_descricao: { topico: string; placeholder: string }[]
}

interface ArquivoAnexo {
  name: string
  size: number
  type: string
  url?: string
  bucket_path?: string
  status: 'pendente' | 'enviando' | 'sucesso' | 'erro'
}

interface DenunciaFormData {
  categoria_id: string
  titulo: string
  descricao_original: string
  local: string
  cep: string
  numero: string
  bairro: string
  cidade: string
  data_ocorrido: string
  latitude: number | null
  longitude: number | null
  municipio: string
  nome: string
  email: string
  telefone: string
  cpf: string
  arquivos: ArquivoAnexo[]
  consentimento: boolean
  otpToken: string
}

// Funções de Validação
const validarCPF = (cpf: string) => {
  const cleanCpf = cpf.replace(/\D/g, '')
  if (cleanCpf.length !== 11) return false
  if (/^(\d)\1+$/.test(cleanCpf)) return false // Elimina CPFs com todos os números iguais (111.111.111-11, etc)

  let soma = 0
  let resto

  for (let i = 1; i <= 9; i++) soma = soma + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleanCpf.substring(9, 10))) return false

  soma = 0
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleanCpf.substring(10, 11))) return false

  return true
}

const validarTelefone = (tel: string) => {
  const cleanTel = tel.replace(/\D/g, '')
  // Aceita 10 (fixo) ou 11 (celular) dígitos
  return cleanTel.length >= 10 && cleanTel.length <= 11
}

const validarEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function DenunciaFormWizard({ 
  categorias
}: { 
  categorias: Categoria[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [previewAberto, setPreviewAberto] = useState(false)
  const [otpEnviado, setOtpEnviado] = useState(false)
  const [otpValidado, setOtpValidado] = useState(false)
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [geolocalizando, setGeolocalizando] = useState(false)
  const otpInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<DenunciaFormData>({
    categoria_id: '',
    titulo: '',
    descricao_original: '',
    local: '',
    cep: '',
    numero: '',
    bairro: '',
    cidade: '',
    latitude: null,
    longitude: null,
    municipio: '',
    data_ocorrido: new Date().toISOString().split('T')[0],
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    arquivos: [],
    consentimento: false,
    otpToken: '',
  })

  // Monitorar Conectividade
  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Conexão restabelecida! Sincronizando dados...', { icon: <Wifi size={16} /> })
    }
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Você está offline. O modo de segurança local foi ativado.', { icon: <CloudOff size={16} /> })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Auto-save a cada mudança de passo ou dados importantes
  useEffect(() => {
    if (formData.categoria_id || formData.titulo) {
      salvarRascunhoOffline('rascunho_atual', formData, formData.arquivos)
        .catch(err => console.error('Erro no auto-save:', err))
    }
  }, [formData, step])

  const handleInputChange = (field: keyof DenunciaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Rola para baixo apenas na seleção de categoria (Etapa 1)
    if (field === 'categoria_id') {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

  // Função para scroll sequencial inteligente
  const handleFieldScroll = (targetId?: string) => {
    setTimeout(() => {
      if (targetId) {
        const el = document.getElementById(targetId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleNext = () => {
    setStep(s => Math.min(s + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (formData.arquivos.length + files.length > MAX_ARQUIVOS) {
      toast.error('Limite de anexos atingido', {
        description: `Você já selecionou o máximo de ${MAX_ARQUIVOS} arquivos permitidos para este protocolo.`
      })
      return
    }

    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/webp', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'
    ]

    const { uploadArquivoDenuncia } = await import('@/lib/actions/denuncia')

    for (const file of files) {
      // Validar Tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.warning('Formato não suportado', {
          description: `O arquivo "${file.name}" não está em um formato aceito (Fotos, PDFs ou Áudios). Poderia converter para um formato padrão?`
        })
        continue
      }

      // Validar Tamanho
      if (file.size > MAX_FILE_SIZE) {
        toast.warning('Arquivo muito grande', { 
          description: `Ops! O arquivo "${file.name}" ultrapassa o limite de 4MB. Para garantir um envio rápido, pedimos arquivos menores. Consegue comprimi-lo?` 
        })
        continue
      }

      const novoArquivo: ArquivoAnexo = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'enviando'
      }

      setFormData(prev => ({ ...prev, arquivos: [...prev.arquivos, novoArquivo] }))

      try {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = () => reject(new Error('Erro na leitura'))
          reader.readAsDataURL(file)
        })

        const res = await uploadArquivoDenuncia(file.name, file.type, base64)
        
        if (res.success && res.url && res.bucket_path) {
          setFormData(prev => ({
            ...prev,
            arquivos: prev.arquivos.map(a => 
              a.name === file.name && a.status === 'enviando' 
              ? { ...a, status: 'sucesso', url: res.url, bucket_path: res.bucket_path } 
              : a
            )
          }))
          toast.success(`Arquivo pronto: ${file.name}`)
        } else {
          throw new Error(res.error || 'Erro no upload')
        }
      } catch (err) {
        setFormData(prev => ({
          ...prev,
          arquivos: prev.arquivos.map(a => 
            a.name === file.name && a.status === 'enviando' ? { ...a, status: 'erro' } : a
          )
        }))
        toast.error(`Falha ao subir ${file.name}`)
      }
    }
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, arquivos: prev.arquivos.filter((_, i) => i !== index) }))
  }

  const handleSolicitarOTP = async () => {
    if (!isOnline) {
      toast.error('Você precisa de internet para receber o código de segurança.')
      return
    }
    if (!formData.email || !formData.nome) {
      toast.error('Preencha seu nome e e-mail primeiro.')
      return
    }
    if (!validarEmail(formData.email)) {
      toast.error('E-mail em formato inválido.')
      return
    }
    setLoadingOtp(true)
    const res = await solicitarCodigoOTP(formData.email, formData.nome)
    setLoadingOtp(false)
    if (res.success) {
      setOtpEnviado(true)
      setCooldown(60)
      toast.success('Código de segurança enviado para seu e-mail.')
      setTimeout(() => otpInputRef.current?.focus(), 100)
    } else {
      toast.error(res.error || 'Erro ao enviar código.')
    }
  }

  const handleVerificarOTP = async () => {
    if (formData.otpToken.length !== 6) {
      toast.error('O código deve ter 6 dígitos.')
      return
    }
    setLoadingOtp(true)
    const res = await verificarOTP(formData.email, formData.otpToken)
    setLoadingOtp(false)
    if (res.success) {
      setOtpValidado(true)
      toast.success('Identidade pré-validada com sucesso!')
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    } else {
      toast.error(res.error || 'Código incorreto ou expirado.')
    }
  }

  const handleSubmit = async () => {
    if (!isOnline) {
      toast.error('Aguarde a conexão voltar para finalizar o protocolo oficial.')
      return
    }

    if (!formData.telefone || !formData.cpf) {
      toast.error('Telefone e CPF são obrigatórios para a identificação oficial.')
      return
    }

    const arquivosProntos = formData.arquivos.filter(a => a.status === 'sucesso')
    const arquivosFalhando = formData.arquivos.filter(a => a.status === 'erro' || a.status === 'enviando')

    if (arquivosFalhando.length > 0) {
      const nomes = arquivosFalhando.map(a => a.name).join(', ')
      console.warn('[wizard] Impedindo submissão por arquivos pendentes:', nomes)
      toast.error('Arquivos pendentes ou com erro', {
        description: `Por favor, remova ou aguarde o envio de: ${nomes}`
      })
      return
    }

    setLoading(true)
    try {
      const { registrarDenuncia } = await import('@/lib/actions/denuncia')
      
      console.log('[wizard] Enviando para registrarDenuncia...', { 
        arquivos: arquivosProntos.length,
        email: formData.email 
      })

      const res = await registrarDenuncia(formData, arquivosProntos.map(a => ({
        name: a.name,
        type: a.type,
        url: a.url!,
        bucket_path: a.bucket_path!,
        size: a.size
      })))

      if (res.success) {
        console.log('[wizard] Registro bem-sucedido:', res.protocolo)
        await removerRascunho('rascunho_atual')
        toast.success('Denuncia protocolada com sucesso!')
        router.push(`/sucesso?protocolo=${res.protocolo}&chave=${res.chaveAcesso}`)
      } else {
        console.error('[wizard] Erro retornado pela action:', res.error)
        setLoading(false)
        
        const isOtpError = res.error?.toLowerCase().includes('código') || res.error?.toLowerCase().includes('otp')
        toast.error(res.error || 'Erro ao processar denuncia.', {
          description: isOtpError ? 'Por favor, solicite um novo código de verificação.' : 'Verifique os dados e tente novamente.',
          duration: 10000
        })
      }
    } catch (err: any) {
      setLoading(false)
      console.error('[wizard] Erro catastrófico na chamada:', err)
      toast.error('Falha técnica na submissão.', {
        description: err.message || 'Verifique sua conexão e tente novamente.',
        duration: 10000
      })
    }
  }

  const currentCategory = categorias.find(c => c.id === formData.categoria_id)

  const handleTelefoneChange = (v: string) => {
    const clean = v.replace(/\D/g, '')
    const x = clean.match(/(\d{0,2})(\d{0,5})(\d{0,4})/)
    if (!x) return
    const formatted = !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? '-' + x[3] : ''}`
    handleInputChange('telefone', formatted)
    
    // Auto-scroll para CPF ao atingir 11 dígitos
    if (clean.length === 11) {
      handleFieldScroll('field-cpf')
    }
  }

  const handleCpfChange = (v: string) => {
    const clean = v.replace(/\D/g, '')
    const x = clean.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/)
    if (!x) return
    const formatted = !x[2] ? x[1] : `${x[1]}.${x[2]}${x[3] ? '.' + x[3] : ''}${x[4] ? '-' + x[4] : ''}`
    handleInputChange('cpf', formatted)

    // Auto-scroll para Consentimento ao atingir 11 dígitos
    if (clean.length === 11) {
      handleFieldScroll('field-consentimento')
    }
  }

  const handleCepChange = async (v: string) => {
    const cleanCep = v.replace(/\D/g, '')

    // Trava Mato Grosso do Sul (Faixa 79xxx-xxx)
    if (cleanCep.length >= 2 && cleanCep.slice(0, 2) !== '79') {
      toast.error('Localização Inválida', {
        description: 'Esta plataforma é exclusiva para o Mato Grosso do Sul. O CEP informado pertence a outro estado.'
      })
      return
    }

    const formatted = cleanCep.length <= 5 ? cleanCep : `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`
    handleInputChange('cep', formatted)

    if (cleanCep.length === 8) {
      // Auto-scroll para Cidade
      handleFieldScroll('field-cidade')
      
      if (isOnline) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
          const data = await res.json()
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              local: data.logradouro || prev.local,
              bairro: data.bairro || prev.bairro,
              cidade: data.localidade || prev.cidade,
            }))
            toast.success('Endereço localizado!')
          }
        } catch (e) {
          console.error('Erro ao buscar CEP:', e)
        }
      }
    }
  }

  const handleGeolocalizar = () => {
    if (!isOnline) {
      toast.error('Você precisa de internet para usar a geolocalização.')
      return
    }

    // Verificar se o contexto é seguro (necessário para Geolocation API)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      toast.error('Conexão Não Segura', {
        description: 'A geolocalização automática requer uma conexão segura (HTTPS) para funcionar.'
      })
      return
    }

    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta geolocalização.')
      return
    }

    setGeolocalizando(true)
    const geoToastId = toast.info('Buscando sua localização...', { 
      description: 'Por favor, autorize o acesso se solicitado pelo seu dispositivo.',
      duration: 5000 
    })

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss(geoToastId)
        const { latitude, longitude } = position.coords
        try {
          // Bounding Box do Mato Grosso do Sul para restringir a busca
          const MS_VIEWBOX = '-58.1,-24.1,-50.4,-17.4'
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&viewbox=${MS_VIEWBOX}&bounded=1`,
            { 
              headers: { 
                'Accept-Language': 'pt-BR',
                'User-Agent': 'DenunciaMS-Platform-App'
              } 
            }
          )
          const data = await res.json()
          
          if (data && data.address) {
            const addr = data.address
            console.log('[geolocation] Dados recebidos:', addr)

            // Validar se o estado é MS
            const estado = addr.state || ''
            if (!estado.toLowerCase().includes('mato grosso do sul')) {
              toast.warning('Fora de Área', {
                description: 'Detectamos que você está fora do Mato Grosso do Sul. Esta plataforma é exclusiva para o estado de MS.'
              })
              setGeolocalizando(false)
              return
            }

            const cidadeDetectada = addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
            const bairroDetectado = addr.neighbourhood || addr.suburb || addr.city_district || addr.hamlet || ''
            const ruaDetectada = addr.road || addr.pedestrian || addr.square || addr.address29 || ''
            const cepDetectado = addr.postcode ? (addr.postcode.includes('-') ? addr.postcode : `${addr.postcode.slice(0, 5)}-${addr.postcode.slice(5, 8)}`) : ''

            setFormData(prev => ({
              ...prev,
              local: ruaDetectada || prev.local,
              bairro: bairroDetectado || prev.bairro,
              cidade: cidadeDetectada || prev.cidade,
              cep: cepDetectado || prev.cep,
              latitude: latitude,
              longitude: longitude,
              municipio: cidadeDetectada || prev.municipio,
            }))

            if (!cidadeDetectada && !ruaDetectada) {
              toast.error('Localização identificada, mas o endereço está incompleto. Por favor, ajuste manualmente.')
            } else {
              toast.success('Endereço localizado com sucesso!')
            }
            handleFieldScroll()
          } else {
            toast.error('Não conseguimos identificar o endereço exato.')
          }
        } catch (err) {
          console.error('Erro na geocodificação:', err)
          toast.error('Erro ao converter coordenadas.')
        } finally {
          setGeolocalizando(false)
        }
      },
      (error) => {
        toast.dismiss(geoToastId)
        setGeolocalizando(false)
        console.error('[geolocation] Erro:', error)
        
        if (error.code === 1) { // PERMISSION_DENIED
          toast.error('Acesso Negado', {
            description: 'Para iPhones: Vá em Ajustes > Privacidade > Serv. de Localização e ative para o Safari. Se o erro persistir, verifique se o site está em HTTPS.',
            duration: 10000
          })
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          toast.error('GPS Indisponível', {
            description: 'Não foi possível obter um sinal de GPS válido. Tente novamente em um local aberto.'
          })
        } else if (error.code === 3) { // TIMEOUT
          toast.error('Tempo Esgotado', {
            description: 'A busca demorou muito. Verifique sua conexão e tente novamente.'
          })
        } else {
          toast.error('Falha na geolocalização.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
      
      {/* BANNER OFFLINE PREMIUM */}
      {!isOnline && (
        <div className="mx-4 sm:mx-0 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] shadow-2xl animate-bounce-subtle flex flex-col sm:flex-row items-center gap-6 border-2 border-white/20">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
            <CloudOff size={32} className="animate-pulse" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black uppercase tracking-tight italic text-lg">Modo Offline Ativado</h3>
            <p className="text-xs font-medium text-white/80 leading-relaxed italic">
              Continue preenchendo normalmente. Seus dados estão seguros e serão enviados automaticamente para a <strong>DENUNCIA MS</strong> assim que você recuperar o sinal.
            </p>
          </div>
        </div>
      )}

      {/* STEPS PROGRESS */}
      <nav className="flex items-center justify-between px-1 sm:px-6 relative gap-1">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/30 -translate-y-1/2 z-0 hidden sm:block"></div>
        {STEPS.map((s) => {
          const ActiveIcon = s.icon
          const isDone = step > s.id
          const isActive = step === s.id
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-3">
              <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                isDone ? 'bg-primary border-primary text-white scale-90' : 
                isActive ? 'bg-white border-primary text-primary shadow-glow-cyan scale-110' : 
                'bg-white border-border text-muted-foreground'
              }`}>
                {isDone ? <Check size={18} strokeWidth={3} className="sm:w-6 sm:h-6" /> : <ActiveIcon size={isActive ? 20 : 16} className="sm:w-7 sm:h-7" />}
              </div>
              <span className={`hidden sm:block text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`}>
                {s.label}
              </span>
              {isActive && (
                <span className="sm:hidden text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">
                  {s.label}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      <div className="bg-white rounded-[3rem] shadow-card-xl border border-border/40 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary-dark"></div>
        
        <div className="p-6 sm:p-12">
          {step === 1 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-dark tracking-tighter italic uppercase">Escolha a <span className="text-primary italic">Categoria</span></h2>
                  <p className="text-muted text-sm font-medium">Selecione o tipo de ocorrência que deseja relatar na <strong>DENUNCIA MS</strong>.</p>
                </div>
                <div className="flex -space-x-4">
                  {categorias.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-surface flex items-center justify-center shadow-sm">
                      <LucideIcon name={c.icon_name || 'Folder'} size={20} className="text-primary/60" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleInputChange('categoria_id', cat.id)
                      // Rolar suavemente para o botão de avançar após selecionar
                      setTimeout(() => {
                        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }, 100)
                    }}
                    className={`p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 transition-all text-left relative group flex flex-col items-center sm:items-start text-center sm:text-left ${
                      formData.categoria_id === cat.id 
                      ? 'bg-primary/5 border-primary shadow-glow-cyan' 
                      : 'bg-white border-border/50 hover:border-primary/30 hover:bg-surface shadow-sm'
                    }`}
                  >
                    <div className="mb-2 sm:mb-6 group-hover:scale-110 transition-transform inline-block text-primary/80">
                      <LucideIcon name={cat.icon_name || 'Folder'} size={64} strokeWidth={1.2} className="w-8 h-8 sm:w-16 sm:h-16" />
                    </div>
                    <h3 className="font-black text-dark text-xs sm:text-xl leading-tight uppercase italic mb-1 sm:mb-3">{cat.label}</h3>
                    <p className="hidden sm:block text-xs text-muted font-bold line-clamp-2 leading-relaxed">{cat.instrucao_publica}</p>
                    {formData.categoria_id === cat.id && (
                      <div className="absolute top-1 right-1 sm:top-4 sm:right-4 text-primary animate-bounce-subtle">
                        <CheckCircle2 size={12} className="sm:w-6 sm:h-6" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {currentCategory?.aviso_legal && (
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 items-start animate-fade-in">
                  <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Aviso Importante</p>
                    <p className="text-sm font-bold text-amber-800 leading-snug italic">{currentCategory?.aviso_legal}</p>
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="flex justify-end pt-6 pb-20 sm:pb-0">
                <button onClick={handleNext} disabled={!formData.categoria_id} className="btn-primary w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-3 shadow-glow-cyan transition-all disabled:opacity-30 fixed bottom-4 right-4 left-4 sm:static sm:bottom-auto sm:right-auto sm:left-auto z-40">
                  <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Próximo: Relato</span>
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter italic uppercase">Relato do Ocorrido</h2>
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
                    id="field-titulo"
                    className="input h-16 rounded-2xl text-lg font-bold border-2 focus:ring-4 focus:ring-primary/5 transition-all" 
                    placeholder="Ex: Obra abandonada no centro" 
                    value={formData.titulo} 
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    onBlur={() => { if(formData.titulo) handleFieldScroll('field-descricao') }}
                  />
                </div>

                <div className="space-y-3">
                  <label className="label text-[10px] font-black uppercase tracking-[0.2em] text-primary label-required">Descrição Detalhada</label>
                  <div className="relative group">
                    <textarea 
                      id="field-descricao"
                      className="input min-h-[220px] rounded-[2rem] p-6 leading-relaxed text-base border-2 group-focus-within:ring-4 group-focus-within:ring-primary/5 transition-all"
                      placeholder="Descreva aqui os fatos, pessoas envolvidas..." 
                      value={formData.descricao_original} 
                      onChange={(e) => handleInputChange('descricao_original', e.target.value)}
                      onBlur={() => { if(formData.descricao_original) handleFieldScroll() }}
                    />
                  </div>
                </div>
              </div>

              <div ref={bottomRef} className="flex items-center justify-between pt-8 border-t border-border/40 pb-20 sm:pb-0">
                <button onClick={handleBack} className="group flex items-center gap-3 text-[10px] sm:text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                  <ArrowLeft size={16} className="sm:w-5 sm:h-5" /> Voltar
                </button>
                <button 
                  onClick={() => { 
                    if (!formData.titulo || !formData.descricao_original) { 
                      toast.error('Preencha o título e a descrição'); 
                      return 
                    }
                    handleNext() 
                  }} 
                  className="btn-primary w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-3 shadow-glow-cyan transition-all fixed bottom-4 right-4 left-24 sm:static sm:bottom-auto sm:right-auto sm:left-auto z-40"
                >
                  <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Próximo: Local</span>
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter italic uppercase">Onde aconteceu?</h2>
                  <p className="text-muted text-sm font-medium">A localização exata agiliza a resposta.</p>
                </div>
                <div className="hidden sm:flex p-5 bg-primary/5 text-primary rounded-[2rem] border border-primary/10"><MapPin size={32} /></div>
              </div>

              {/* Botão de Geolocalização Rápida */}
              <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${geolocalizando ? 'bg-primary text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
                    <Zap size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Preenchimento Automático</p>
                    <p className="text-xs font-bold text-dark/70 italic">Estou no local agora e quero preencher usando meu GPS.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleGeolocalizar}
                  disabled={geolocalizando}
                  className="btn-primary w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {geolocalizando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Localizando...
                    </>
                  ) : (
                    <>
                      <MapPin size={16} />
                      Usar minha localização
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center -mt-4">
                <button 
                  type="button"
                  onClick={() => handleFieldScroll('field-cep')}
                  className="text-[9px] font-black text-muted/60 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 group italic"
                >
                  <span className="w-4 h-[1px] bg-muted/30 group-hover:bg-primary/30 transition-all"></span>
                  prefiro preencher manualmente meu endereço
                  <span className="w-4 h-[1px] bg-muted/30 group-hover:bg-primary/30 transition-all"></span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dark uppercase tracking-widest px-1">CEP</label>
                  <input id="field-cep" className="input h-14 rounded-xl border-2 font-bold" inputMode="numeric" placeholder="00000-000" value={formData.cep} onChange={(e) => handleCepChange(e.target.value)} onBlur={() => handleFieldScroll('field-cidade')} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dark uppercase tracking-widest px-1">Cidade</label>
                  <input id="field-cidade" className="input h-14 rounded-xl border-2 font-bold" placeholder="Ex: Campo Grande" value={formData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} onBlur={() => handleFieldScroll('field-local')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-dark uppercase tracking-widest px-1">Logradouro / Rua</label>
                  <input id="field-local" className="input h-14 rounded-xl border-2 font-bold" placeholder="Rua, Avenida..." value={formData.local} onChange={(e) => handleInputChange('local', e.target.value)} onBlur={() => handleFieldScroll('field-bairro')} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dark uppercase tracking-widest px-1">Bairro</label>
                  <input id="field-bairro" className="input h-14 rounded-xl border-2 font-bold" placeholder="Ex: Centro" value={formData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} onBlur={() => handleFieldScroll()} />
                </div>
              </div>

              <div ref={bottomRef} className="flex items-center justify-between pt-8 border-t border-border/40 pb-20 sm:pb-0">
                <button onClick={handleBack} className="group flex items-center gap-3 text-[10px] sm:text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                  <ArrowLeft size={16} className="sm:w-5 sm:h-5" /> Voltar
                </button>
                <button onClick={handleNext} className="btn-primary w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-3 shadow-glow-cyan transition-all fixed bottom-4 right-4 left-24 sm:static sm:bottom-auto sm:right-auto sm:left-auto z-40">
                  <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Próximo: Provas</span>
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-dark tracking-tighter italic uppercase">Provas & Evidências</h2>
                  <p className="text-muted text-sm font-medium">Anexe fotos, vídeos ou documentos.</p>
                </div>
                <div className="hidden sm:flex p-5 bg-primary/5 text-primary rounded-[2rem] border border-primary/10"><Paperclip size={32} /></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative group">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="file-upload" 
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/*"
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-border/60 rounded-[3rem] bg-surface cursor-pointer hover:bg-surface/80 transition-all">
                    <Paperclip size={40} className="mb-4 text-primary" />
                    <span className="text-lg font-black text-dark uppercase tracking-tight">Anexar Arquivos</span>
                    <div className="mt-4 space-y-1 text-center">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Máximo 5 arquivos</p>
                      <p className="text-[9px] text-muted/60 font-medium italic">
                        Formatos: Fotos, PDF, Word ou Áudios (Máx 4MB/cada)
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  {formData.arquivos.map((f, i) => (
                    <div key={i} className={`p-3 border rounded-2xl flex items-center justify-between shadow-sm transition-all ${
                      f.status === 'erro' ? 'bg-red-50 border-red-200' : 
                      f.status === 'enviando' ? 'bg-blue-50 border-blue-200 animate-pulse' : 
                      'bg-white border-border/50'
                    }`}>
                      <div className="flex items-center gap-3 truncate">
                        {f.status === 'enviando' ? (
                          <Loader2 size={14} className="text-primary animate-spin" />
                        ) : f.status === 'erro' ? (
                          <AlertTriangle size={14} className="text-red-500" />
                        ) : (
                          <CheckCircle2 size={14} className="text-green-500" />
                        )}
                        <p className={`text-[10px] font-black truncate ${f.status === 'erro' ? 'text-red-700' : 'text-dark'}`}>
                          {f.name}
                        </p>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-muted hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all" title="Remover arquivo">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.arquivos.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <CloudOff size={32} className="mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum arquivo anexado</p>
                    </div>
                  )}
                </div>
              </div>

              <div ref={bottomRef} className="flex items-center justify-between pt-8 border-t border-border/40 pb-20 sm:pb-0">
                <button onClick={handleBack} className="group flex items-center gap-3 text-[10px] sm:text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                  <ArrowLeft size={16} className="sm:w-5 sm:h-5" /> Voltar
                </button>
                <button onClick={handleNext} className="btn-primary w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-3 shadow-glow-cyan transition-all bg-dark hover:bg-black fixed bottom-4 right-4 left-24 sm:static sm:bottom-auto sm:right-auto sm:left-auto z-40">
                  <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Próximo: Revisão</span>
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter italic uppercase text-primary">
                    {otpValidado ? 'Finalização Oficial' : 'Segurança & Validação'}
                  </h2>
                  <p className="text-muted text-sm font-medium">
                    {otpValidado ? 'Preencha os dados finais para protocolar.' : 'Valide seu e-mail para prosseguir.'}
                  </p>
                </div>
              </div>

              <div className={`p-8 sm:p-10 rounded-[3rem] space-y-8 relative overflow-hidden transition-all duration-700 ${otpValidado ? 'bg-surface border-2 border-primary/20' : 'bg-dark text-white'}`}>
                
                {/* EXPLICAÇÃO INICIAL */}
                {!otpValidado && (
                  <div className="bg-white/10 border border-white/20 p-6 rounded-3xl flex gap-4 relative z-10 backdrop-blur-md shadow-inner">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <ShieldCheck size={24} className="text-secondary shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Protocolo de Validação</h4>
                      <p className="text-[11px] text-white/70 leading-relaxed font-medium italic">
                        Validamos sua identidade via e-mail para garantir a integridade da <strong>DENUNCIA MS</strong> e proteger o sistema contra robôs.
                      </p>
                    </div>
                  </div>
                )}

                {/* FASE 1: NOME E EMAIL */}
                {!otpValidado && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Nome Completo *</p>
                      <input className="bg-white/5 border-2 border-white/10 rounded-2xl h-14 p-4 text-sm w-full text-white"
                        placeholder="Seu nome" disabled={otpEnviado} value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">E-mail *</p>
                      <input type="email" className="bg-white/5 border-2 border-white/10 rounded-2xl h-14 p-4 text-sm w-full text-white"
                        placeholder="seu@email.com" disabled={otpEnviado} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* FASE 2: CÓDIGO OTP */}
                {!otpValidado && (
                  <div className="pt-4 relative z-10">
                    {!otpEnviado ? (
                      <button onClick={handleSolicitarOTP} disabled={loadingOtp || !validarEmail(formData.email) || !formData.nome || cooldown > 0 || !isOnline}
                        className="w-full h-16 bg-secondary text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl disabled:opacity-30 flex justify-center items-center gap-3 transition-all">
                        {loadingOtp ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                        {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Gerar Código de Segurança'}
                      </button>
                    ) : (
                      <div className="bg-white/5 border border-secondary/30 p-8 rounded-[2rem] space-y-6 text-center animate-slide-up">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Código Enviado</p>
                        <input ref={otpInputRef} className="bg-black/40 border-2 border-secondary/40 rounded-2xl h-20 text-center text-4xl font-black text-white w-full max-w-[320px] mx-auto block"
                          placeholder="000000" maxLength={6} inputMode="numeric" value={formData.otpToken} onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '')
                            handleInputChange('otpToken', val)
                            if (val.length === 6) {
                              setTimeout(handleVerificarOTP, 100)
                            }
                          }} />
                        <div className="flex flex-col gap-3">
                          <button onClick={handleVerificarOTP} disabled={loadingOtp || formData.otpToken.length !== 6}
                            className="btn-primary bg-secondary text-white border-none h-14 w-full max-w-[320px] mx-auto rounded-xl uppercase text-[10px] font-black tracking-widest">
                            {loadingOtp ? <Loader2 className="animate-spin" /> : 'Verificar Identidade'}
                          </button>
                          <button onClick={() => { setOtpEnviado(false); handleInputChange('otpToken', '') }} 
                            className="text-[10px] text-white/30 uppercase font-black hover:text-white mx-auto block pt-2 underline transition-colors">
                            Reenviar código
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FASE 3: IDENTIFICAÇÃO FINAL (CPF E WHATSAPP) */}
                {otpValidado && (
                  <div className="space-y-8 animate-slide-up">
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Lock size={20} className="animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Sua Identidade Protegida</h4>
                      </div>
                      <p className="text-xs text-dark/70 leading-relaxed font-medium italic text-justify">
                        Seus dados são criptografados por lei e sua denuncia é enviada sob sigilo absoluto. A <strong>DENUNCIA MS</strong> garante que sua identidade seja preservada durante todo o processo oficial, conforme a LGPD e LAI.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] pl-1">WhatsApp / Telefone *</p>
                        <input 
                          id="field-telefone"
                          className="bg-white border-2 border-primary/10 rounded-2xl h-16 p-4 text-lg font-bold w-full text-dark shadow-sm focus:border-primary transition-all"
                          placeholder="(67) 99999-9999" 
                          inputMode="tel"
                          value={formData.telefone} 
                          onChange={(e) => handleTelefoneChange(e.target.value)} 
                          onBlur={() => { if(formData.telefone) handleFieldScroll('field-cpf') }}
                          maxLength={15} 
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] pl-1">CPF Oficial *</p>
                        <input 
                          id="field-cpf"
                          className="bg-white border-2 border-primary/10 rounded-2xl h-16 p-4 text-lg font-bold w-full text-dark shadow-sm focus:border-primary transition-all"
                          placeholder="000.000.000-00" 
                          inputMode="numeric"
                          value={formData.cpf} 
                          onChange={(e) => handleCpfChange(e.target.value)} 
                          onBlur={() => { if(formData.cpf) handleFieldScroll('field-consentimento') }}
                          maxLength={14} 
                        />
                      </div>
                    </div>

                    {/* TERMO DE RESPONSABILIDADE JURÍDICA */}
                    <label id="field-consentimento" className={`flex items-start gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.consentimento ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-border/50'}`}>
                      <input type="checkbox" className="hidden" checked={formData.consentimento} onChange={(e) => {
                        handleInputChange('consentimento', e.target.checked)
                        if(e.target.checked) handleFieldScroll()
                      }} />
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 mt-1 transition-all ${formData.consentimento ? 'bg-primary border-primary text-white' : 'bg-white border-border/60 text-transparent'}`}>
                        <Check size={16} strokeWidth={4} />
                      </div>
                      <div className="space-y-2 text-left">
                        <p className="text-[10px] font-black text-dark uppercase tracking-widest italic">DECLARAÇÃO DE VERACIDADE E RESPONSABILIDADE JURÍDICA</p>
                        <p className="text-[11px] text-muted font-medium leading-relaxed italic">
                          Confirmo, sob as penas da lei, que os fatos aqui relatados são fidedignos e condizentes com a verdade. Declaro estar ciente de que a prestação de informações falsas ou a comunicação de crime inexistente configura o crime de **Denunciação Caluniosa (Art. 339 do Código Penal)**, além de sujeitar o declarante a sanções civis por danos morais e materiais e responsabilidades administrativas, conforme a legislação brasileira vigente.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <button 
                  onClick={() => setPreviewAberto(!previewAberto)} 
                  disabled={!validarTelefone(formData.telefone) || !validarCPF(formData.cpf)}
                  className="w-full p-6 bg-surface border-2 border-border/50 rounded-3xl flex items-center justify-between group hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <FileText className={(!validarTelefone(formData.telefone) || !validarCPF(formData.cpf)) ? 'text-muted' : 'text-primary'} size={24} />
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Visualizar Cópia Digital</p>
                      {(!validarTelefone(formData.telefone) || !validarCPF(formData.cpf)) && (
                        <p className="text-[10px] text-red-500 font-bold uppercase italic mt-1">Insira um Telefone e CPF válidos para liberar a prévia</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={20} className={`text-muted transition-transform ${previewAberto ? 'rotate-90' : ''}`} />
                </button>

                {previewAberto && (
                  <div className="p-6 bg-white border-2 border-border/30 rounded-[2rem] animate-slide-up">
                    <EmailPreview 
                      protocolo="PREVIEW"
                      categoria={currentCategory?.label || ''}
                      titulo={formData.titulo}
                      descricao={formData.descricao_original}
                      local={formData.local}
                      data_ocorrido={formData.data_ocorrido}
                      nome={formData.nome}
                      email={formData.email}
                      telefone={formData.telefone}
                      cpf={formData.cpf}
                      totalArquivos={formData.arquivos.length}
                    />
                  </div>
                )}

                <div ref={bottomRef} className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-6 pb-20 sm:pb-0">
                  <button onClick={handleBack} disabled={loading} className="group flex items-center gap-3 text-[10px] sm:text-[11px] uppercase font-black text-muted hover:text-dark transition-all">
                    <ArrowLeft size={18} className="sm:w-5 sm:h-5" /> Voltar
                  </button>
                  <button 
                    onClick={() => {
                      console.log('[wizard] Clique no botão Finalizar detectado.')
                      if (!formData.consentimento) { toast.error('Concorde com os termos primeiro.'); return }
                      if (!validarTelefone(formData.telefone)) { toast.error('Telefone inválido.'); return }
                      if (!validarCPF(formData.cpf)) { toast.error('CPF inválido.'); return }
                      handleSubmit()
                    }}
                    disabled={loading || !formData.consentimento || !otpValidado || !isOnline || !validarTelefone(formData.telefone) || !validarCPF(formData.cpf)}
                    className="btn-primary w-full sm:w-auto h-14 sm:h-20 px-8 sm:px-12 rounded-xl sm:rounded-[2rem] gap-4 bg-secondary hover:bg-secondary-600 disabled:opacity-30 shadow-glow-green fixed bottom-4 right-4 left-24 sm:static sm:bottom-auto sm:right-auto sm:left-auto z-40"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={20} className="sm:w-6 sm:h-6" />}
                    <span className="font-black uppercase tracking-[0.2em] text-[11px] sm:text-sm">
                      {loading ? 'Protocolando...' : isOnline ? 'Finalizar Denuncia' : 'Aguardando Sinal...'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



