import { useVehicle } from '../hooks/useVehicle'
import { Battery, Zap, Thermometer, Gauge, Mountain, Wind, Eye, Clock } from 'lucide-react'

export default function StatsPage() {
  const { data, loading } = useVehicle()

  if (loading || !data) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm animate-pulse" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
    </div>
  )

  const energy = data.energy?.[0]
  const charging = energy?.charging
  const health = energy?.battery?.health

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-white px-1">Statistiques</h2>

      <Section title="Batterie">
        <Row icon={<Battery size={15} />} color="#4ade80" label="Niveau" value={`${energy?.level ?? '--'}%`} />
        <Row icon={<Zap size={15} />} color="#facc15" label="Tension" value={data.battery?.voltage ? `${data.battery.voltage} V` : '--'} />
        <Row icon={<Battery size={15} />} color="#60a5fa" label="Autonomie" value={`${energy?.autonomy ?? '--'} km`} />
        <Row icon={<Battery size={15} />} color="#c084fc" label="Santé batterie" value={health?.resistance != null ? `${health.resistance}%` : '--'} last />
      </Section>

      {charging?.plugged && charging?.status === 'InProgress' && (
        <Section title="Charge en cours">
          <Row icon={<Zap size={15} />} color="#facc15" label="Mode" value={charging.charging_mode === 'Slow' ? 'Lente (AC)' : 'Rapide (DC)'} />
          <Row icon={<Zap size={15} />} color="#4ade80" label="Vitesse" value={charging.charging_rate ? `+${charging.charging_rate} km/h` : '--'} />
          <Row icon={<Clock size={15} />} color="rgba(255,255,255,0.4)" label="Temps restant" value={charging.remaining_time ? fmt(charging.remaining_time) : '--'} last />
        </Section>
      )}

      <Section title="Environnement">
        <Row icon={<Thermometer size={15} />} color="#60a5fa" label="Température" value={data.environment?.air?.temp != null ? `${data.environment.air.temp}°C` : '--'} />
        <Row icon={<Eye size={15} />} color="#facc15" label="Luminosité" value={data.environment?.luminosity?.day ? 'Jour' : 'Nuit'} />
        <Row icon={<Mountain size={15} />} color="#4ade80" label="Altitude" value={data.last_position?.geometry?.coordinates?.[2] != null ? `${Math.round(data.last_position.geometry.coordinates[2])} m` : '--'} last />
      </Section>

      <Section title="Véhicule">
        <Row icon={<Gauge size={15} />} color="#c084fc" label="Kilométrage" value={data.timed_odometer?.mileage ? `${Math.round(data.timed_odometer.mileage).toLocaleString('fr-FR')} km` : '--'} />
        <Row icon={<Wind size={15} />} color="rgba(255,255,255,0.4)" label="Climatisation" value={data.preconditionning?.air_conditioning?.status ?? '--'} />
        <Row icon={<Zap size={15} />} color="#60a5fa" label="Contact" value={data.ignition?.type ?? '--'} last />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function Row({ icon, color, label, value, last }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={!last ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function fmt(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return iso
  return `${m[1] ? m[1] + 'h ' : ''}${m[2] ? m[2] + 'min' : ''}`
}
