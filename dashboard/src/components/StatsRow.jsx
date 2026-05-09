import { Thermometer, Gauge, Mountain, Zap } from 'lucide-react'

export default function StatsRow({ data }) {
  const stats = [
    {
      icon: <Thermometer size={15} style={{ color: '#60a5fa' }} />,
      value: data?.environment?.air?.temp != null ? `${data.environment.air.temp}°C` : '--',
      label: 'Temp.',
    },
    {
      icon: <Gauge size={15} style={{ color: '#c084fc' }} />,
      value: data?.timed_odometer?.mileage != null
        ? `${Math.round(data.timed_odometer.mileage).toLocaleString('fr-FR')}`
        : '--',
      label: 'km',
    },
    {
      icon: <Mountain size={15} style={{ color: '#4ade80' }} />,
      value: data?.last_position?.geometry?.coordinates?.[2] != null
        ? `${Math.round(data.last_position.geometry.coordinates[2])}m`
        : '--',
      label: 'Altitude',
    },
    {
      icon: <Zap size={15} style={{ color: '#facc15' }} />,
      value: data?.battery?.voltage != null ? `${data.battery.voltage}V` : '--',
      label: 'Tension',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => (
        <div key={i} className="card flex flex-col items-center gap-2 py-4 px-2">
          {s.icon}
          <span className="text-sm font-bold text-white">{s.value}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
