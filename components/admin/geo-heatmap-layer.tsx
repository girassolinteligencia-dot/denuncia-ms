'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

export function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !points.length) return

    // leaflet.heat augments the Leaflet namespace at runtime.
    // @ts-expect-error leaflet.heat augments the Leaflet namespace at runtime.
    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' },
    }).addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, points])

  return null
}
