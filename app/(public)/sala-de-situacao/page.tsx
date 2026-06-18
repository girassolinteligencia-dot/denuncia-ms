export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  Gauge,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { getSystemConfig } from '@/lib/actions/admin-config'
import {
  getPublicSituationData,
} from '@/lib/actions/public-situation'
import type {
  PublicSituationData,
  PublicSituationMetric,
  PublicSituationRank,
  PublicSituationStatus,
  PublicSituationTrend,
  SituationPeriod,
} from '@/lib/actions/public-situation'
import { MSMunicipalityMap } from '@/components/public/transparencia-mapa'

const periodLinks: Array<{ label: string; value: SituationPeriod }> = [
  { label: 'Hoje', value: 'hoje' },
  { label: '7 dias', value: 'semana' },
  { label: '30 dias', value: 'mes' },
]

const metricTone: Record<PublicSituationMetric['tone'], { border: string; bg: string; icon: string; stroke: string }> = {
  blue: {
    border: 'border-primary/20',
    bg: 'bg-primary/10',
    icon: 'text-primary',
    stroke: '#021691',
  },
  green: {
    border: 'border-secondary/25',
    bg: 'bg-secondary/10',
    icon: 'text-secondary',
    stroke: '#00843E',
  },
  amber: {
    border: 'border-accent/30',
    bg: 'bg-accent/15',
    icon: 'text-amber-600',
    stroke: '#FFB81C',
  },
  cyan: {
    border: 'border-electric/30',
    bg: 'bg-electric/10',
    icon: 'text-cyan-600',
    stroke: '#00A8A8',
  },
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(4, Math.min(96, Math.abs(value)))
}

function getPublicShareUrl() {
  const text = encodeURIComponent('Veja a Sala da Situacao Cidada do DenunciaMS: dados publicos, agregados e anonimizados.')
  const url = encodeURIComponent('https://www.denunciams.com.br/sala-de-situacao')
  return `https://wa.me/?text=${text}%20${url}`
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm font-semibold text-slate-500">
      {label}
    </div>
  )
}

function MetricCard({ metric }: { metric: PublicSituationMetric }) {
  const tone = metricTone[metric.tone]
  const dash = 158
  const gauge = clampPercent(metric.value)
  const offset = dash - (dash * gauge) / 100

  return (
    <article className={`rounded-card border ${tone.border} ${tone.bg} p-4 shadow-card`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-normal text-slate-500">{metric.label}</p>
          <p className="mt-2 text-3xl font-black leading-none tracking-normal text-slate-950">{metric.valueLabel}</p>
        </div>
        <div className={`rounded-btn bg-white p-2 shadow-sm ${tone.icon}`}>
          <Gauge size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <svg width="92" height="52" viewBox="0 0 92 52" aria-hidden="true" className="shrink-0">
          <path
            d="M12 46a34 34 0 0 1 68 0"
            fill="none"
            stroke="rgba(15, 23, 42, .12)"
            strokeLinecap="round"
            strokeWidth="10"
          />
          <path
            d="M12 46a34 34 0 0 1 68 0"
            fill="none"
            stroke={tone.stroke}
            strokeDasharray={dash}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="10"
          />
        </svg>
        <p className="text-xs font-semibold leading-snug text-slate-600">{metric.helper}</p>
      </div>
    </article>
  )
}

function RankingList({
  title,
  icon,
  items,
  emptyLabel,
}: {
  title: string
  icon: ReactNode
  items: PublicSituationRank[]
  emptyLabel: string
}) {
  return (
    <section className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-btn bg-primary/10 p-2 text-primary">{icon}</div>
        <h2 className="text-base font-black uppercase tracking-normal text-slate-950">{title}</h2>
      </div>

      {items.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="min-w-0 truncate text-sm font-black text-slate-800">{item.name}</p>
                <p className="shrink-0 text-sm font-black text-primary">{item.percent}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.max(item.percent, 4)}%` }} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-normal text-slate-500">
                {item.count.toLocaleString('pt-BR')} registros agregados
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TrendBars({ items }: { items: PublicSituationTrend[] }) {
  const max = Math.max(...items.map(item => item.count), 1)

  return (
    <section className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-btn bg-secondary/10 p-2 text-secondary">
          <TrendingUp size={18} />
        </div>
        <h2 className="text-base font-black uppercase tracking-normal text-slate-950">Pulso do periodo</h2>
      </div>

      {items.length === 0 ? (
        <EmptyState label="Sem dados suficientes para tendencia." />
      ) : (
        <div className="grid h-40 grid-cols-7 items-end gap-2 sm:grid-cols-10 md:grid-cols-12">
          {items.map(item => {
            const height = item.count === 0 ? 8 : Math.max(16, Math.round((item.count / max) * 100))
            return (
              <div key={item.label} className="flex h-full min-w-0 flex-col justify-end gap-2">
                <div className="flex h-full items-end rounded-full bg-slate-100 p-1">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-primary to-electric"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.count}`}
                  />
                </div>
                <span className="truncate text-center text-[10px] font-bold text-slate-500">{item.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function StatusGrid({ items }: { items: PublicSituationStatus[] }) {
  return (
    <section className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-btn bg-accent/20 p-2 text-amber-700">
          <BarChart3 size={18} />
        </div>
        <h2 className="text-base font-black uppercase tracking-normal text-slate-950">Fluxo operacional</h2>
      </div>

      {items.length === 0 ? (
        <EmptyState label="Nenhum fluxo agregado neste periodo." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.name} className="rounded-card border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-normal text-slate-500">{item.name}</p>
              <p className="mt-1 text-2xl font-black tracking-normal text-slate-950">{item.percent}%</p>
              <p className="text-xs font-semibold text-slate-500">{item.count.toLocaleString('pt-BR')} registros</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function PrivacyNotice({ threshold }: { threshold: number }) {
  return (
    <section className="rounded-card border border-secondary/20 bg-secondary/10 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-btn bg-white p-2 text-secondary shadow-sm">
          <LockKeyhole size={20} />
        </div>
        <div>
          <h2 className="text-base font-black uppercase tracking-normal text-slate-950">Anonimidade preservada</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
            Esta pagina mostra somente informacoes agregadas. Grupos com menos de {threshold} registros sao reunidos em
            blocos gerais para impedir identificacao indireta de pessoas, locais ou casos especificos.
          </p>
        </div>
      </div>
    </section>
  )
}

function DisabledState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark p-8 text-center text-white">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-secondary">
        <ShieldCheck size={42} />
      </div>
      <h1 className="max-w-sm text-3xl font-black uppercase tracking-normal">Sala em manutencao</h1>
      <p className="mt-4 max-w-md text-sm font-semibold leading-relaxed text-white/60">
        A visualizacao publica dos indicadores esta temporariamente indisponivel.
      </p>
      <Link href="/" className="mt-10 inline-flex items-center gap-2 rounded-btn bg-white px-4 py-2 text-sm font-black text-dark">
        Voltar ao inicio
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

function FallbackData(period: SituationPeriod): PublicSituationData {
  return {
    period,
    updatedAt: '--',
    periodLabel: period === 'hoje' ? 'Hoje' : period === 'semana' ? '7 dias' : '30 dias',
    privacyThreshold: 3,
    total: 0,
    totalLabel: '0',
    previousTotal: 0,
    variationLabel: '0%',
    metrics: [],
    categories: [],
    cities: [],
    trend: [],
    status: [],
    mapData: [],
  }
}

export default async function SalaDeSituacaoPage({
  searchParams,
}: {
  searchParams?: { periodo?: string }
}) {
  const isEnabled = await getSystemConfig('sala_situacao_ativa')

  if (!isEnabled.valor) {
    return <DisabledState />
  }

  const requestedPeriod =
    searchParams?.periodo === 'hoje' || searchParams?.periodo === 'semana' || searchParams?.periodo === 'mes'
      ? searchParams.periodo
      : 'semana'

  const situationResult = await getPublicSituationData(requestedPeriod)
  const data = situationResult.success && situationResult.data ? situationResult.data : FallbackData(requestedPeriod)
  const shareUrl = getPublicShareUrl()

  return (
    <main className="min-h-screen bg-surface text-slate-950">
      <section className="bg-dark text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-normal text-white/70">
              DenunciaMS
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-black uppercase tracking-normal text-secondary-100">
              <Radio size={14} />
              Atualizado {data.updatedAt}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-normal text-electric">
                <ShieldCheck size={14} />
                Publico, agregado e LGPD
              </div>
              <h1 className="max-w-3xl text-4xl font-black uppercase leading-none tracking-normal sm:text-5xl">
                Sala da Situacao Cidada
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-white/70">
                Um painel rapido para acompanhar o pulso das denuncias em Mato Grosso do Sul, com anonimidade preservada
                para gestao publica e comunicacao social do Bruno Ortiz.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/denunciar"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-btn bg-accent px-4 py-3 text-sm font-black uppercase tracking-normal text-dark shadow-card"
              >
                Denunciar
                <ArrowRight size={17} />
              </Link>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-btn border border-white/15 bg-white/10 px-4 py-3 text-sm font-black uppercase tracking-normal text-white"
              >
                Compartilhar
                <MessageCircle size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <nav className="mx-auto grid max-w-2xl grid-cols-3 gap-2" aria-label="Periodo dos indicadores">
          {periodLinks.map(period => (
            <Link
              key={period.value}
              href={`/sala-de-situacao?periodo=${period.value}`}
              className={`rounded-btn px-3 py-2 text-center text-sm font-black uppercase tracking-normal transition ${
                data.period === period.value ? 'bg-primary text-white shadow-card' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {period.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-5">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.metrics.length === 0 ? (
              <div className="col-span-2 sm:col-span-4">
                <EmptyState label="Indicadores indisponiveis no momento." />
              </div>
            ) : (
              data.metrics.map(metric => <MetricCard key={metric.label} metric={metric} />)
            )}
          </section>

          <TrendBars items={data.trend} />

          <div className="grid gap-5 md:grid-cols-2">
            <RankingList
              title="Categorias"
              icon={<Sparkles size={18} />}
              items={data.categories}
              emptyLabel="Sem categorias agregadas para este periodo."
            />
            <RankingList
              title="Cidades"
              icon={<MapPin size={18} />}
              items={data.cities}
              emptyLabel="Sem municipios com volume publico suficiente."
            />
          </div>

          <StatusGrid items={data.status} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-4">
              <p className="text-[11px] font-black uppercase tracking-normal text-slate-500">Resumo publico</p>
              <h2 className="mt-1 text-2xl font-black uppercase leading-none tracking-normal text-slate-950">
                {data.totalLabel} no periodo
              </h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                {data.variationLabel} em relacao ao periodo anterior. Dados de cidade e categoria usam agrupamento
                minimo para proteger a identidade dos denunciantes.
              </p>
            </div>
          </section>

          <PrivacyNotice threshold={data.privacyThreshold} />

          <section className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-btn bg-primary/10 p-2 text-primary">
                <MapPin size={18} />
              </div>
              <h2 className="text-base font-black uppercase tracking-normal text-slate-950">Mapa por municipio</h2>
            </div>
            <div className="h-[340px] overflow-hidden rounded-card border border-slate-100 bg-slate-50 sm:h-[420px] lg:h-[360px]">
              <MSMunicipalityMap data={data.mapData} />
            </div>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
              O mapa mostra apenas concentracao municipal agregada. Pontos, enderecos e coordenadas exatas nao sao
              publicados.
            </p>
          </section>
        </aside>
      </div>
    </main>
  )
}
