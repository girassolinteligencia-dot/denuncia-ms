'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

const MS_UTC_OFFSET_HOURS = 4
const MIN_PUBLIC_GROUP_SIZE = 3

export type SituationPeriod = 'hoje' | 'semana' | 'mes'

export type PublicSituationMetric = {
  label: string
  value: number
  valueLabel: string
  helper: string
  tone: 'blue' | 'green' | 'amber' | 'cyan'
}

export type PublicSituationRank = {
  name: string
  percent: number
}

export type PublicSituationTrend = {
  label: string
  percent: number
}

export type PublicSituationStatus = {
  name: string
  percent: number
}

export type PublicSituationData = {
  period: SituationPeriod
  updatedAt: string
  periodLabel: string
  privacyThreshold: number
  variationLabel: string
  metrics: PublicSituationMetric[]
  categories: PublicSituationRank[]
  cities: PublicSituationRank[]
  trend: PublicSituationTrend[]
  status: PublicSituationStatus[]
  mapData: Array<{ name: string; count: number }>
  hasProtectedCategories: boolean
  hasProtectedCities: boolean
}

type PublicSituationRow = {
  criado_em: string | null
  status: string | null
  municipio: string | null
  cidade: string | null
  categoria_id: string | null
  categorias: { label?: string | null } | Array<{ label?: string | null }> | null
}

const periodLabels: Record<SituationPeriod, string> = {
  hoje: 'Hoje',
  semana: '7 dias',
  mes: '30 dias',
}

const periodDays: Record<SituationPeriod, number> = {
  hoje: 1,
  semana: 7,
  mes: 30,
}

const statusLabels: Record<string, string> = {
  recebida: 'Recebidas',
  em_analise: 'Em análise',
  encaminhada: 'Encaminhadas',
  resolvida: 'Resolvidas',
  arquivada: 'Arquivadas',
}

function normalizePeriod(period?: string): SituationPeriod {
  if (period === 'hoje' || period === 'semana' || period === 'mes') return period
  return 'semana'
}

function getMsDayStartUtc(daysAgo = 0) {
  const nowUTC = new Date()
  const msTime = new Date(nowUTC.getTime() - MS_UTC_OFFSET_HOURS * 60 * 60 * 1000)
  msTime.setUTCDate(msTime.getUTCDate() - daysAgo)
  msTime.setUTCHours(0, 0, 0, 0)
  return new Date(msTime.getTime() + MS_UTC_OFFSET_HOURS * 60 * 60 * 1000)
}

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Campo_Grande',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalizeName(value?: string | null, fallback = 'Não informado') {
  const cleaned = value?.trim()
  if (!cleaned) return fallback

  return cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

function getCategoryName(row: PublicSituationRow) {
  const relation = Array.isArray(row.categorias) ? row.categorias[0] : row.categorias
  return relation?.label?.trim() || 'Geral'
}

function percent(count: number, total: number) {
  if (total <= 0) return 0
  return Math.round((count / total) * 100)
}

function buildRanks(
  counts: Record<string, number>,
  total: number,
  limit: number
): { items: PublicSituationRank[]; hasProtectedItems: boolean } {
  let hasProtectedItems = false

  const items = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .reduce<PublicSituationRank[]>((acc, [name, count]) => {
      if (count >= MIN_PUBLIC_GROUP_SIZE) {
        acc.push({
          name,
          percent: percent(count, total),
        })
      } else {
        hasProtectedItems = true
      }

      return acc
    }, [])
    .slice(0, limit)

  return { items, hasProtectedItems }
}

function buildTrend(rows: PublicSituationRow[], period: SituationPeriod): PublicSituationTrend[] {
  const days = periodDays[period]
  const labels = Array.from({ length: days }, (_, index) => {
    const start = getMsDayStartUtc(days - index - 1)
    return {
      key: start.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Campo_Grande',
        day: '2-digit',
        month: period === 'mes' ? '2-digit' : undefined,
        weekday: period === 'semana' ? 'short' : undefined,
      }).format(start),
      count: 0,
    }
  })

  const byKey = new Map(labels.map(item => [item.key, item]))

  rows.forEach(row => {
    if (!row.criado_em) return
    const date = new Date(row.criado_em)
    const msDate = new Date(date.getTime() - MS_UTC_OFFSET_HOURS * 60 * 60 * 1000)
    const key = msDate.toISOString().slice(0, 10)
    const item = byKey.get(key)
    if (item) item.count += 1
  })

  if (period === 'mes') {
    return labels.filter((_, index) => index % 3 === 0 || index === labels.length - 1)
      .map(item => ({
        label: item.label,
        percent: percent(item.count, Math.max(...labels.map(label => label.count), 1)),
      }))
  }

  const max = Math.max(...labels.map(label => label.count), 1)

  return labels.map(item => ({
    label: item.label,
    percent: percent(item.count, max),
  }))
}

export async function getPublicSituationData(periodParam?: string) {
  noStore()

  const period = normalizePeriod(periodParam)
  const days = periodDays[period]
  const currentStart = getMsDayStartUtc(days - 1)
  const previousStart = getMsDayStartUtc(days * 2 - 1)
  const now = new Date()
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('denuncias')
      .select(`
        criado_em,
        status,
        municipio,
        cidade,
        categoria_id,
        categorias ( label )
      `)
      .gte('criado_em', previousStart.toISOString())
      .order('criado_em', { ascending: true })

    if (error) throw error

    const rows = (data || []) as PublicSituationRow[]
    const currentRows = rows.filter(row => {
      if (!row.criado_em) return false
      const createdAt = new Date(row.criado_em)
      return createdAt >= currentStart && createdAt <= now
    })
    const previousRows = rows.filter(row => {
      if (!row.criado_em) return false
      const createdAt = new Date(row.criado_em)
      return createdAt >= previousStart && createdAt < currentStart
    })

    const total = currentRows.length
    const previousTotal = previousRows.length
    const variation =
      previousTotal === 0
        ? total > 0
          ? 100
          : 0
        : Math.round(((total - previousTotal) / previousTotal) * 100)

    const categoryCounts: Record<string, number> = {}
    const cityCounts: Record<string, number> = {}
    const statusCounts: Record<string, number> = {}

    currentRows.forEach(row => {
      const category = getCategoryName(row)
      const city = normalizeName(row.municipio || row.cidade, 'NÃO INFORMADO')
      const status = row.status || 'recebida'

      categoryCounts[category] = (categoryCounts[category] || 0) + 1
      cityCounts[city] = (cityCounts[city] || 0) + 1
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const resolvedCount = (statusCounts.resolvida || 0) + (statusCounts.arquivada || 0)
    const forwardedCount = statusCounts.encaminhada || 0
    const activeCount = (statusCounts.recebida || 0) + (statusCounts.em_analise || 0)

    const citiesResult = buildRanks(cityCounts, total, 6)
    const categoriesResult = buildRanks(categoryCounts, total, 6)
    const cities = citiesResult.items
    const categories = categoriesResult.items

    const status = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name: statusLabels[name] || normalizeName(name.replace(/_/g, ' ')),
        percent: percent(count, total),
      }))

    const metrics: PublicSituationMetric[] = [
      {
        label: 'Em acompanhamento',
        value: percent(activeCount, total),
        valueLabel: `${percent(activeCount, total)}%`,
        helper: `Demandas recebidas ou em análise no período`,
        tone: 'blue',
      },
      {
        label: 'Variação',
        value: variation,
        valueLabel: `${variation > 0 ? '+' : ''}${variation}%`,
        helper: 'Comparado ao período anterior',
        tone: 'cyan',
      },
      {
        label: 'Encaminhadas',
        value: percent(forwardedCount, total),
        valueLabel: `${percent(forwardedCount, total)}%`,
        helper: `Percentual do período`,
        tone: 'amber',
      },
      {
        label: 'Resolvidas/arquivadas',
        value: percent(resolvedCount, total),
        valueLabel: `${percent(resolvedCount, total)}%`,
        helper: `Percentual do período`,
        tone: 'green',
      },
    ]

    return {
      success: true,
      data: {
        period,
        updatedAt: formatUpdatedAt(now),
        periodLabel: periodLabels[period],
        privacyThreshold: MIN_PUBLIC_GROUP_SIZE,
        variationLabel: `${variation > 0 ? '+' : ''}${variation}%`,
        metrics,
        categories,
        cities,
        trend: buildTrend(currentRows, period),
        status,
        mapData: cities.map(city => ({ name: city.name, count: city.percent })),
        hasProtectedCategories: categoriesResult.hasProtectedItems,
        hasProtectedCities: citiesResult.hasProtectedItems,
      } satisfies PublicSituationData,
    }
  } catch (error) {
    console.error('Erro getPublicSituationData:', error)
    return {
      success: false,
      data: null,
    }
  }
}
