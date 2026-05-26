'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, MapPin, RefreshCw } from 'lucide-react'

import MapLeaflet from '@/components/ui/MapLeaflet'

const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

type GeoFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    id: string
    municipio: string
    percentual: number
    categoria_principal?: string | null
    ultima_atualizacao?: string | null
  }
}

type GeoJsonResponse = {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

const PERIODS = [
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: 'Tudo', days: null },
]

function formatDate(value?: string | null) {
  if (!value) return 'Sem data'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getMarkerStyle(percentual: number, maxPercentage: number) {
  const intensity = maxPercentage > 0 ? percentual / maxPercentage : 0
  return {
    radius: 10 + Math.min(26, percentual * 0.8),
    pathOptions: {
      color: intensity > 0.65 ? '#f5c800' : '#1535c9',
      fillColor: intensity > 0.65 ? '#f5c800' : '#1535c9',
      fillOpacity: 0.28 + Math.min(0.35, intensity * 0.35),
      opacity: 0.85,
      weight: 2,
    },
  }
}

export function TransparenciaLeafletMap() {
  const [periodDays, setPeriodDays] = useState<number | null>(30)
  const [data, setData] = useState<GeoJsonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fromDate = useMemo(() => {
    if (!periodDays) return null
    const date = new Date()
    date.setDate(date.getDate() - periodDays)
    return date.toISOString()
  }, [periodDays])

  const maxPercentage = useMemo(() => {
    return Math.max(...(data?.features || []).map(feature => feature.properties.percentual), 1)
  }, [data])

  const fetchMapData = async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ agg: 'municipio' })
    if (fromDate) params.set('from', fromDate)

    try {
      const response = await fetch(`/api/denuncias/geojson?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) throw new Error('Erro ao carregar dados do mapa')
      setData(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMapData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate])

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-surface/90 shadow-inner">
      <div className="flex flex-col gap-4 border-b border-border bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin size={18} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-muted">Mapa Leaflet</p>
            <p className="text-sm font-black text-dark">Percentuais por municipio</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-surface p-1">
            {PERIODS.map(period => (
              <button
                key={period.label}
                type="button"
                onClick={() => setPeriodDays(period.days)}
                className={`h-9 px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  periodDays === period.days
                    ? 'rounded-lg bg-dark text-white'
                    : 'text-muted hover:text-dark'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={fetchMapData}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted transition-colors hover:text-primary"
            title="Atualizar mapa"
            aria-label="Atualizar mapa"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="relative h-[420px] sm:h-[560px]">
        <MapLeaflet center={[-20.4697, -54.6201]} zoom={6} className="h-full">
          {(data?.features || []).map(feature => {
            const [lng, lat] = feature.geometry.coordinates
            const props = feature.properties
            const marker = getMarkerStyle(props.percentual, maxPercentage)

            return (
              <CircleMarker
                key={props.id}
                center={[lat, lng]}
                radius={marker.radius}
                pathOptions={marker.pathOptions}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-2">
                    <p className="text-sm font-black text-dark">{props.percentual}% do periodo</p>
                    <div className="space-y-1 text-xs text-muted">
                      <p>Municipio: {props.municipio || 'MS'}</p>
                      <p>Categoria: {props.categoria_principal || 'Geral'}</p>
                      <p>Atualizado: {formatDate(props.ultima_atualizacao)}</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapLeaflet>

        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary" size={26} />
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-x-4 bottom-4 z-[500] rounded-xl border border-error/20 bg-white p-4 text-sm font-bold text-error shadow-lg">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-border bg-white/90 p-4 text-left sm:grid-cols-2">
        <div className="rounded-xl bg-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Leitura publica</p>
          <p className="text-sm font-bold text-dark">Distribuicao percentual por municipio</p>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Geolocalizacao</p>
          <p className="text-sm font-bold text-dark">Coordenadas medias das denuncias registradas</p>
        </div>
      </div>
    </div>
  )
}
