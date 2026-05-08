export default function HeroCard({ energy, data }) {
  const level = energy?.level ?? 0
  const autonomy = energy?.autonomy ?? 0
  const charging = energy?.charging
  const isCharging = charging?.status === 'InProgress'

  const color = level > 60 ? '#22c55e' : level > 30 ? '#eab308' : '#ef4444'

  return (
    <div className="relative rounded-3xl overflow-hidden glow-red" style={{ minHeight: 220 }}>
      {/* Background gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(180,20,20,0.35) 0%, rgba(10,10,20,0.95) 70%)',
      }} />

      {/* Car image */}
      <img
        src="/car.png"
        alt="e-208"
        className="absolute right-0 bottom-0 h-36 object-contain drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
        onError={e => e.target.style.display = 'none'}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: 220 }}>
        <div className="flex items-start justify-between mb-auto">
          <div>
            <p className="text-xs text-white/50 font-medium tracking-widest uppercase mb-1">Peugeot</p>
            <h1 className="text-2xl font-bold text-white">e-208</h1>
          </div>
          {isCharging && (
            <div className="glass rounded-2xl px-3 py-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-300 font-medium">En charge</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mt-6">
          {/* Battery level */}
          <div>
            <div className="text-5xl font-bold text-white" style={{ color }}>
              {level}<span className="text-2xl font-medium text-white/60">%</span>
            </div>
            <div className="text-sm text-white/50 mt-1">{autonomy} km autonomie</div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col items-end gap-1 mb-1">
            <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${level}%`, background: color }}
              />
            </div>
            {charging?.remaining_time && (
              <span className="text-xs text-white/40">{formatDuration(charging.remaining_time)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return iso
  const h = match[1] ? `${match[1]}h ` : ''
  const m = match[2] ? `${match[2]}min` : ''
  return `${h}${m}`
}
