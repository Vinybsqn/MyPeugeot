import { useState } from 'react'
import { useChargings } from '../hooks/useChargings'
import { useTrips } from '../hooks/useTrips'
import { Zap, Navigation, Euro, Battery } from 'lucide-react'

const RATE_DAY = 0.29
const RATE_NIGHT = 0.25
const RATE_AVG = 0.27

function chargeCost(c) {
  if (!c.kw) return 0
  const start = new Date(c.start_at)
  const stop = c.stop_at ? new Date(c.stop_at) : new Date()
  const totalMs = stop - start
  if (totalMs <= 0) return c.kw * RATE_DAY
  let nightMs = 0
  const cur = new Date(start)
  while (cur < stop) {
    const next = new Date(cur)
    next.setHours(next.getHours() + 1, 0, 0, 0)
    const segEnd = next < stop ? next : stop
    const h = cur.getHours()
    if (h >= 23 || h < 8) nightMs += segEnd - cur
    cur.setTime(next.getTime())
  }
  const night = nightMs / totalMs
  return c.kw * (night * RATE_NIGHT + (1 - night) * RATE_DAY)
}

function computeStats(chargings, trips, since, until) {
  const cs = chargings.filter(c => { const t = new Date(c.start_at); return t >= since && t < until })
  const ts = trips.filter(t => { const s = new Date(t.start_at); return s >= since && s < until })
  const kWhConsumed = ts.reduce((s, t) => s + (t.consumption_km ?? 0) * (t.distance ?? 0) / 100, 0)
  return {
    kWhCharged: cs.reduce((s, c) => s + (c.kw ?? 0), 0),
    costCharged: cs.reduce((s, c) => s + chargeCost(c), 0),
    kWhConsumed,
    costConsumed: kWhConsumed * RATE_AVG,
    km: ts.reduce((s, t) => s + (t.distance ?? 0), 0),
    sessions: cs.length,
  }
}

function getWeekStats(chargings, trips) {
  const now = new Date()
  const since = new Date(now)
  since.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  since.setHours(0, 0, 0, 0)
  return [{ label: 'Cette semaine', ...computeStats(chargings, trips, since, new Date()) }]
}

function getMonthStats(chargings, trips) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const since = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const until = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = since.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return { label, ...computeStats(chargings, trips, since, until) }
  }).filter(p => p.sessions > 0 || p.km > 0)
}

export default function CostPage() {
  const { chargings, loading: lc } = useChargings()
  const { trips, loading: lt } = useTrips()
  const [period, setPeriod] = useState('month')

  if (lc || lt) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm animate-pulse" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
    </div>
  )

  const periods = period === 'week' ? getWeekStats(chargings, trips) : getMonthStats(chargings, trips)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-white">Coût</h2>
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['week', 'month'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={period === p
                ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                : { color: 'rgba(255,255,255,0.35)' }}>
              {p === 'week' ? 'Semaine' : 'Mensuel'}
            </button>
          ))}
        </div>
      </div>

      {periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="text-5xl">💶</div>
          <div className="text-white/30 text-sm text-center leading-relaxed">Aucune donnée encore.{'\n'}Les stats apparaîtront après tes premiers trajets et recharges.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {periods.map((p, i) => <StatCard key={i} stats={p} />)}
        </div>
      )}

      <div className="px-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Tarifs : {RATE_DAY}€/kWh (8h-23h) · {RATE_NIGHT}€/kWh (23h-8h) · {RATE_AVG}€/kWh moy. consommation
      </div>
    </div>
  )
}

function StatCard({ stats }) {
  const costPerKm = stats.km > 0 ? stats.costConsumed / stats.km : null

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-semibold text-white capitalize">{stats.label}</p>
      </div>

      {/* Rechargé */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs mb-2.5 font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Rechargé</p>
        <div className="flex justify-between">
          <Stat icon={<Zap size={13} />} color="#facc15" label="Énergie" value={stats.kWhCharged > 0 ? `${stats.kWhCharged.toFixed(1)} kWh` : '--'} />
          <Stat icon={<Euro size={13} />} color="#4ade80" label="Coût" value={stats.costCharged > 0 ? `${stats.costCharged.toFixed(2)} €` : '--'} />
          <Stat icon={<Battery size={13} />} color="#c084fc" label="Sessions" value={stats.sessions > 0 ? `${stats.sessions}` : '--'} />
        </div>
      </div>

      {/* Consommé */}
      <div className="px-5 py-3">
        <p className="text-xs mb-2.5 font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Consommé en roulant</p>
        <div className="flex justify-between">
          <Stat icon={<Zap size={13} />} color="#facc15" label="Énergie" value={stats.kWhConsumed > 0 ? `${stats.kWhConsumed.toFixed(1)} kWh` : '--'} />
          <Stat icon={<Euro size={13} />} color="#4ade80" label="Coût" value={stats.costConsumed > 0 ? `${stats.costConsumed.toFixed(2)} €` : '--'} />
          <Stat icon={<Navigation size={13} />} color="#60a5fa" label={costPerKm ? `${(costPerKm * 100).toFixed(1)} cts/km` : 'Distance'} value={stats.km > 0 ? `${Math.round(stats.km)} km` : '--'} />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, color, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  )
}
