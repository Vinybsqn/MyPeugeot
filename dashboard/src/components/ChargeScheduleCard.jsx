import { useState } from 'react'
import { Clock, Loader, Zap } from 'lucide-react'
import { BASE, VIN } from '../api'

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
      <button onClick={toggle} disabled={loading} className="w-full p-5 flex items-center justify-between"
        style={!isScheduled ? { background: 'rgba(34,197,94,0.07)', borderRadius: 0 } : {}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: !isScheduled ? 'rgba(34,197,94,0.15)' : 'var(--card-inner)' }}>
            {loading
              ? <Loader size={18} className="animate-spin" style={{ color: '#22c55e' }} />
              : !isScheduled
                ? <Zap size={18} style={{ color: '#22c55e' }} />
                : <Clock size={18} style={{ color: 'var(--t2)' }} />
            }
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Charge programmée</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
              {!isScheduled ? 'Charge immédiate active' : `Programmée à ${hour}h${String(minute).padStart(2, '0')}`}
            </p>
          </div>
        </div>
        <div className="relative w-12 h-7 rounded-full transition-all duration-300"
          style={{ background: isScheduled ? '#22c55e' : 'var(--toggle-off)' }}>
          <div className="absolute top-0.5 w-6 h-6 rounded-full shadow transition-all duration-300"
            style={{ left: isScheduled ? '22px' : '2px', background: '#ffffff' }} />
        </div>
      </button>

      {isScheduled && (
        <div className="px-5 py-4 flex items-center gap-3 sep">
          <select value={hour} onChange={e => setHour(+e.target.value)}
            className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold text-center appearance-none"
            style={{ background: 'var(--card-inner)', border: '1px solid var(--card-inner-border)', color: 'var(--t1)' }}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>
            ))}
          </select>
          <span style={{ color: 'var(--t3)', fontWeight: 'bold' }}>:</span>
          <select value={minute} onChange={e => setMinute(+e.target.value)}
            className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold text-center appearance-none"
            style={{ background: 'var(--card-inner)', border: '1px solid var(--card-inner-border)', color: 'var(--t1)' }}>
            {[0, 15, 30, 45].map(m => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}min</option>
            ))}
          </select>
          <button onClick={saveTime} disabled={loading}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: saved ? 'rgba(34,197,94,0.15)' : 'var(--card-inner)',
              color: saved ? '#22c55e' : 'var(--t1)',
              border: '1px solid var(--card-inner-border)',
            }}>
            {saved ? '✓ Sauvé' : 'Appliquer'}
          </button>
        </div>
      )}
    </div>
  )
}
