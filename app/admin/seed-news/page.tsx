'use client'

import React, { useState } from 'react'
import { Newspaper, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

// Simulando a Server Action diretamente aqui para facilitar
import { upsertNoticia } from '@/lib/actions/admin-conteudo'

export default function SeedNewsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSeed = async () => {
    setStatus('loading')
    setMessage('Iniciando geração de notícias...')

    const newsData = [
      {
        titulo: 'Falta de Insumos Básicos em Unidades de Saúde Preocupa População',
        conteudo: 'Relatos enviados à plataforma indicam uma crescente escassez de medicamentos e materiais básicos em diversas unidades de saúde. A má gestão dos estoques tem impactado diretamente o atendimento emergencial, gerando filas e adiamento de procedimentos eletivos. Especialistas apontam que a otimização dos recursos e o monitoramento em tempo real são essenciais para reverter o cenário.',
        categoria: 'Saúde',
        imagem_url: 'https://images.unsplash.com/photo-1586773860418-d3b979515c3d?auto=format&fit=crop&q=80&w=800',
        publicado: true
      },
      {
        titulo: 'Transparência Pública: Denúncias ajudam a identificar desvios em licitações',
        conteudo: 'O uso de ferramentas digitais de denúncia tem se mostrado fundamental no combate à corrupção e ao desperdício de dinheiro público. Recentemente, indícios de irregularidades em contratos públicos foram detectados graças à colaboração cidadã ativa. A fiscalização social permite que órgãos de controle atuem preventivamente, garantindo que o imposto retorne em serviços de qualidade.',
        categoria: 'Corrupção',
        imagem_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
        publicado: true
      },
      {
        titulo: 'Infraestrutura Escolar: Problemas estruturais afetam o aprendizado',
        conteudo: 'A precariedade de instalações escolares tem sido tema recorrente de denúncias recebidas pela nossa central. Salas de aula sem manutenção adequada, goteiras e falta de equipamentos pedagógicos básicos comprometem a qualidade do ensino e a segurança de alunos e professores. A gestão educacional enfrenta o desafio de equilibrar orçamentos para reformas urgentes.',
        categoria: 'Educação',
        imagem_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
        publicado: true
      }
    ]

    try {
      for (const item of newsData) {
        setMessage(`Inserindo: ${item.titulo}...`)
        const res = await upsertNoticia(item)
        if (!res.success) throw new Error(res.error)
      }
      setStatus('success')
      setMessage('Todas as notícias foram inseridas com sucesso!')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(`Erro: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
        <div className="p-8 bg-primary text-white text-center space-y-2">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Newspaper size={32} />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Gerador de Conteúdo</h1>
          <p className="text-white/60 text-sm font-medium">Insira notícias de exemplo na plataforma com um clique.</p>
        </div>

        <div className="p-8 space-y-6">
           {status === 'idle' && (
             <button 
               onClick={handleSeed}
               className="w-full py-4 bg-secondary text-dark font-black uppercase italic tracking-widest rounded-xl hover:bg-secondary/90 transition-all shadow-glow-green flex items-center justify-center gap-3"
             >
               <Zap size={20} className="fill-current" />
               Gerar Notícias Agora
             </button>
           )}

           {status === 'loading' && (
             <div className="text-center py-4 space-y-4">
                <Loader2 size={40} className="animate-spin text-primary mx-auto" />
                <p className="text-sm font-bold text-muted animate-pulse">{message}</p>
             </div>
           )}

           {status === 'success' && (
             <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle2 size={32} />
                </div>
                <p className="text-sm font-bold text-success uppercase tracking-tight">{message}</p>
                <button 
                  onClick={() => window.location.href = '/admin/conteudo'}
                  className="btn-primary w-full bg-dark text-white border-none h-12"
                >
                  Ver Notícias no Painel
                </button>
             </div>
           )}

           {status === 'error' && (
             <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
                   <AlertCircle size={32} />
                </div>
                <p className="text-sm font-bold text-error">{message}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="btn-primary w-full"
                >
                  Tentar Novamente
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
