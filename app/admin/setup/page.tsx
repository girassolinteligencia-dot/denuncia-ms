'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    try {
      // 1. Tenta criar o usuário no Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: 'Administrador Master'
          }
        }
      })

      if (signUpError) throw signUpError

      setStatus('success')
      setMessage('Usuário mestre provisionado! Verifique seu e-mail (se a confirmação estiver ativa) ou tente fazer login em /login.')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'Erro ao configurar administrador.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-grid-slate-100">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-card shadow-card-lg border border-border overflow-hidden">
          <div className="bg-primary p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <ShieldCheck size={32} className="text-secondary" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Setup de Infraestrutura</h1>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Provisionamento Master</p>
          </div>

          <div className="p-8">
            {status === 'success' ? (
              <div className="space-y-6 text-center animate-scale-up">
                <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-dark">Acesso Criado!</h3>
                  <p className="text-sm text-muted">{message}</p>
                </div>
                <Link href="/login" className="btn-primary w-full gap-2">
                  Ir para o Login <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSetup} className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-[10px] font-bold leading-relaxed">
                  ⚠️ ESTA PÁGINA É APENAS PARA O SETUP INICIAL. <br/>
                  Ela permitirá criar o primeiro usuário master do sistema diretamente.
                </div>

                {status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 text-xs font-bold">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">E-mail Master</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="master@denunciams.com.br"
                      className="input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Senha de Admin</label>
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full h-12 gap-2 bg-dark hover:bg-black"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'CRIAR ACESSO MASTER'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
