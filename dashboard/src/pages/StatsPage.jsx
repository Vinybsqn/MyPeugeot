import { useVehicle } from '../hooks/useVehicle'
import { Battery, Zap, Thermometer, Gauge, Mountain, Wind, Eye, Clock } from 'lucide-react'

export default function StatsPage() {
  const { data, loading } = useVehicle()

  if (loading || !data) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-slate-400 text-sm animate-pulse">Chargement...</div>
    </div>
  )

  const energy = data.energy?.[0]
  const charging = energy?.charging
  const health = energy?.battery?.health

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white px-1">Statistiques</h2>

      {/* Batterie */}
      <Section title="Batterie">
        <Row icon={<Battery size={16} className="text-green-400" />} label="Niveau" value={`${energy?.level ?? '--'}%`} />
        <Row icon={<Zap size={16} className="text-yellow-400" />} label="Tension" value={data.battery?.voltage ? `${data.battery.voltage} V` : '--'} />
        <Row icon={<Battery size={16} className="text-blue-400" />} label="Autonomie" value={`${energy?.autonomy ?? '--'} km`} />
        <Row icon={<Battery size={16} className="text-purple-400" />} label="Santé (résistance)" value={health?.resistance != null ? `${health.resistance}%` : '--'} />
      </Section>

      {/* Charge */}
      {charging && (
        <Section title="Charge en cours">
          <Row icon={<Zap size={16} className="text-yellow-400" />} label="Statut" value={charging.status === 'InProgress' ? 'En charge' : charging.status ?? '--'} />
          <Row icon={<Zap size={16} className="text-blue-400" />} label="Mode" value={charging.charging_mode === 'Slow' ? 'Lente (AC)' : charging.charging_mode === 'Fast' ? 'Rapide (DC)' : '--'} />
          <Row icon={<Zap size={16} className="text-green-400" />} label="Vitesse" value={charging.charging_rate ? `+${charging.charging_rate} km/h` : '--'} />
          <Row icon={<Clock size={16} className="text-slate-400" />} label="Temps restant" value={charging.remaining_time ? formatDuration(charging.remaining_time) : '--'} />
          {charging.next_delayed_time && (
            <Row icon={<Clock size={16} className="text-orange-400" />} label="Charge programmée" value={`dans ${formatDuration(charging.next_delayed_time)}`} />
          )}
        </Section>
      )}

      {/* Environnement */}
      <Section title="Environnement">
        <Row icon={<Thermometer size={16} className="text-blue-400" />} label="Température ext." value={data.environment?.air?.temp != null ? `${data.environment.air.temp}°C` : '--'} />
        <Row icon={<Eye size={16} className="text-yellow-400" />} label="Luminosité" value={data.environment?.luminosity?.day ? 'Jour' : 'Nuit'} />
        <Row icon={<Mountain size={16} className="text-green-400" />} label="Altitude" value={data.last_position?.geometry?.coordinates?.[2] != null ? `${Math.round(data.last_position.geometry.coordinates[2])} m` : '--'} />
      </Section>

      {/* Véhicule */}
      <Section title="Véhicule">
        <Row icon={<Gauge size={16} className="text-purple-400" />} label="Kilométrage" value={data.timed_odometer?.mileage ? `${Math.round(data.timed_odometer.mileage).toLocaleString('fr-FR')} km` : '--'} />
        <Row icon={<Wind size={16} className="text-slate-400" />} label="Climatisation" value={data.preconditionning?.air_conditioning?.status ?? '--'} />
        <Row icon={<Zap size={16} className="text-blue-400" />} label="Allumage" value={data.ignition?.type ?? '--'} />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-800/60 rounded-3xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="divide-y divide-slate-700/30">
        {children}
      </div>
    </div>
  )
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}

function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return iso
  const h = match[1] ? `${match[1]}h ` : ''
  const m = match[2] ? `${match[2]}min` : ''
  return `${h}${m}`
}
