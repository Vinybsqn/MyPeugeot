import { Zap } from 'lucide-react'

export default function HeroCard({ energy }) {
  const level = energy?.level ?? 0
  const autonomy = energy?.autonomy ?? 0
  const charging = energy?.charging
  const isCharging = charging?.status === 'InProgress'


  return (
    <div className="card relative overflow-hidden" style={{ minHeight: 200 }}>
      {/* Red ambient glow top-left */}
      <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)' }} />

      {/* Car image */}
      <img
        src="/car.png"
        alt="e-208"
        className="absolute -right-4 bottom-0 h-32 object-contain opacity-90 pointer-events-none"
        style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}
      />

      <div className="relative z-10 p-6">
        {/* Top row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Peugeot</p>
            <h1 className="text-2xl font-bold text-white">e-208</h1>
          </div>
          {isCharging && (
            <div className="card-inner flex items-center gap-1.5 px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-300">En charge</span>
            </div>
          )}
        </div>

        {/* Battery info */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-white">{level}</span>
              <span className="text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>%</span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{autonomy} km d'autonomie</p>
          </div>

          {charging?.remaining_time && (
            <div className="card-inner flex items-center gap-1.5 px-3 py-1.5 mb-1">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatDuration(charging.remaining_time)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return iso
  return `${match[1] ? match[1] + 'h ' : ''}${match[2] ? match[2] + 'min' : ''}`
}
