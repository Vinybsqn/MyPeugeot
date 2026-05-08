import { Thermometer, Gauge, Mountain, Zap } from 'lucide-react'

export default function StatsRow({ data }) {
  const temp = data?.environment?.air?.temp
  const mileage = data?.timed_odometer?.mileage
  const altitude = data?.last_position?.geometry?.coordinates?.[2]
  const voltage = data?.battery?.voltage

  const stats = [
    { icon: <Thermometer size={16} className="text-blue-400" />, value: temp != null ? `${temp}°` : '--', label: 'Temp.' },
    { icon: <Gauge size={16} className="text-purple-400" />, value: mileage != null ? `${Math.round(mileage / 1000 * 10) / 10}k` : '--', label: 'km total' },
    { icon: <Mountain size={16} className="text-green-400" />, value: altitude != null ? `${Math.round(altitude)}m` : '--', label: 'Altitude' },
    { icon: <Zap size={16} className="text-yellow-400" />, value: voltage != null ? `${voltage}V` : '--', label: 'Tension' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => (
        <div key={i} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5">
          {s.icon}
          <div className="text-sm font-bold text-white">{s.value}</div>
          <div className="text-xs text-white/40">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
