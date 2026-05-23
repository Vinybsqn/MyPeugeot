import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useChargings } from '../hooks/useChargings'
import { useTrips } from '../hooks/useTrips'
import { useVehicle } from '../hooks/useVehicle'

function buildHistory(chargings, trips, currentLevel) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const points = []

  chargings.forEach(c => {
    if (c.start_level == null || c.end_level == null) return
    const start = new Date(c.start_at)
    const stop = c.stop_at ? new Date(c.stop_at) : null
    if (start >= since) points.push({ t: start, level: c.start_level })
    if (stop && stop >= since) points.push({ t: stop, level: c.end_level })
  })

  trips.forEach(t => {
    if (!t.start_at) return
    const start = new Date(t.start_at)
    if (start >= since) {
      const consumedPct = t.consumption_km && t.distance ? (t.consumption_km * t.distance / 100) / 0.5 : null
      if (consumedPct != null) points.push({ t: start, levelDelta: -consumedPct })
    }
  })

  points.push({ t: new Date(), level: currentLevel })
  points.sort((a, b) => a.t - b.t)

  let last = null
  const result = []
  points.forEach(p => {
    if (p.level != null) {
      last = p.level
      result.push({ time: fmtTime(p.t), level: Math.round(p.level) })
    } else if (p.levelDelta != null && last != null) {
      last = Math.max(0, Math.min(100, last + p.levelDelta))
      result.push({ time: fmtTime(p.t), level: Math.round(last) })
    }
  })

  return result
}

function fmtTime(date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function BatteryHistoryCard() {
  const { data } = useVehicle()
  const { chargings } = useChargings()
  const { trips } = useTrips()

  const currentLevel = data?.energy?.[0]?.level
  if (currentLevel == null) return null

  const history = buildHistory(chargings, trips, currentLevel)
  if (history.length < 2) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 sep">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>
          Batterie · 7 derniers jours
        </p>
      </div>
      <div className="px-2 pt-3 pb-1">
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
            <defs>
              <linearGradient id="battGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: 'var(--t3)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--t3)', fontSize: 9 }} tickLine={false} axisLine={false} />
            <ReferenceLine y={20} stroke="rgba(239,68,68,0.25)" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--t1)',
              }}
              formatter={v => [`${v}%`, 'Batterie']}
              labelStyle={{ color: 'var(--t3)', fontSize: 10 }}
            />
            <Area type="monotone" dataKey="level" stroke="#22c55e" strokeWidth={2} fill="url(#battGrad)" dot={false} activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
