import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'
import { MapPin } from 'lucide-react'

const carIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#ef4444,#991b1b);border:2px solid rgba(255,255,255,0.9);border-radius:50%;box-shadow:0 2px 12px rgba(220,38,38,0.6),0 0 0 5px rgba(220,38,38,0.15);display:flex;align-items:center;justify-content:center;font-size:12px;">🚗</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export default function MapCard({ position }) {
  const coords = position?.geometry?.coordinates
  const updatedAt = position?.properties?.updated_at
  const heading = position?.properties?.heading
  const center = useMemo(() => coords ? [coords[1], coords[0]] : [46.603354, 1.888334], [coords])

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <MapPin size={13} style={{ color: '#ef4444' }} />
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Localisation
          </p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {heading != null && `${getHeadingLabel(heading)} · `}
          {updatedAt && new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Map — style clair type Apple Plans */}
      <div style={{ height: 200 }}>
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {coords && <Marker position={center} icon={carIcon} />}
        </MapContainer>
      </div>
    </div>
  )
}

function getHeadingLabel(deg) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(deg / 45) % 8]
}
