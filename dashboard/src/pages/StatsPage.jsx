import { useVehicle } from '../hooks/useVehicle'
import { Battery, Zap, Thermometer, Gauge, Mountain, Wind, Eye, Clock } from 'lucide-react'
import BatteryHistoryCard from '../components/BatteryHistoryCard'

export default function StatsPage() {
  const { data, loading } = useVehicle()

  if (loading || !data) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm animate-pulse" style={{ color: 'var(--t3)' }}>Chargement...</p>
    </div>
  )

  const energy = data.energy?.[0]
  const charging = energy?.charging
  const health = energy?.battery?.health

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold px-1" style={{ color: 'var(--t1)' }}>Statistiques</h2>

      <BatteryHistoryCard />

      <Section title="Batterie">
        <Row icon={<Battery size={15} />} label="Niveau" value={`${energy?.level ?? '--'}%`} />
        <Row icon={<Zap size={15} />} label="Tension" value={data.battery?.voltage ? `${data.battery.voltage} V` : '--'} />
        <Row icon={<Battery size={15} />} label="Autonomie" value={`${energy?.autonomy ?? '--'} km`} />
        <Row icon={<Battery size={15} />} label="Santé batterie" value={health?.resistance != null ? `${health.resistance}%` : '--'} last />
      </Section>

      {charging?.plugged && charging?.status === 'InProgress' && (
        <Section title="Charge en cours">
          <Row icon={<Zap size={15} />} label="Mode" value={charging.charging_mode === 'Slow' ? 'Lente (AC)' : 'Rapide (DC)'} />
          <Row icon={<Zap size={15} />} label="Vitesse" value={charging.charging_rate ? `+${charging.charging_rate} km/h` : '--'} accent="#22c55e" />
          <Row icon={<Clock size={15} />} label="Temps restant" value={charging.remaining_time ? fmt(charging.remaining_time) : '--'} last />
        </Section>
      )}

      <Section title="Environnement">
        <Row icon={<Thermometer size={15} />} label="Température" value={data.environment?.air?.temp != null ? `${data.environment.air.temp}°C` : '--'} />
        <Row icon={<Eye size={15} />} label="Luminosité" value={data.environment?.luminosity?.day ? 'Jour' : 'Nuit'} />
        <Row icon={<Mountain size={15} />} label="Altitude" value={data.last_position?.geometry?.coordinates?.[2] != null ? `${Math.round(data.last_position.geometry.coordinates[2])} m` : '--'} last />
      </Section>

      <Section title="Véhicule">
        <Row icon={<Gauge size={15} />} label="Kilométrage" value={data.timed_odometer?.mileage ? `${Math.round(data.timed_odometer.mileage).toLocaleString('fr-FR')} km` : '--'} />
        <Row icon={<Wind size={15} />} label="Climatisation" value={data.preconditionning?.air_conditioning?.status ?? '--'} />
        <Row icon={<Zap size={15} />} label="Contact" value={data.ignition?.type ?? '--'} last />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 sep">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function Row({ icon, label, value, accent, last }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={!last ? { borderBottom: '1px solid var(--sep)' } : {}}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--card-inner)' }}>
          <span style={{ color: 'var(--t2)' }}>{icon}</span>
        </div>
        <span className="text-sm" style={{ color: 'var(--t2)' }}>{label}</span>
      </div>
      <span className="text-sm font-semibold" style={{ color: accent ?? 'var(--t1)' }}>{value}</span>
    </div>
  )
}

function fmt(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return iso
  return `${m[1] ? m[1] + 'h ' : ''}${m[2] ? m[2] + 'min' : ''}`
}
