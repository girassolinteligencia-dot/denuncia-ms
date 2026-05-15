'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { 
  MapPin, 
  Flame, 
  Layers,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'

// Carregamento dinâmico do Leaflet para evitar erros de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export interface GeoData {
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

export const PublicGeoIntelligenceMap = ({ data }: { data: GeoData[] }) => {
  const [viewMode, setViewMode] = useState<'points' | 'heat'>('points')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    import('leaflet').then(L => {
      // @ts-expect-error
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
    <div className="w-full h-full min-h-[300px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Layers className="text-white/30 animate-spin" size={32} />
        <p className="text-xs font-black uppercase tracking-widest text-white/30">Carregando Mapa de Inteligência...</p>
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-full flex flex-col z-0">
      {/* Controles sobrepostos no topo do mapa */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 pointer-events-auto">
          {/* Toggle de Visualização */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('points')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'points' ? 'bg-primary text-white shadow-sm' : 'text-white/40 hover:text-white'
              }`}
            >
              <MapPin size={12} />
              Pontos
            </button>
            <button 
              onClick={() => setViewMode('heat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'heat' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/40 hover:text-white'
              }`}
            >
              <Flame size={12} />
              Calor
            </button>
          </div>

          <select 
            title="Filtrar por Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 bg-black/40 text-white border border-white/10 rounded-xl px-3 text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/50 outline-none"
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
      <div className="relative w-full h-full flex-1 z-0">
        <MapContainer 
          center={[-20.4697, -54.6201]} // Centro do MS (Campo Grande)
          zoom={6}
          minZoom={4}
          maxBounds={[[5.27, -73.99], [-33.75, -34.79]]} // Brasil bounds
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {viewMode === 'points' && filteredData.map((point) => (
            <Marker key={point.id} position={[point.lat, point.lng]}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {point.protocolo}
                      </span>
                      <span className="text-[8px] font-bold text-gray-500">
                        {format(new Date(point.criado_em), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                   </div>
                   <h3 className="text-xs font-black text-gray-800 mb-1 leading-tight">{point.titulo}</h3>
                   <p className="text-[9px] text-gray-500 mb-2 italic flex items-center gap-1">
                      <MapPin size={10} /> {point.municipio || 'Localização Identificada'}
                   </p>
                   <div className="flex items-center gap-1 border-t border-gray-200 pt-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
                         point.status === 'resolvida' ? 'bg-green-500' : 
                         point.status === 'encaminhada' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-800">{point.status.replace('_', ' ')}</span>
                   </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {viewMode === 'heat' && <HeatmapLayer points={heatPoints} />}
        </MapContainer>
        
        {/* Legend Overlay - Positioned bottom right */}
        <div className="absolute bottom-4 right-4 z-[400] bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 pointer-events-none">
           <h4 className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-2">Legenda Operacional</h4>
           <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                 <span className="text-[8px] font-bold text-white/50">Recebidas / Análise</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                 <span className="text-[8px] font-bold text-white/50">Encaminhadas</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                 <span className="text-[8px] font-bold text-white/50">Resolvidas</span>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .leaflet-container {
          background: #050505;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
