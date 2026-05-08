import { useState } from 'react'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import { useTrips } from '../hooks/useTrips'
import { Navigation, Clock, Zap, ChevronRight } from 'lucide-react'

export default function TripsPage() {
  const { trips, loading } = useTrips()
  const [selected, setSelected] = useState(null)

  if (loading) return <EmptyState loading />

  if (trips.length === 0) return <EmptyState />

  const trip = selected ?? trips[0]
  const positions = trip.positions
    ? trip.positions.lat.map((lat, i) => [lat, trip.positions.long[i]])
    : []
  const center = positions.length ? positions[Math.floor(positions.length / 2)] : [46.6, 1.88]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white px-1">Trajets</h2>

      {/* Map */}
      <div className="bg-slate-800/60 rounded-3xl overflow-hidden">
        <div className="h-56">
          <MapContainer
            key={trip.id}
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {positions.length > 1 && (
              <Polyline
                positions={positions}
                pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9 }}
              />
            )}
          </MapContainer>
        </div>
        {/* Selected trip summary */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              {formatDate(trip.start_at)}
            </div>
            <div className="text-xs text-slate-400">
              {trip.distance?.toFixed(1)} km • {formatDuration(trip.duration)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-400">
              {trip.consumption_km?.toFixed(1)} kWh/100km
            </div>
            <div className="text-xs text-slate-400">
              moy. {trip.speed_average?.toFixed(0)} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Trip list */}
      <div className="flex flex-col gap-2">
        {trips.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className={`w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors ${
              (selected?.id ?? trips[0].id) === t.id
                ? 'bg-blue-600/20 border border-blue-500/40'
                : 'bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Navigation size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{formatDate(t.start_at)}</div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{t.distance?.toFixed(1)} km</span>
                <span>•</span>
                <Clock size={10} />
                <span>{formatDuration(t.duration)}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-green-400 flex items-center gap-1">
                <Zap size={10} />
                {t.consumption_km?.toFixed(1)} kWh/100
              </div>
              <ChevronRight size={14} className="text-slate-600 ml-auto mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ loading }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-4xl">🗺️</div>
      <div className="text-slate-400 text-sm text-center">
        {loading ? 'Chargement...' : 'Aucun trajet enregistré pour l\'instant.\nFais un tour et reviens !'}
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
