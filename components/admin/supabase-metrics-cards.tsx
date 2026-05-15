'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Activity, Database, Cpu, Zap } from 'lucide-react'

interface MetricsData {
  conexoes: number
  tamanho_mb: number
  cpu: number
  commits: number
  success: boolean
}

export function SupabaseMetricsCards() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commitsPerSec, setCommitsPerSec] = useState<number>(0)
  
  const lastMetrics = useRef<{ commits: number; timestamp: number } | null>(null)

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics/supabase', {
        headers: {
          'x-cron-secret': 'denuncia-ms-cron-secret'
        }
      })
      const data: MetricsData = await res.json()
      
      if (data.success) {
        const now = Date.now()
        
        if (lastMetrics.current) {
          const deltaCommits = data.commits - lastMetrics.current.commits
          const deltaTime = (now - lastMetrics.current.timestamp) / 1000
          if (deltaTime > 0) {
            setCommitsPerSec(Math.max(0, deltaCommits / deltaTime))
          }
        }
        
        lastMetrics.current = { commits: data.commits, timestamp: now }
        setMetrics(data)
        setError(null)
      } else {
        setError((data as any).error || 'Erro desconhecido')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, threshold50: number, threshold80: number) => {
    if (value < threshold50) return 'text-green-400'
    if (value < threshold80) return 'text-amber-400'
    return 'text-red-400'
  }

  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-[2rem] border border-white/10"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-tight">
        Erro ao carregar métricas Supabase: {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Conexões */}
      <MetricCard
        title="Conexões Ativas"
        value={metrics?.conexoes || 0}
        icon={<Activity size={20} />}
        statusColor={getStatusColor(metrics?.conexoes || 0, 50, 80)}
        label="Sessões Postgres"
      />

      {/* Tamanho do Banco */}
      <MetricCard
        title="Armazenamento DB"
        value={`${metrics?.tamanho_mb || 0} MB`}
        icon={<Database size={20} />}
        statusColor={getStatusColor(metrics?.tamanho_mb || 0, 300, 450)}
        label="Capacidade"
        progress={((metrics?.tamanho_mb || 0) / 500) * 100}
        maxText="/ 500 MB"
      />

      {/* Commits/s */}
      <MetricCard
        title="Commits/s"
        value={commitsPerSec.toFixed(2)}
        icon={<Zap size={20} />}
        statusColor={getStatusColor(commitsPerSec, 10, 50)}
        label="Taxa de Transação"
      />

      {/* CPU */}
      <MetricCard
        title="CPU Load"
        value={`${(metrics?.cpu || 0).toFixed(1)}%`}
        icon={<Cpu size={20} />}
        statusColor={getStatusColor(metrics?.cpu || 0, 50, 80)}
        label="Processamento"
      />
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  statusColor: string
  label: string
  progress?: number
  maxText?: string
}

function MetricCard({ title, value, icon, statusColor, label, progress, maxText }: MetricCardProps) {
  return (
    <div className="bg-dark-soft border border-white/15 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group hover:border-accent/30 transition-all shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white/5 rounded-2xl shadow-inner text-white/70">{icon}</div>
        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <p className={`text-2xl font-black italic ${statusColor}`}>{value}</p>
          {maxText && <span className="text-[10px] text-white/40 font-bold ml-2">{maxText}</span>}
        </div>
        
        {progress !== undefined && (
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 mb-1 overflow-hidden">
             <div className={`h-1.5 rounded-full transition-all duration-1000 ${statusColor.replace('text-', 'bg-')}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
          </div>
        )}

        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-white/40 font-bold uppercase">{label}</p>
          {progress !== undefined && <span className={`text-[9px] font-black uppercase ${statusColor}`}>{progress.toFixed(1)}%</span>}
        </div>
      </div>
    </div>
  )
}
