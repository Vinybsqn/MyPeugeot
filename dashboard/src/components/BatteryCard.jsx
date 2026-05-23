import { Zap, Clock, Activity } from 'lucide-react'

export default function BatteryCard({ energy }) {
  const charging = energy?.charging
  if (!charging?.plugged) return null

  return (
    <div className="card p-5 flex flex-col gap-4">
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>
        Charge
      </p>

      <Row
        icon={<Zap size={15} style={{ color: 'var(--t2)' }} />}
        label={charging.status === 'InProgress' ? 'En charge' : 'Branché'}
        sub={charging.charging_mode === 'Slow' ? 'Mode lent · AC' : 'Mode rapide · DC'}
        right={charging.remaining_time
          ? <div className="flex items-center gap-1.5 card-inner px-2.5 py-1">
              <Clock size={11} style={{ color: 'var(--t2)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{formatDuration(charging.remaining_time)}</span>
            </div>
          : null}
      />

      {charging.charging_rate && charging.status === 'InProgress' && (
        <Row
          icon={<Activity size={15} style={{ color: '#22c55e' }} />}
          label={`+${charging.charging_rate} km/h`}
          sub="Vitesse de charge"
        />
      )}
    </div>
  )
}

function Row({ icon, label, sub, right }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--card-inner)' }}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--t1)' }}>{label}</div>
          {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{sub}</div>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}

function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return iso
  return `${match[1] ? match[1] + 'h ' : ''}${match[2] ? match[2] + 'min' : ''}`
}
