'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { Megaphone, Lock, Mail, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/dashboard'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      router.push(redirect)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface flex items-center justify-center p-6 bg-grid-slate-100">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-accent shadow-glow-cyan group-hover:scale-110 transition-transform">
              <Megaphone size={28} className="fill-accent" />
            </div>
            <div className="text-left">
              <h1 className="font-black text-dark text-xl leading-none tracking-tighter uppercase italic">Denúncia <span className="text-primary">MS</span></h1>
              <p className="text-[9px] text-secondary font-black uppercase tracking-[0.2em] mt-1 italic">Mato Grosso do Sul</p>
            </div>
          </Link>
          <h2 className="text-2xl font-black text-dark tracking-tighter uppercase italic">Acesso <span className="underline decoration-secondary decoration-4 underline-offset-4">Administrativo</span></h2>
          <p className="text-muted text-sm font-medium mt-2">Identifique-se para acessar o painel operacional.</p>
        </div>

        <div className="bg-white rounded-card shadow-card-lg border border-border overflow-hidden">
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 text-xs font-bold animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1" htmlFor="email">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@denunciams.com.br"
                    className="input pl-12 h-12 text-sm font-bold bg-surface/50 border-border focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1" htmlFor="password">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-12 h-12 text-sm font-bold bg-surface/50 border-border focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-sm font-black uppercase tracking-widest gap-2 bg-dark hover:bg-black border-none"
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="p-4 bg-surface border-t border-border text-center">
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest leading-relaxed">
              Uso restrito a servidores autorizados.<br/>
              Acessos são monitorados e auditados.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <Link href="/sobre" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">
              Esqueci minha senha ou não tenho acesso
           </Link>
        </div>
      </div>
    </div>
  )
}
