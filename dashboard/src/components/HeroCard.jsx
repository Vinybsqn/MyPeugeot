import { Clock } from 'lucide-react'

export default function HeroCard({ energy }) {
  const level = energy?.level ?? 0
  const autonomy = energy?.autonomy ?? 0
  const charging = energy?.charging
  const isCharging = charging?.status === 'InProgress'
  const updatedAt = energy?.updated_at

  const levelColor = !isCharging
    ? (level <= 20 ? '#ef4444' : level <= 30 ? '#f59e0b' : 'var(--t1)')
    : (level > 60 ? '#22c55e' : level > 30 ? '#f59e0b' : '#ef4444')

  return (
    <div className="card relative overflow-hidden" style={{ minHeight: 180 }}>
      <img src="/car.png" alt="e-208"
        className={`absolute right-0 bottom-0 pointer-events-none${isCharging ? ' car-charging' : ' car-normal'}`}
        style={{ height: 90, objectFit: 'contain', opacity: 0.92 }}
        onError={e => e.target.style.display = 'none'}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs tracking-widest uppercase mb-0.5" style={{ color: 'var(--t3)' }}>Peugeot · e-208</p>
            <h1 className="text-lg font-bold" style={{ color: 'var(--t1)' }}>e-208 de Vianney</h1>
          </div>
          {isCharging && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Charge</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-0.5 mb-1">
          <span className="text-6xl font-bold tracking-tight" style={{ color: levelColor }}>{level}</span>
          <span className="text-xl font-medium mb-1" style={{ color: 'var(--t3)' }}>%</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--t2)' }}>{autonomy} km restants</p>

        {updatedAt && (
          <div className="flex items-center gap-1.5 mt-3">
            <Clock size={10} style={{ color: staleColor(updatedAt) }} />
            <span className="text-xs" style={{ color: staleColor(updatedAt) }}>
              Voiture synchronisée : {timeAgo(updatedAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function timeAgo(isoDate) {
  const diff = Math.floor((Date.now() - new Date(isoDate)) / 60000)
  if (diff < 2) return 'à l\'instant'
  if (diff < 60) return `il y a ${diff} min`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h < 24) return `il y a ${h}h${m > 0 ? m + 'min' : ''}`
  return `il y a ${Math.floor(h / 24)}j`
}

function staleColor(isoDate) {
  const diff = Math.floor((Date.now() - new Date(isoDate)) / 60000)
  if (diff < 30) return 'var(--t3)'
  if (diff < 120) return '#f59e0b'
  return '#ef4444'
}
