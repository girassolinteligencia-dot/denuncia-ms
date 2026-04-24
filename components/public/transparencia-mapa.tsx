'use client'

import React, { useMemo } from 'react'

interface CityData {
  name: string
  count: number
}

const CITIES_COORDS: Record<string, { x: number, y: number }> = {
  'Campo Grande': { x: 200, y: 220 },
  'Dourados':     { x: 180, y: 350 },
  'Três Lagoas':  { x: 340, y: 200 },
  'Corumbá':      { x: 50,  y: 150 },
  'Ponta Porã':   { x: 140, y: 380 },
  'Coxim':        { x: 210, y: 80 },
  'Naviraí':      { x: 240, y: 390 },
  'Bonito':       { x: 100, y: 300 },
}

export const MSMunicipalityMap = ({ data }: { data: CityData[] }) => {
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data])
  
  const heatPoints = useMemo(() => {
    return data
      .map(d => {
        const coords = CITIES_COORDS[d.name]
        if (!coords) return null
        return {
          ...d,
          ...coords,
          intensity: d.count / maxCount
        }
      })
      .filter(Boolean) as (CityData & { x: number, y: number, intensity: number })[]
  }, [data, maxCount])

  return (
    <div className="relative w-full aspect-[4/4.5] max-w-lg mx-auto">
      <svg 
        viewBox="0 0 400 450" 
        className="w-full h-full drop-shadow-2xl"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#021691" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#021691" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatGradientActive" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB81C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB81C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Mesorregiões do MS - Contorno Realista Aproximado */}
        {/* Centro-Norte */}
        <path 
          d="M160 30 L220 10 L280 40 L300 120 L230 200 L140 180 Z" 
          fill="#021691" 
          fillOpacity="0.05" 
          stroke="#021691" 
          strokeWidth="1.5"
        />
        {/* Leste */}
        <path 
          d="M300 120 L360 160 L380 250 L320 380 L250 280 L230 200 Z" 
          fill="#021691" 
          fillOpacity="0.03" 
          stroke="#021691" 
          strokeWidth="1.5"
        />
        {/* Sudoeste */}
        <path 
          d="M140 180 L230 200 L250 280 L220 420 L130 430 L80 320 Z" 
          fill="#021691" 
          fillOpacity="0.08" 
          stroke="#021691" 
          strokeWidth="1.5"
        />
        {/* Pantanais */}
        <path 
          d="M20 200 L80 80 L160 30 L140 180 L80 320 Z" 
          fill="#00843E" 
          fillOpacity="0.05" 
          stroke="#00843E" 
          strokeWidth="1.5"
        />

        {heatPoints.map((point) => (
          <g key={point.name}>
            <circle
              cx={point.x}
              cy={point.y}
              r={15 + (point.intensity * 40)}
              fill={point.intensity > 0.7 ? "url(#heatGradientActive)" : "url(#heatGradient)"}
              className="animate-pulse"
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill={point.intensity > 0.7 ? "#FFB81C" : "#021691"}
            />
            {point.intensity > 0.3 && (
              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                className="font-black fill-dark uppercase tracking-tighter"
                style={{ fontSize: '10px' }}
              >
                {point.name}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-border shadow-lg">
         <p className="text-[8px] font-black uppercase tracking-widest text-muted mb-2 text-center">Volume de Denuncias</p>
         <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-muted">Mín</span>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary/10 to-primary rounded-full"></div>
            <span className="text-[9px] font-bold text-dark">Máx</span>
         </div>
      </div>
    </div>
  )
}
