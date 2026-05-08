import { Thermometer, Gauge, Moon, Sun } from 'lucide-react'

export default function StatsRow({ data }) {
  const temp = data?.environment?.air?.temp
  const mileage = data?.timed_odometer?.mileage
  const isDay = data?.environment?.luminosity?.day
  const speed = data?.kinetic?.speed

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={<Thermometer size={18} className="text-blue-400" />}
        value={temp != null ? `${temp}°C` : '--'}
        label="Température"
      />
      <StatCard
        icon={<Gauge size={18} className="text-purple-400" />}
        value={mileage != null ? `${Math.round(mileage).toLocaleString('fr-FR')}` : '--'}
        label="km totaux"
      />
      <StatCard
        icon={isDay
          ? <Sun size={18} className="text-yellow-400" />
          : <Moon size={18} className="text-indigo-400" />}
        value={speed != null ? `${speed} km/h` : '--'}
        label={isDay ? 'Jour' : 'Nuit'}
      />
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-slate-800/60 rounded-2xl p-4 flex flex-col items-center gap-1">
      {icon}
      <div className="text-base font-semibold text-white">{value}</div>
      <div className="text-xs text-slate-400 text-center">{label}</div>
    </div>
  )
}
