'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { registrarVoto, inscreverNewsletter } from '@/lib/actions/engagement'

const EMOJIS = [
  { id: 'ruim', icon: '😞', label: 'Ruim' },
  { id: 'regular', icon: '😐', label: 'Regular' },
  { id: 'bom', icon: '🙂', label: 'Bom' },
  { id: 'excelente', icon: '😍', label: 'Ótimo' },
]

export function FeedbackNewsletter({ ativa = true, showNewsletter = true }: { ativa?: boolean, showNewsletter?: boolean }) {
  const [voto, setVoto] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [enviadoVoto, setEnviadoVoto] = useState(false)
  const [enviadoEmail, setEnviadoEmail] = useState(false)

  if (!ativa) return null

  const handleVoto = async (id: string) => {
    if (enviadoVoto) return
    setVoto(id)
    const res = await registrarVoto(id)
    if (res.success) {
      setEnviadoVoto(true)
      toast.success('Obrigado pelo seu feedback!')
    } else {
      toast.error('Erro ao enviar feedback.')
    }
  }

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || enviadoEmail) return
    setLoadingEmail(true)
    const res = await inscreverNewsletter(email)
    setLoadingEmail(false)
    if (res.success) {
      setEnviadoEmail(true)
      toast.success(res.message || 'Inscrição realizada com sucesso!')
      setEmail('')
    } else {
      toast.error(res.error || 'Erro ao realizar inscrição.')
    }
  }

  return (
    <section className="py-10 sm:py-16 bg-dark relative overflow-hidden">
      {/* Elementos Decorativos */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container-page relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 sm:p-16 backdrop-blur-md shadow-2xl">
          <div className={`grid grid-cols-1 ${showNewsletter ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-16 items-center`}>
            
            {/* LADO ESQUERDO: PESQUISA */}
            <div className={`space-y-8 text-center ${showNewsletter ? 'lg:text-left' : ''}`}>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter italic uppercase">
                  Sua <span className="text-secondary">Voz</span> Importa
                </h3>
                <p className="text-white/60 text-sm font-medium">Como está sendo sua experiência com a nossa plataforma?</p>
              </div>

              {enviadoVoto ? (
                <div className="p-8 bg-secondary/10 border border-secondary/20 rounded-[2rem] flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 bg-secondary text-dark rounded-2xl flex items-center justify-center shadow-glow-green">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-secondary font-black uppercase tracking-widest text-sm italic">Feedback Recebido!</p>
                </div>
              ) : (
                <div className={`flex justify-center ${showNewsletter ? 'lg:justify-start' : ''} gap-4 sm:gap-6`}>
                  {EMOJIS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => handleVoto(e.id)}
                      className={`group flex flex-col items-center gap-2 transition-all hover:scale-110 active:scale-95 ${voto === e.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <div className="text-4xl sm:text-6xl p-2 rounded-2xl bg-white/5 border border-white/10 group-hover:border-secondary/50 group-hover:bg-white/10 transition-all shadow-sm">
                        {e.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-secondary transition-colors">
                        {e.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LADO DIREITO: NEWSLETTER */}
            {showNewsletter && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest">
                    <Mail size={12} className="text-secondary" />
                    Mantenha-se informado
                  </div>
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Receba atualizações do MS</h4>
                  <p className="text-white/50 text-sm leading-relaxed font-medium">
                    Inscreva seu e-mail para receber notícias sobre casos resolvidos, transparência pública e novas ferramentas de fiscalização.
                  </p>
                </div>

                <form onSubmit={handleNewsletter} className="relative group">
                  <input
                    type="email"
                    required
                    disabled={enviadoEmail}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-16 sm:h-20 bg-white/5 border-2 border-white/10 rounded-2xl sm:rounded-3xl px-6 sm:px-8 text-white font-bold placeholder:text-white/20 focus:border-secondary transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingEmail || enviadoEmail || !email}
                    className="absolute right-2 top-2 bottom-2 px-6 sm:px-10 bg-secondary hover:bg-secondary-600 disabled:bg-white/10 text-dark font-black uppercase text-xs tracking-widest rounded-xl sm:rounded-2xl flex items-center gap-3 transition-all shadow-glow-green"
                  >
                    {loadingEmail ? <Loader2 className="animate-spin" /> : enviadoEmail ? <CheckCircle2 /> : <Send size={18} />}
                    <span className="hidden sm:inline">{enviadoEmail ? 'Inscrito' : 'Inscrever'}</span>
                  </button>
                </form>
                <p className="text-[10px] text-white/30 font-medium italic text-center lg:text-left">
                  * Respeitamos sua privacidade. Cancele a qualquer momento.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}
