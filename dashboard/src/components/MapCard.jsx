import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useMemo, useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

const carIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;background:#ef4444;border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 2px 10px rgba(220,38,38,0.5),0 0 0 4px rgba(220,38,38,0.12);"></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

export default function MapCard({ position }) {
  const coords = position?.geometry?.coordinates
  const updatedAt = position?.properties?.updated_at
  const heading = position?.properties?.heading
  const center = useMemo(() => coords ? [coords[1], coords[0]] : [46.603354, 1.888334], [coords])
  const [address, setAddress] = useState(null)

  useEffect(() => {
    if (!coords) return
    const [lon, lat] = coords
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`)
      .then(r => r.json())
      .then(d => {
        const a = d.address
        const street = a.road || a.pedestrian || a.footway || ''
        const city = a.city || a.town || a.village || a.municipality || ''
        setAddress([street, city].filter(Boolean).join(', '))
      })
      .catch(() => {})
  }, [coords?.[0], coords?.[1]])

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 sep">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p className="text-xs font-medium truncate" style={{ color: 'var(--t2)' }}>
            {address || 'Localisation'}
          </p>
        </div>
        <p className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--t3)' }}>
          {heading != null && `${getHeadingLabel(heading)} · `}
          {updatedAt && new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div style={{ height: 200 }}>
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {coords && <Marker position={center} icon={carIcon} />}
        </MapContainer>
      </div>
    </div>
  )
}

function getHeadingLabel(deg) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(deg / 45) % 8]
}
