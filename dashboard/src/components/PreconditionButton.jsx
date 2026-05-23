import { useState } from 'react'
import { Thermometer, Loader } from 'lucide-react'

const VIN = 'VR3UHZKXZPT583300'

export default function PreconditionButton({ currentStatus, level, isCharging }) {
  const [loading, setLoading] = useState(false)
  const [localState, setLocalState] = useState(null)

  const isActive = localState !== null ? localState : currentStatus === 'Enabled'
  const disabled = loading || (!isCharging && level != null && level < 50)

  async function toggle() {
    setLoading(true)
    try {
      await fetch(`https://api.vbasquin.com/preconditioning/${VIN}/${isActive ? 0 : 1}`)
      setLocalState(!isActive)
    } catch {}
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={disabled} className="card w-full p-5 flex items-center justify-between"
      style={{
        opacity: disabled && !loading ? 0.38 : 1,
        ...(isActive ? { background: 'rgba(251,146,60,0.1)', borderColor: 'rgba(251,146,60,0.22)' } : {}),
      }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: isActive ? 'rgba(251,146,60,0.15)' : 'var(--card-inner)' }}>
          {loading
            ? <Loader size={18} className="animate-spin" style={{ color: '#fb923c' }} />
            : <Thermometer size={18} style={{ color: isActive ? '#fb923c' : 'var(--t2)' }} />
          }
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Préchauffage</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
            {disabled && !loading ? 'Batterie insuffisante' : isActive ? 'Actif' : 'Inactif'}
          </p>
        </div>
      </div>

      <div className="relative w-12 h-7 rounded-full transition-all duration-300"
        style={{ background: isActive ? '#fb923c' : 'var(--toggle-off)' }}>
        <div className="absolute top-0.5 w-6 h-6 rounded-full shadow transition-all duration-300"
          style={{ left: isActive ? '22px' : '2px', background: '#ffffff' }} />
      </div>
    </button>
  )
}
