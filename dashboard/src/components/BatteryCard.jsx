import { Zap } from 'lucide-react'

export default function BatteryCard({ energy }) {
  const level = energy?.level ?? 0
  const autonomy = energy?.autonomy ?? 0
  const charging = energy?.charging

  const color =
    level > 60 ? '#22c55e' :
    level > 30 ? '#eab308' :
    '#ef4444'

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (level / 100) * circumference

  return (
    <div className="bg-slate-800/60 rounded-3xl p-6 flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{level}%</span>
          <span className="text-xs text-slate-400">batterie</span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-2xl font-semibold text-white">{autonomy} km</div>
        <div className="text-sm text-slate-400">autonomie estimée</div>
      </div>

      {charging?.plugged && (
        <div className="w-full bg-slate-700/50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-sm text-slate-300">
              {charging.status === 'InProgress' ? 'En charge' : charging.status}
            </span>
          </div>
          <div className="text-right">
            {charging.remaining_time && (
              <div className="text-sm font-medium text-white">
                {formatDuration(charging.remaining_time)}
              </div>
            )}
            {charging.charging_mode && (
              <div className="text-xs text-slate-400">{charging.charging_mode}</div>
            )}
          </div>
        </div>
      )}
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
