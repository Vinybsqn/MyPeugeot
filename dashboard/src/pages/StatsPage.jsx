import { useVehicle } from '../hooks/useVehicle'
import { Battery, Zap, Thermometer, Gauge, Mountain, Wind, Eye, Clock } from 'lucide-react'

export default function StatsPage() {
  const { data, loading } = useVehicle()

  if (loading || !data) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-white/30 text-sm animate-pulse">Chargement...</div>
    </div>
  )

  const energy = data.energy?.[0]
  const charging = energy?.charging
  const health = energy?.battery?.health

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white px-1">Statistiques</h2>

      <Section title="Batterie">
        <Row icon={<Battery size={15} className="text-green-400" />} label="Niveau" value={`${energy?.level ?? '--'}%`} />
        <Row icon={<Zap size={15} className="text-yellow-400" />} label="Tension" value={data.battery?.voltage ? `${data.battery.voltage} V` : '--'} />
        <Row icon={<Battery size={15} className="text-blue-400" />} label="Autonomie" value={`${energy?.autonomy ?? '--'} km`} />
        <Row icon={<Battery size={15} className="text-purple-400" />} label="Santé (résistance)" value={health?.resistance != null ? `${health.resistance}%` : '--'} last />
      </Section>

      {charging && (
        <Section title="Charge">
          <Row icon={<Zap size={15} className="text-yellow-400" />} label="Statut" value={charging.status === 'InProgress' ? 'En charge' : charging.status ?? '--'} />
          <Row icon={<Zap size={15} className="text-blue-400" />} label="Mode" value={charging.charging_mode === 'Slow' ? 'Lente (AC)' : 'Rapide (DC)'} />
          <Row icon={<Zap size={15} className="text-green-400" />} label="Vitesse" value={charging.charging_rate ? `+${charging.charging_rate} km/h` : '--'} />
          <Row icon={<Clock size={15} className="text-white/40" />} label="Temps restant" value={charging.remaining_time ? formatDuration(charging.remaining_time) : '--'} last />
        </Section>
      )}

      <Section title="Environnement">
        <Row icon={<Thermometer size={15} className="text-blue-400" />} label="Température" value={data.environment?.air?.temp != null ? `${data.environment.air.temp}°C` : '--'} />
        <Row icon={<Eye size={15} className="text-yellow-400" />} label="Luminosité" value={data.environment?.luminosity?.day ? 'Jour' : 'Nuit'} />
        <Row icon={<Mountain size={15} className="text-green-400" />} label="Altitude" value={data.last_position?.geometry?.coordinates?.[2] != null ? `${Math.round(data.last_position.geometry.coordinates[2])} m` : '--'} last />
      </Section>

      <Section title="Véhicule">
        <Row icon={<Gauge size={15} className="text-purple-400" />} label="Kilométrage" value={data.timed_odometer?.mileage ? `${Math.round(data.timed_odometer.mileage).toLocaleString('fr-FR')} km` : '--'} />
        <Row icon={<Wind size={15} className="text-white/40" />} label="Climatisation" value={data.preconditionning?.air_conditioning?.status ?? '--'} />
        <Row icon={<Zap size={15} className="text-blue-400" />} label="Contact" value={data.ignition?.type ?? '--'} last />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  )
}

function Row({ icon, label, value, last }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${!last ? 'border-b border-white/5' : ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
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
