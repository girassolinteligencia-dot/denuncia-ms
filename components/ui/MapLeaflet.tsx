'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'

import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })

export interface MapLeafletProps {
  center?: [number, number]
  zoom?: number
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function MapLeaflet({ center = [-20.4697, -54.6201], zoom = 7, children, className, style }: MapLeafletProps) {
  useEffect(() => {
    // Fix default icon URLs for Next.js environment
    import('leaflet').then(L => {
      // @ts-expect-error internal
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    })
  }, [])

  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  )
}
