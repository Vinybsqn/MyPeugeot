import { useState } from 'react'
import { Thermometer, Loader } from 'lucide-react'

const VIN = 'VR3UHZKXZPT583300'

export default function PreconditionButton({ currentStatus }) {
  const [loading, setLoading] = useState(false)
  const [localState, setLocalState] = useState(null)

  const isActive = localState !== null ? localState : currentStatus === 'Enabled'

  async function toggle() {
    setLoading(true)
    try {
      const val = isActive ? 0 : 1
      await fetch(`https://api.vbasquin.com/preconditioning/${VIN}/${val}`)
      setLocalState(!isActive)
    } catch {}
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading} className="card w-full p-5 flex items-center justify-between"
      style={isActive ? { background: 'rgba(251,146,60,0.12)', borderColor: 'rgba(251,146,60,0.25)' } : {}}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: isActive ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.06)' }}>
          {loading
            ? <Loader size={18} className="animate-spin" style={{ color: '#fb923c' }} />
            : <Thermometer size={18} style={{ color: isActive ? '#fb923c' : 'rgba(255,255,255,0.4)' }} />
          }
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-white">Préchauffage</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {isActive ? 'Actif' : 'Inactif'}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="relative w-12 h-7 rounded-full transition-all duration-300"
        style={{ background: isActive ? '#fb923c' : 'rgba(255,255,255,0.12)' }}>
        <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
          style={{ left: isActive ? '22px' : '2px' }} />
      </div>
    </button>
  )
}
