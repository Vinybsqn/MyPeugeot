import { Clock } from 'lucide-react'

export default function HeroCard({ energy, updatedAt }) {
  const level = energy?.level ?? 0
  const autonomy = energy?.autonomy ?? 0
  const charging = energy?.charging
  const isCharging = charging?.status === 'InProgress'
  const levelColor = !isCharging
    ? (level <= 20 ? '#f87171' : level <= 30 ? '#facc15' : '#ffffff')
    : (level > 60 ? '#4ade80' : level > 30 ? '#facc15' : '#f87171')

  return (
    <div className="card relative overflow-hidden" style={{ minHeight: 180 }}>
      <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)' }} />

      <img src="/car.png" alt="e-208"
        className="absolute right-0 bottom-0 pointer-events-none"
        style={{ height: 90, objectFit: 'contain', opacity: 0.95, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))' }}
        onError={e => e.target.style.display = 'none'}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs tracking-widest uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Peugeot · e-208</p>
            <h1 className="text-lg font-bold text-white">e-208 de Vianney</h1>
          </div>
          {isCharging && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-300">Charge</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-0.5 mb-1">
          <span className="text-6xl font-bold tracking-tight" style={{ color: levelColor }}>{level}</span>
          <span className="text-xl font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>%</span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{autonomy} km restants</p>

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
  if (diff < 30) return 'rgba(255,255,255,0.4)'
  if (diff < 120) return '#facc15'
  return '#f87171'
}
