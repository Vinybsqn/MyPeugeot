import { Thermometer, Gauge, Mountain, Zap } from 'lucide-react'

export default function StatsRow({ data }) {
  const temp = data?.environment?.air?.temp
  const mileage = data?.timed_odometer?.mileage
  const altitude = data?.last_position?.geometry?.coordinates?.[2]
  const voltage = data?.battery?.voltage

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Thermometer size={18} className="text-blue-400" />}
        value={temp != null ? `${temp}°C` : '--'}
        label="Température ext."
      />
      <StatCard
        icon={<Gauge size={18} className="text-purple-400" />}
        value={mileage != null ? `${Math.round(mileage).toLocaleString('fr-FR')} km` : '--'}
        label="Kilométrage"
      />
      <StatCard
        icon={<Mountain size={18} className="text-green-400" />}
        value={altitude != null ? `${Math.round(altitude)} m` : '--'}
        label="Altitude"
      />
      <StatCard
        icon={<Zap size={18} className="text-yellow-400" />}
        value={voltage != null ? `${voltage} V` : '--'}
        label="Tension batterie"
      />
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-slate-800/60 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  )
}
