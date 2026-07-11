import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import { useTrips } from '../hooks/useTrips'
import { Navigation, Clock, Zap, Thermometer, Mountain, Gauge, X } from 'lucide-react'
import { fetchRoute } from '../utils/routing'

function groupTrips(trips) {
  const groups = {}
  trips.forEach(t => {
    const d = new Date(t.start_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = { key, label, trips: [] }
    groups[key].trips.push(t)
  })
  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key))
}

export default function TripsPage() {
  const { trips, loading } = useTrips()
  const [selected, setSelected] = useState(null)
  const [routes, setRoutes] = useState({})
  const [openGroup, setOpenGroup] = useState(null)

  useEffect(() => {
    if (!trips.length) return
    trips.forEach(t => {
      if (!t.positions || routes[t.id] !== undefined) return
      fetchRoute(t.positions).then(route => {
        setRoutes(prev => ({ ...prev, [t.id]: route }))
      })
    })
  }, [trips])

  // Auto-open first group
  useEffect(() => {
    const groups = groupTrips(trips)
    if (groups.length && openGroup === null) setOpenGroup(groups[0].key)
  }, [trips])

  if (loading) return <EmptyState loading />
  if (trips.length === 0) return <EmptyState />

  const groups = groupTrips(trips)

  const activeRoute = selected ? (routes[selected.id] ?? null) : null
  const displayPositions = activeRoute
    ?? (selected?.positions ? selected.positions.lat.map((lat, i) => [lat, selected.positions.long[i]]) : [])
  const center = displayPositions.length
    ? displayPositions[Math.floor(displayPositions.length / 2)]
    : [46.6, 1.88]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold px-1" style={{ color: 'var(--t1)' }}>Trajets</h2>

      {/* Detail modal */}
      {selected && (
        <div className="card overflow-hidden">
          {/* Map — trajet seul */}
          <div style={{ height: 220, position: 'relative' }}>
            <MapContainer
              key={selected.id}
              center={center}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {displayPositions.length > 1 && (
                <Polyline positions={displayPositions} pathOptions={{ color: '#ef4444', weight: 3.5, opacity: 0.95 }} />
              )}
            </MapContainer>
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 z-[999] w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <X size={14} color="white" />
            </button>
          </div>

          {/* Header */}
          <div className="px-4 py-3 sep">
            <div className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{formatDate(selected.start_at)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
              {selected.distance?.toFixed(1)} km · {formatDuration(selected.duration)}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid var(--sep)' }}>
            <StatCell icon={<Zap size={13} />} label="Conso." value={`${selected.consumption_km?.toFixed(1)} kWh/100`} />
            <StatCell icon={<Gauge size={13} />} label="Vitesse moy." value={`${selected.speed_average?.toFixed(0)} km/h`} />
            <StatCell icon={<Zap size={13} />} label="Énergie" value={`${selected.consumption?.toFixed(2)} kWh`} />
          </div>
          <div className="grid grid-cols-3 divide-x">
            <StatCell icon={<Mountain size={13} />} label="Dénivelé" value={`${selected.altitude_diff > 0 ? '+' : ''}${selected.altitude_diff} m`} />
            <StatCell icon={<Thermometer size={13} />} label="Conso/temp" value={`${selected.consumption_by_temp?.toFixed(1)} kWh/100`} />
            <StatCell icon={<Navigation size={13} />} label="Km compteur" value={`${selected.mileage?.toFixed(0)} km`} />
          </div>
        </div>
      )}

      {/* Groups */}
      <div className="flex flex-col gap-3">
        {groups.map(group => (
          <div key={group.key} className="card overflow-hidden">
            {/* Group header */}
            <button
              className="w-full px-5 py-3.5 flex items-center justify-between sep"
              onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)}
            >
              <span className="text-sm font-semibold capitalize" style={{ color: 'var(--t1)' }}>{group.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--t3)' }}>
                  {group.trips.length} trajet{group.trips.length > 1 ? 's' : ''} · {group.trips.reduce((s, t) => s + (t.distance ?? 0), 0).toFixed(0)} km
                </span>
                <span style={{ color: 'var(--t3)', fontSize: 10 }}>{openGroup === group.key ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Trips list */}
            {openGroup === group.key && group.trips.map((t, i) => {
              const isSelected = selected?.id === t.id
              const isLast = i === group.trips.length - 1
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(isSelected ? null : t)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all"
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--sep)',
                    background: isSelected ? 'rgba(239,68,68,0.07)' : 'transparent',
                  }}
                >
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--card-inner)' }}>
                    <Navigation size={16} style={{ color: isSelected ? '#ef4444' : 'var(--t2)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--t1)' }}>{formatTime(t.start_at)}</div>
                    <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: 'var(--t3)' }}>
                      <span>{t.distance?.toFixed(1)} km</span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{formatDuration(t.duration)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium" style={{ color: 'var(--t2)' }}>{t.consumption_km?.toFixed(1)} kWh/100</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{t.speed_average?.toFixed(0)} km/h moy.</div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCell({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center py-3 gap-1">
      <div className="flex items-center gap-1" style={{ color: 'var(--t3)' }}>
        {icon}
        <span style={{ fontSize: 10 }}>{label}</span>
      </div>
      <span className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{value ?? '--'}</span>
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
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatTime(iso) {
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
