import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'

const carIcon = L.divIcon({
  html: `<div style="
    width:32px;height:32px;
    background:#3b82f6;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
    font-size:14px;
  ">🚗</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export default function MapCard({ position }) {
  const coords = position?.geometry?.coordinates
  const updatedAt = position?.properties?.updated_at

  const center = useMemo(() => {
    if (!coords) return [46.603354, 1.888334]
    return [coords[1], coords[0]]
  }, [coords])

  return (
    <div className="bg-slate-800/60 rounded-3xl overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Position</span>
        {updatedAt && (
          <span className="text-xs text-slate-500">
            {new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <div className="h-52 rounded-b-3xl overflow-hidden">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
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
