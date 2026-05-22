import { useState } from 'react'
import { Clock, Loader, Zap } from 'lucide-react'

const VIN = 'VR3UHZKXZPT583300'
const BASE = 'https://api.vbasquin.com'

function parseTime(iso) {
  if (!iso) return { hour: 8, minute: 0 }
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  return { hour: parseInt(m?.[1] ?? 8), minute: parseInt(m?.[2] ?? 0) }
}

export default function ChargeScheduleCard({ charging }) {
  const scheduled = charging?.status !== 'InProgress' && charging?.next_delayed_time
  const [loading, setLoading] = useState(false)
  const [localScheduled, setLocalScheduled] = useState(null)
  const [saved, setSaved] = useState(false)

  const initial = parseTime(charging?.next_delayed_time)
  const [hour, setHour] = useState(initial.hour)
  const [minute, setMinute] = useState(initial.minute)

  const isScheduled = localScheduled !== null ? localScheduled : !!scheduled

  if (!charging?.plugged) return null

  async function toggle() {
    setLoading(true)
    try {
      if (isScheduled) {
        await fetch(`${BASE}/charge_now/${VIN}/1`)
        setLocalScheduled(false)
      } else {
        await fetch(`${BASE}/charge_hour?vin=${VIN}&hour=${hour}&minute=${String(minute).padStart(2, '0')}`)
        await fetch(`${BASE}/charge_now/${VIN}/0`)
        setLocalScheduled(true)
      }
    } catch {}
    setLoading(false)
  }

  async function saveTime() {
    setLoading(true)
    try {
      await fetch(`${BASE}/charge_hour?vin=${VIN}&hour=${hour}&minute=${String(minute).padStart(2, '0')}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="card overflow-hidden">
      {/* Toggle row */}
      <button onClick={toggle} disabled={loading} className="w-full p-5 flex items-center justify-between"
        style={!isScheduled ? { background: 'rgba(74,222,128,0.08)', borderRadius: 0 } : {}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: !isScheduled ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)' }}>
            {loading
              ? <Loader size={18} className="animate-spin" style={{ color: '#4ade80' }} />
              : !isScheduled
                ? <Zap size={18} style={{ color: '#4ade80' }} />
                : <Clock size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
            }
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Charge programmée</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {!isScheduled ? 'Charge immédiate active' : `Programmée à ${hour}h${String(minute).padStart(2, '0')}`}
            </p>
          </div>
        </div>
        <div className="relative w-12 h-7 rounded-full transition-all duration-300"
          style={{ background: isScheduled ? '#4ade80' : 'rgba(255,255,255,0.12)' }}>
          <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
            style={{ left: isScheduled ? '22px' : '2px' }} />
        </div>
      </button>

      {/* Time picker — visible quand programmé */}
      {isScheduled && (
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <select value={hour} onChange={e => setHour(+e.target.value)}
            className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white text-center appearance-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i} style={{ background: '#1a1a2e' }}>{String(i).padStart(2, '0')}h</option>
            ))}
          </select>
          <span className="text-white/30 font-bold">:</span>
          <select value={minute} onChange={e => setMinute(+e.target.value)}
            className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white text-center appearance-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[0, 15, 30, 45].map(m => (
              <option key={m} value={m} style={{ background: '#1a1a2e' }}>{String(m).padStart(2, '0')}min</option>
            ))}
          </select>
          <button onClick={saveTime} disabled={loading}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: saved ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.1)', color: saved ? '#4ade80' : '#fff' }}>
            {saved ? '✓ Sauvé' : 'Appliquer'}
          </button>
        </div>
      )}
    </div>
  )
}
