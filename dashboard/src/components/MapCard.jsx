import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'
import { Navigation } from 'lucide-react'

const carIcon = L.divIcon({
  html: `<div style="
    width:36px;height:36px;
    background:linear-gradient(135deg,#ef4444,#b91c1c);
    border:2.5px solid rgba(255,255,255,0.8);
    border-radius:50%;
    box-shadow:0 4px 16px rgba(220,38,38,0.5),0 0 0 4px rgba(220,38,38,0.2);
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
  ">🚗</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

export default function MapCard({ position }) {
  const coords = position?.geometry?.coordinates
  const props = position?.properties
  const updatedAt = props?.updated_at
  const heading = props?.heading

  const center = useMemo(() => {
    if (!coords) return [46.603354, 1.888334]
    return [coords[1], coords[0]]
  }, [coords])

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-xs text-white/40 font-semibold tracking-widest uppercase">Position</p>
        <div className="flex items-center gap-3 text-white/30 text-xs">
          {heading != null && (
            <div className="flex items-center gap-1">
              <Navigation size={10} />
              {getHeadingLabel(heading)}
            </div>
          )}
          {updatedAt && new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div className="h-48 overflow-hidden">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {coords && (
            <Marker position={center} icon={carIcon}>
              <Popup>Ta e-208</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}

function getHeadingLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(deg / 45) % 8]
}
