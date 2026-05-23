import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChargings } from '../hooks/useChargings'
import { Zap, Battery, Clock } from 'lucide-react'

export default function ChargePage() {
  const { chargings, loading } = useChargings()
  const [selected, setSelected] = useState(null)

  if (loading) return <EmptyState loading />
  if (chargings.length === 0) return <EmptyState />

  const charge = selected ?? chargings[0]
  const curveData = buildCurveData(charge)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold px-1" style={{ color: 'var(--t1)' }}>Recharges</h2>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{formatDate(charge.start_at)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
              {charge.start_level}% → {charge.end_level}%
              {charge.kw && ` · ${charge.kw?.toFixed(1)} kWh`}
            </div>
          </div>
          <div className="card-inner px-3 py-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>
              {charge.charging_mode === 'fast' ? 'Rapide' : 'Lente'}
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={curveData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sep)" />
            <XAxis dataKey="time" tick={{ fill: 'var(--t3)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--t3)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 14,
                color: 'var(--t1)',
                fontSize: 12,
                backdropFilter: 'blur(20px)',
              }}
              formatter={(v) => [`${v}%`, 'Batterie']}
            />
            <Line type="monotone" dataKey="level" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2">
        {chargings.map((c, i) => {
          const isSelected = (selected ?? chargings[0]) === c
          return (
            <button
              key={i}
              onClick={() => setSelected(c)}
              className="w-full text-left card px-4 py-3.5 flex items-center gap-3 transition-all"
              style={isSelected ? { background: 'rgba(34,197,94,0.07)', borderColor: 'rgba(34,197,94,0.2)' } : {}}
            >
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card-inner)' }}>
                <Zap size={16} style={{ color: 'var(--t2)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--t1)' }}>{formatDate(c.start_at)}</div>
                <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: 'var(--t3)' }}>
                  <Battery size={10} />
                  <span>{c.start_level}% → {c.end_level}%</span>
                  {c.kw && <><span>·</span><span>{c.kw?.toFixed(1)} kWh</span></>}
                </div>
              </div>
              {c.stop_at && (
                <div className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: 'var(--t3)' }}>
                  <Clock size={10} />
                  {formatChargeDuration(c.start_at, c.stop_at)}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function buildCurveData(charge) {
  if (!charge.start_level || !charge.end_level) return []
  const start = new Date(charge.start_at)
  const end = charge.stop_at ? new Date(charge.stop_at) : new Date(start.getTime() + 60 * 60000)
  const totalMs = end - start
  const steps = 10
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = new Date(start.getTime() + (totalMs * i) / steps)
    const level = Math.round(charge.start_level + (charge.end_level - charge.start_level) * Math.sqrt(i / steps))
    return {
      time: t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      level: Math.min(level, 100),
    }
  })
}

function EmptyState({ loading }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="text-5xl">⚡</div>
      <div className="text-sm text-center leading-relaxed" style={{ color: 'var(--t3)' }}>
        {loading ? 'Chargement...' : 'Aucune recharge enregistrée.\nBranche ta voiture et reviens !'}
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatChargeDuration(start, stop) {
  const ms = new Date(stop) - new Date(start)
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m}min`
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}
