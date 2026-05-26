import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase-admin'
import { requireAdminAction } from '../../../../lib/admin-auth'

export const dynamic = 'force-dynamic'

type DenunciaGeoRow = {
  id?: string
  protocolo?: string | null
  status: string | null
  latitude: number | string | null
  longitude: number | string | null
  municipio: string | null
  cidade?: string | null
  local?: string | null
  anonima: boolean | null
  criado_em: string | null
  categorias?: { label?: string | null } | null
}

function normalizeDateParam(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function mostFrequent(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
}

function inferMunicipality(row: DenunciaGeoRow) {
  const municipio = String(row.municipio || '').trim()
  const cidade = String(row.cidade || '').trim()
  const direct = municipio && municipio.toLocaleUpperCase('pt-BR') !== 'MATO GROSSO DO SUL'
    ? municipio
    : cidade

  if (direct) return direct

  const parts = String(row.local || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  const stateIndex = parts.findIndex(part => part.toLocaleUpperCase('pt-BR') === 'MS')
  if (stateIndex > 0) return parts[stateIndex - 1]

  const candidate = [...parts].reverse().find(part => {
    const normalized = part.toLocaleUpperCase('pt-BR')
    return /[A-ZÁ-Ú]/.test(normalized) && normalized !== 'MS' && !/^\d/.test(normalized)
  })

  return candidate || 'Mato Grosso do Sul'
}

function buildPublicMunicipalityPercentages(rows: DenunciaGeoRow[]) {
  const municipalities = new Map<string, {
    count: number
    latSum: number
    lngSum: number
    municipio: string
    categorias: string[]
    recentes: string[]
  }>()

  rows.forEach((row) => {
    const lat = Number(row.latitude)
    const lng = Number(row.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    const municipio = inferMunicipality(row)
    const key = municipio.toLocaleUpperCase('pt-BR')
    const current = municipalities.get(key) || {
      count: 0,
      latSum: 0,
      lngSum: 0,
      municipio,
      categorias: [],
      recentes: [],
    }

    current.count += 1
    current.latSum += lat
    current.lngSum += lng
    if (row.categorias?.label) current.categorias.push(row.categorias.label)
    if (row.criado_em) current.recentes.push(row.criado_em)
    municipalities.set(key, current)
  })

  const total = Array.from(municipalities.values()).reduce((sum, municipality) => sum + municipality.count, 0)

  return Array.from(municipalities.entries()).map(([key, municipality]) => {
    const lat = municipality.latSum / municipality.count
    const lng = municipality.lngSum / municipality.count

    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: key,
        municipio: municipality.municipio,
        percentual: total > 0 ? Number(((municipality.count / total) * 100).toFixed(1)) : 0,
        categoria_principal: mostFrequent(municipality.categorias),
        ultima_atualizacao: municipality.recentes.sort().at(-1) || null,
        aggregated: true,
      },
    }
  })
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const role = url.searchParams.get('role') || 'public'
    const isAdminRequest = role === 'admin'

    if (isAdminRequest) {
      try {
        await requireAdminAction({ permission: 'denuncias' })
      } catch {
        return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
      }
    }

    const supabase = createAdminClient()
    const selectColumns = isAdminRequest
      ? 'id, protocolo, status, latitude, longitude, municipio, cidade, anonima, criado_em, categorias(label)'
      : 'latitude, longitude, municipio, cidade, local, anonima, criado_em, categorias(label)'

    let query = supabase
      .from('denuncias')
      .select(selectColumns)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('criado_em', { ascending: false })
      .limit(isAdminRequest ? 2000 : 5000)

    const from = normalizeDateParam(url.searchParams.get('from'))
    const to = normalizeDateParam(url.searchParams.get('to'))
    const categoria = url.searchParams.get('categoria')
    const status = url.searchParams.get('status')
    const bbox = url.searchParams.get('bbox')?.split(',').map(Number)

    if (from) query = query.gte('criado_em', from)
    if (to) query = query.lte('criado_em', to)
    if (categoria) query = query.eq('categoria_id', categoria)
    if (status) query = query.eq('status', status)

    if (bbox?.length === 4 && bbox.every(Number.isFinite)) {
      const [west, south, east, north] = bbox
      query = query
        .gte('longitude', west)
        .lte('longitude', east)
        .gte('latitude', south)
        .lte('latitude', north)
    }

    const { data, error } = await query

    if (error) {
      console.error('GeoJSON fetch error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const rows = (data || []) as DenunciaGeoRow[]
    const features = isAdminRequest
      ? rows.map((r) => {
        let lat = Number(r.latitude)
        let lng = Number(r.longitude)

        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {
            id: r.id,
            protocolo: r.protocolo,
            status: r.status,
            municipio: r.municipio || r.cidade || null,
            categoria: r.categorias?.label || null,
            anonima: r.anonima,
            criado_em: r.criado_em,
            aggregated: false,
          }
        }
      })
      : buildPublicMunicipalityPercentages(rows)

    const geojson = { type: 'FeatureCollection', features }
    return NextResponse.json(geojson, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
}
