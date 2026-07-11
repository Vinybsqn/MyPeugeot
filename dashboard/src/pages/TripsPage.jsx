import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import { useTrips } from '../hooks/useTrips'
import { Navigation, Clock, Zap, ChevronRight } from 'lucide-react'
import { fetchRoute } from '../utils/routing'

export default function TripsPage() {
  const { trips, loading } = useTrips()
  const [selected, setSelected] = useState(null)
  const [routes, setRoutes] = useState({})

  const trip = selected ?? trips[0]

  // Fetch routed polylines for all trips
  useEffect(() => {
    if (!trips.length) return
    trips.forEach(t => {
      if (!t.positions || routes[t.id] !== undefined) return
      fetchRoute(t.positions).then(route => {
        setRoutes(prev => ({ ...prev, [t.id]: route }))
      })
    })
  }, [trips])

  if (loading) return <EmptyState loading />
  if (trips.length === 0) return <EmptyState />

  const activeRoute = routes[trip?.id]
  const fallbackPositions = trip?.positions
    ? trip.positions.lat.map((lat, i) => [lat, trip.positions.long[i]])
    : []
  const displayPositions = activeRoute ?? fallbackPositions
  const center = displayPositions.length
    ? displayPositions[Math.floor(displayPositions.length / 2)]
    : [46.6, 1.88]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold px-1" style={{ color: 'var(--t1)' }}>Trajets</h2>

      <div className="card overflow-hidden">
        <div style={{ height: 200 }}>
          <MapContainer
            key={trip?.id}
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {trips.map(t => {
              const route = routes[t.id]
              const pts = route ?? (t.positions ? t.positions.lat.map((lat, i) => [lat, t.positions.long[i]]) : [])
              const isActive = t.id === trip?.id
              return pts.length > 1 && (
                <Polyline
                  key={t.id}
                  positions={pts}
                  pathOptions={isActive
                    ? { color: '#ef4444', weight: 3.5, opacity: 0.95 }
                    : { color: '#6366f1', weight: 2, opacity: 0.3 }
                  }
                />
              )
            })}
          </MapContainer>
        </div>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--sep)' }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{formatDate(trip?.start_at)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{trip?.distance?.toFixed(1)} km · {formatDuration(trip?.duration)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>{trip?.consumption_km?.toFixed(1)} kWh/100</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>moy. {trip?.speed_average?.toFixed(0)} km/h</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {trips.map((t) => {
          const isSelected = (selected?.id ?? trips[0].id) === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="w-full text-left card px-4 py-3.5 flex items-center gap-3 transition-all"
              style={isSelected ? { background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' } : {}}
            >
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card-inner)' }}>
                <Navigation size={16} style={{ color: 'var(--t2)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--t1)' }}>{formatDate(t.start_at)}</div>
                <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: 'var(--t3)' }}>
                  <span>{t.distance?.toFixed(1)} km</span>
                  <span>·</span>
                  <Clock size={10} />
                  <span>{formatDuration(t.duration)}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs flex items-center gap-1" style={{ color: 'var(--t2)' }}>
                  <Zap size={10} />
                  {t.consumption_km?.toFixed(1)}
                </div>
                <ChevronRight size={14} className="ml-auto mt-1" style={{ color: 'var(--t3)' }} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ loading }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="text-5xl">🗺️</div>
      <div className="text-sm text-center leading-relaxed" style={{ color: 'var(--t3)' }}>
        {loading ? 'Chargement...' : 'Aucun trajet enregistré.\nFais un tour et reviens !'}
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDuration(seconds) {
  if (!seconds) return '--'
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m}min`
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}
