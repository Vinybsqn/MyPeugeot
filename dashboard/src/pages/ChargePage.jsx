import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useChargings } from '../hooks/useChargings'
import { Zap, Battery, Clock } from 'lucide-react'

export default function ChargePage() {
  const { chargings, loading } = useChargings()
  const [selected, setSelected] = useState(null)

  if (loading) return <EmptyState loading />
  if (chargings.length === 0) return <EmptyState />

  const charge = selected ?? chargings[0]

  // Build curve data: start → end with interpolated points
  const curveData = buildCurveData(charge)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white px-1">Recharges</h2>

      {/* Curve chart */}
      <div className="bg-slate-800/60 rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-white">{formatDate(charge.start_at)}</div>
            <div className="text-xs text-slate-400">
              {charge.start_level}% → {charge.end_level}%
              {charge.kw && ` • ${charge.kw?.toFixed(1)} kWh`}
            </div>
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
            charge.charging_mode === 'fast' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            {charge.charging_mode === 'fast' ? 'Rapide' : 'Lente'}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={curveData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                color: '#f1f5f9',
                fontSize: 12,
              }}
              formatter={(v) => [`${v}%`, 'Batterie']}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charge list */}
      <div className="flex flex-col gap-2">
        {chargings.map((c, i) => (
          <button
            key={i}
            onClick={() => setSelected(c)}
            className={`w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors ${
              (selected ?? chargings[0]) === c
                ? 'bg-green-600/20 border border-green-500/40'
                : 'bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{formatDate(c.start_at)}</div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Battery size={10} />
                <span>{c.start_level}% → {c.end_level}%</span>
                {c.kw && <><span>•</span><span>{c.kw?.toFixed(1)} kWh</span></>}
              </div>
            </div>
            <div className="text-right flex-shrink-0 text-xs text-slate-400">
              {c.stop_at && (
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  {formatChargeDuration(c.start_at, c.stop_at)}
                </div>
              )}
            </div>
          </button>
        ))}
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
  const data = []
  for (let i = 0; i <= steps; i++) {
    const t = new Date(start.getTime() + (totalMs * i) / steps)
    // charging curve is roughly logarithmic: fast at start, slower near end
    const progress = i / steps
    const level = Math.round(
      charge.start_level + (charge.end_level - charge.start_level) * Math.sqrt(progress)
    )
    data.push({
      time: t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      level: Math.min(level, 100),
    })
  }
  return data
}

function EmptyState({ loading }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-4xl">⚡</div>
      <div className="text-slate-400 text-sm text-center">
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
