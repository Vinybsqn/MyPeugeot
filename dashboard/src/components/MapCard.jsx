import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'

const carIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#ef4444,#991b1b);border:2.5px solid rgba(255,255,255,0.85);border-radius:50%;box-shadow:0 4px 16px rgba(220,38,38,0.5),0 0 0 6px rgba(220,38,38,0.15);display:flex;align-items:center;justify-content:center;font-size:14px;">🚗</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export default function MapCard({ position }) {
  const coords = position?.geometry?.coordinates
  const updatedAt = position?.properties?.updated_at
  const heading = position?.properties?.heading

  const center = useMemo(() => coords ? [coords[1], coords[0]] : [46.603354, 1.888334], [coords])

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Dernière position
        </p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {heading != null && `${getHeadingLabel(heading)} · `}
          {updatedAt && new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div style={{ height: 190 }}>
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {coords && <Marker position={center} icon={carIcon} />}
        </MapContainer>
      </div>
    </div>
  )
}

function getHeadingLabel(deg) {
  return ['N','NE','E','SE','S','SO','O','NO'][Math.round(deg / 45) % 8]
}
