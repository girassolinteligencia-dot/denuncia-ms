'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { 
  MapPin, 
  Flame, 
  Maximize2, 
  Layers
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

// Carregamento dinâmico do Leaflet para evitar erros de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface GeoData {
  id: string
  protocolo: string
  titulo: string
  status: string
  lat: number
  lng: number
  municipio: string
  criado_em: string
}

// Subcomponente para renderizar a camada de calor
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !points.length) return
    
    // @ts-expect-error - leaflet.heat adiciona heatLayer ao objeto L
    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, points])

  return null
}

export const AdminGeoIntelligence = ({ data }: { data: GeoData[] }) => {
  const [viewMode, setViewMode] = useState<'points' | 'heat'>('points')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    // Correção para ícones do Leaflet no Next.js
    import('leaflet').then(L => {
      // @ts-expect-error - Icon.Default.prototype._getIconUrl é uma propriedade interna
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    })
  }, [])

  const filteredData = useMemo(() => {
    if (selectedStatus === 'all') return data
    return data.filter(d => d.status === selectedStatus)
  }, [data, selectedStatus])

  const heatPoints = useMemo(() => {
    return filteredData.map(d => [d.lat, d.lng, 0.5] as [number, number, number])
  }, [filteredData])

  if (!isMounted) return (
    <div className="w-full h-[600px] bg-surface animate-pulse rounded-3xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Layers className="text-muted animate-spin" size={32} />
        <p className="text-xs font-black uppercase tracking-widest text-muted">Carregando Mapa de Inteligência...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header & Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Maximize2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark tracking-tighter uppercase italic">Inteligência Geográfica</h2>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">{filteredData.length} Pontos identificados no MS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle de Visualização */}
          <div className="flex p-1 bg-surface rounded-xl border border-border">
            <button 
              onClick={() => setViewMode('points')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'points' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-dark'
              }`}
            >
              <MapPin size={14} />
              Pontos
            </button>
            <button 
              onClick={() => setViewMode('heat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'heat' ? 'bg-white text-orange-500 shadow-sm' : 'text-muted hover:text-dark'
              }`}
            >
              <Flame size={14} />
              Calor
            </button>
          </div>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 bg-white border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="recebida">Recebidas</option>
            <option value="em_analise">Em Análise</option>
            <option value="encaminhada">Encaminhadas</option>
            <option value="resolvida">Resolvidas</option>
          </select>
        </div>
      </div>

      {/* Container do Mapa */}
      <div className="relative w-full h-[400px] sm:h-[600px] rounded-3xl overflow-hidden border border-border shadow-2xl bg-slate-100">
        <MapContainer 
          center={[-20.4697, -54.6201]} // Centro do MS (Campo Grande)
          zoom={7} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {viewMode === 'points' && filteredData.map((point) => (
            <Marker key={point.id} position={[point.lat, point.lng]}>
              <Popup>
                <div className="p-2 min-w-[200px]">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {point.protocolo}
                      </span>
                      <span className="text-[8px] font-bold text-muted">
                        {format(new Date(point.criado_em), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                   </div>
                   <h3 className="text-sm font-black text-dark mb-1 leading-tight">{point.titulo}</h3>
                   <p className="text-[10px] text-muted mb-3 italic flex items-center gap-1">
                      <MapPin size={10} /> {point.municipio || 'Localização Identificada'}
                   </p>
                   <div className="flex items-center justify-between gap-2 border-t border-border pt-2 mt-2">
                      <div className="flex items-center gap-1">
                         <div className={`w-2 h-2 rounded-full ${
                            point.status === 'resolvida' ? 'bg-green-500' : 
                            point.status === 'encaminhada' ? 'bg-blue-500' : 'bg-orange-500'
                         }`}></div>
                         <span className="text-[9px] font-black uppercase tracking-tighter text-dark">{point.status}</span>
                      </div>
                      <a href={`/admin/denuncias/${point.id}`} className="text-[9px] font-black text-primary uppercase hover:underline">Ver Detalhes</a>
                   </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {viewMode === 'heat' && <HeatmapLayer points={heatPoints} />}
        </MapContainer>
        
        {/* Legend Overlay - Responsive position */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 z-[400] bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-border shadow-lg">
           <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark mb-2 sm:mb-3">Legenda Operacional</h4>
           <div className="flex flex-row sm:flex-col flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                 <span className="text-[8px] sm:text-[9px] font-bold text-muted">Recebidas</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                 <span className="text-[8px] sm:text-[9px] font-bold text-muted">Encaminhadas</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                 <span className="text-[8px] sm:text-[9px] font-bold text-muted">Resolvidas</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
