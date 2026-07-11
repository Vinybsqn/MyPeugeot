import { useState } from 'react'
import { useChargings } from '../hooks/useChargings'
import { useTrips } from '../hooks/useTrips'
import { Zap, Navigation, Euro, Battery } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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
  const thisStart = new Date(now)
  thisStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  thisStart.setHours(0, 0, 0, 0)
  const prevStart = new Date(thisStart)
  prevStart.setDate(prevStart.getDate() - 7)
  const current = { label: 'Cette semaine', ...computeStats(chargings, trips, thisStart, now) }
  const previous = { label: 'Semaine précédente', ...computeStats(chargings, trips, prevStart, thisStart) }
  return [{ ...current, prev: previous }, previous]
}

function getMonthStats(chargings, trips) {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const since = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const until = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = since.toLocaleDateString('fr-FR', { month: 'short' })
    return { label, ...computeStats(chargings, trips, since, until) }
  }).filter(p => p.sessions > 0 || p.km > 0).reverse()
}

export default function CostPage() {
  const { chargings, loading: lc } = useChargings()
  const { trips, loading: lt } = useTrips()
  const [period, setPeriod] = useState('month')

  if (lc || lt) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm animate-pulse" style={{ color: 'var(--t3)' }}>Chargement...</p>
    </div>
  )

  const monthData = getMonthStats(chargings, trips)
  const periods = period === 'week' ? getWeekStats(chargings, trips) : monthData

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--t1)' }}>Coût</h2>
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--card-inner)', border: '1px solid var(--card-inner-border)' }}>
          {['week', 'month'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={period === p
                ? { background: 'var(--card)', color: 'var(--t1)', boxShadow: 'var(--card-shadow)' }
                : { color: 'var(--t3)' }}>
              {p === 'week' ? 'Semaine' : 'Mensuel'}
            </button>
          ))}
        </div>
      </div>

      {/* 12-month chart */}
      {period === 'month' && monthData.length > 1 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 sep">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>Coût rechargé · 12 mois</p>
          </div>
          <div className="px-2 pt-3 pb-2">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <XAxis dataKey="label" tick={{ fill: 'var(--t3)', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--t3)', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, fontSize: 12, color: 'var(--t1)' }}
                  formatter={v => [`${v.toFixed(2)} €`, 'Coût']}
                  labelStyle={{ color: 'var(--t3)', fontSize: 10 }}
                />
                <Bar dataKey="costCharged" radius={[4, 4, 0, 0]}>
                  {monthData.map((_, i) => (
                    <Cell key={i} fill={i === monthData.length - 1 ? '#ff2d55' : 'var(--t3)'} fillOpacity={i === monthData.length - 1 ? 0.9 : 0.35} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="text-5xl">💶</div>
          <div className="text-sm text-center leading-relaxed" style={{ color: 'var(--t3)' }}>
            Aucune donnée encore.{'\n'}Les stats apparaîtront après tes premiers trajets.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {periods.map((p, i) => <StatCard key={i} stats={p} />)}
        </div>
      )}

      <div className="px-1 text-xs" style={{ color: 'var(--t3)' }}>
        {RATE_DAY}€/kWh · 8h-23h · {RATE_NIGHT}€/kWh · 23h-8h · {RATE_AVG}€/kWh moy. consommation
      </div>
    </div>
  )
}

function Delta({ current, previous }) {
  if (!previous || previous === 0 || current === 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return null
  const up = pct > 0
  return (
    <span className="text-xs font-medium ml-1.5" style={{ color: up ? '#ef4444' : '#22c55e' }}>
      {up ? '↑' : '↓'}{Math.abs(pct)}%
    </span>
  )
}

function StatCard({ stats }) {
  const costPerKm = stats.km > 0 ? stats.costConsumed / stats.km : null

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 flex items-center justify-between sep">
        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--t1)' }}>{stats.label}</p>
        {stats.prev && <span className="text-xs" style={{ color: 'var(--t3)' }}>vs sem. préc.</span>}
      </div>

      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--sep)' }}>
        <p className="text-xs mb-3 font-medium tracking-widest uppercase" style={{ color: 'var(--t3)' }}>Rechargé</p>
        <div className="flex justify-between">
          <Stat icon={<Zap size={13} />} label="Énergie" value={stats.kWhCharged > 0 ? `${stats.kWhCharged.toFixed(1)} kWh` : '--'} />
          <Stat icon={<Euro size={13} />} label="Coût" value={stats.costCharged > 0 ? `${stats.costCharged.toFixed(2)} €` : '--'}
            delta={stats.prev && <Delta current={stats.costCharged} previous={stats.prev.costCharged} />} />
          <Stat icon={<Battery size={13} />} label="Sessions" value={stats.sessions > 0 ? `${stats.sessions}` : '--'} />
        </div>
      </div>

      <div className="px-5 py-3.5">
        <p className="text-xs mb-3 font-medium tracking-widest uppercase" style={{ color: 'var(--t3)' }}>Consommé en roulant</p>
        <div className="flex justify-between">
          <Stat icon={<Zap size={13} />} label="Énergie" value={stats.kWhConsumed > 0 ? `${stats.kWhConsumed.toFixed(1)} kWh` : '--'} />
          <Stat icon={<Euro size={13} />} label="Coût" value={stats.costConsumed > 0 ? `${stats.costConsumed.toFixed(2)} €` : '--'}
            delta={stats.prev && <Delta current={stats.costConsumed} previous={stats.prev.costConsumed} />} />
          <Stat icon={<Navigation size={13} />}
            label={costPerKm ? `${(costPerKm * 100).toFixed(1)} cts/km` : 'Distance'}
            value={stats.km > 0 ? `${Math.round(stats.km)} km` : '--'}
            delta={stats.prev && <Delta current={stats.km} previous={stats.prev.km} />} />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, delta }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1" style={{ color: 'var(--t2)' }}>
        {icon}
        <span className="text-xs" style={{ color: 'var(--t3)' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold" style={{ color: 'var(--t1)' }}>{value}</span>
        {delta}
      </div>
    </div>
  )
}
