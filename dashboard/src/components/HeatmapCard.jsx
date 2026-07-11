import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useTrips } from '../hooks/useTrips'
import 'leaflet.heat'
import L from 'leaflet'

function HeatLayer({ points }) {
  const map = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (!points.length) return
    if (layerRef.current) map.removeLayer(layerRef.current)
    layerRef.current = L.heatLayer(points, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.2: '#3b82f6', 0.5: '#f59e0b', 0.8: '#ef4444', 1.0: '#ff2d55' },
    }).addTo(map)
    return () => { if (layerRef.current) map.removeLayer(layerRef.current) }
  }, [points])

  return null
}

export default function HeatmapCard() {
  const { trips } = useTrips()

  const points = trips.flatMap(t =>
    t.positions ? t.positions.lat.map((lat, i) => [lat, t.positions.long[i], 1]) : []
  )

  if (points.length < 2) return null

  const center = points[Math.floor(points.length / 2)]

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 sep">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>
          Zones fréquentées
        </p>
      </div>
      <div style={{ height: 220 }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <HeatLayer points={points} />
        </MapContainer>
      </div>
    </div>
  )
}
