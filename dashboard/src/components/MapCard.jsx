import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMemo, useEffect, useState, useRef } from 'react'
import { MapPin, Navigation, Zap, Volume2, Loader } from 'lucide-react'
import { BASE, VIN } from '../api'

const carIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;background:#ef4444;border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 2px 10px rgba(220,38,38,0.5),0 0 0 4px rgba(220,38,38,0.12);"></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

const meIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.25);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function FitBounds({ carPos, mePos }) {
  const map = useMap()
  useEffect(() => {
    if (!carPos) return
    const bounds = mePos
      ? L.latLngBounds([carPos, mePos]).pad(0.3)
      : L.latLngBounds([carPos]).pad(0.5)
    map.fitBounds(bounds)
  }, [carPos?.[0], carPos?.[1], mePos?.[0], mePos?.[1]])
  return null
}

function getDistance(a, b) {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLon = (b[1] - a[1]) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

function formatAge(ts) {
  if (!ts) return ''
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 60) return `il y a ${mins} min`
  return `il y a ${Math.round(mins / 60)}h`
}

export default function MapCard({ position }) {
  const coords = position?.geometry?.coordinates
  const updatedAt = position?.properties?.updated_at
  const heading = position?.properties?.heading
  const carPos = useMemo(() => coords ? [coords[1], coords[0]] : null, [coords?.[0], coords?.[1]])

  const [address, setAddress] = useState(null)
  const [mePos, setMePos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [loadingHorn, setLoadingHorn] = useState(false)
  const [loadingLights, setLoadingLights] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const watchRef = useRef(null)

  // Persist car position for offline use
  useEffect(() => {
    if (carPos) {
      localStorage.setItem('lastCarPos', JSON.stringify({ pos: carPos, time: Date.now() }))
    }
  }, [carPos?.[0], carPos?.[1]])

  // Load last known position when offline
  const savedCar = useMemo(() => {
    if (carPos) return { pos: carPos, time: null }
    try {
      const s = localStorage.getItem('lastCarPos')
      return s ? JSON.parse(s) : null
    } catch { return null }
  }, [carPos])

  const displayCarPos = savedCar?.pos ?? null
  const isOffline = !carPos && savedCar

  // Reverse geocoding
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

  function startLocating() {
    setLocating(true)
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      p => setMePos([p.coords.latitude, p.coords.longitude]),
      () => {},
      { enableHighAccuracy: true }
    )
  }

  function stopLocating() {
    setLocating(false)
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    setMePos(null)
  }

  useEffect(() => () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
  }, [])

  function showFeedback(msg) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2500)
  }

  async function horn() {
    setLoadingHorn(true)
    try {
      const res = await fetch(`${BASE}/horn/${VIN}/2`)
      if (!res.ok) throw new Error(res.status)
      showFeedback('Klaxon envoyé')
    } catch { showFeedback('Klaxon : erreur') }
    setLoadingHorn(false)
  }

  async function lights() {
    setLoadingLights(true)
    try {
      const res = await fetch(`${BASE}/lights/${VIN}/5`)
      if (!res.ok) throw new Error(res.status)
      showFeedback('Feux envoyés')
    } catch { showFeedback('Feux : erreur') }
    setLoadingLights(false)
  }

  if (!displayCarPos) return null

  const distance = mePos ? getDistance(displayCarPos, mePos) : null
  const center = displayCarPos

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 sep">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--t2)' }}>
              {address || 'Localisation'}
            </p>
            {isOffline && (
              <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>
                Dernière position · {formatAge(savedCar.time)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
          {distance != null && (
            <span className="text-sm font-bold" style={{ color: '#ef4444' }}>
              {distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`}
            </span>
          )}
          <p className="text-xs" style={{ color: 'var(--t3)' }}>
            {heading != null && `${getHeadingLabel(heading)} · `}
            {updatedAt && new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className="px-5 py-1.5 text-xs font-medium text-center"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          {feedback}
        </div>
      )}

      {/* Map */}
      <div style={{ height: 220, position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Marker position={displayCarPos} icon={carIcon} />
          {mePos && (
            <>
              <Marker position={mePos} icon={meIcon} />
              <Circle center={mePos} radius={15} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />
            </>
          )}
          <FitBounds carPos={displayCarPos} mePos={mePos} />
        </MapContainer>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3">
        <button
          onClick={locating ? stopLocating : startLocating}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium transition-all"
          style={{
            background: locating ? 'rgba(59,130,246,0.15)' : 'var(--card-inner)',
            color: locating ? '#3b82f6' : 'var(--t1)',
            border: `1px solid ${locating ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
          }}
        >
          <Navigation size={15} />
          {locating ? 'Arrêter' : 'Me localiser'}
        </button>

        <button
          onClick={lights}
          disabled={loadingLights}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium"
          style={{ background: 'var(--card-inner)', color: 'var(--t1)' }}
        >
          {loadingLights ? <Loader size={15} className="animate-spin" /> : <Zap size={15} />}
          Feux
        </button>

        <button
          onClick={horn}
          disabled={loadingHorn}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium"
          style={{ background: 'var(--card-inner)', color: 'var(--t1)' }}
        >
          {loadingHorn ? <Loader size={15} className="animate-spin" /> : <Volume2 size={15} />}
          Klaxon
        </button>
      </div>
    </div>
  )
}

function getHeadingLabel(deg) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(deg / 45) % 8]
}
