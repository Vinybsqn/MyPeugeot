import { Zap, Clock, Battery } from 'lucide-react'

export default function BatteryCard({ energy, voltage }) {
  const charging = energy?.charging
  const health = energy?.battery?.health?.resistance

  if (!charging?.plugged && health == null) return null

  return (
    <div className="glass rounded-3xl p-5 flex flex-col gap-3">
      <p className="text-xs text-white/40 font-semibold tracking-widest uppercase">Charge</p>

      {charging?.plugged && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.15)' }}>
              <Zap size={18} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {charging.status === 'InProgress' ? 'En charge' : 'Branché'}
              </div>
              <div className="text-xs text-white/40">
                {charging.charging_mode === 'Slow' ? 'Mode lent (AC)' : 'Mode rapide (DC)'}
                {charging.charging_rate ? ` · +${charging.charging_rate} km/h` : ''}
              </div>
            </div>
          </div>
          {charging.remaining_time && (
            <div className="glass-strong rounded-2xl px-3 py-1.5 flex items-center gap-1.5">
              <Clock size={12} className="text-white/50" />
              <span className="text-sm font-semibold text-white">{formatDuration(charging.remaining_time)}</span>
            </div>
          )}
        </div>
      )}

      {health != null && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Battery size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Santé batterie</div>
              <div className="text-xs text-white/40">Résistance interne</div>
            </div>
          </div>
          <span className={`text-sm font-bold ${health >= 90 ? 'text-green-400' : health >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
            {health}%
          </span>
        </div>
      )}

      {voltage != null && (
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-xs text-white/40">Tension</span>
          <span className="text-xs font-medium text-white/60">{voltage} V</span>
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
