import { useState } from 'react'
import { Thermometer, Loader } from 'lucide-react'

const VIN = 'VR3UHZKXZPT583300'

export default function PreconditionButton({ currentStatus }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const isActive = currentStatus === 'Enabled' || result === 'on'

  async function toggle() {
    setLoading(true)
    setResult(null)
    try {
      const val = isActive ? 0 : 1
      const res = await fetch(`https://api.vbasquin.com/preconditioning/${VIN}/${val}`)
      if (!res.ok) throw new Error()
      setResult(val === 1 ? 'on' : 'off')
    } catch {
      setResult('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full glass rounded-3xl p-5 flex items-center justify-between transition-all active:scale-95 disabled:opacity-50 ${
        isActive ? 'border-orange-500/30' : ''
      }`}
      style={isActive ? { background: 'rgba(251,146,60,0.12)', borderColor: 'rgba(251,146,60,0.3)' } : {}}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
          isActive ? 'bg-orange-500/30' : 'bg-white/8'
        }`}>
          {loading
            ? <Loader size={20} className="text-orange-400 animate-spin" />
            : <Thermometer size={20} className={isActive ? 'text-orange-400' : 'text-white/50'} />
          }
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-white">Préchauffage</div>
          <div className="text-xs text-white/40">
            {result === 'error' ? 'Erreur' : isActive ? 'Actif — appuyer pour désactiver' : 'Inactif — appuyer pour activer'}
          </div>
        </div>
      </div>

      {/* Toggle pill */}
      <div className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
        isActive ? 'bg-orange-500' : 'bg-white/15'
      }`}>
        <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
          isActive ? 'left-5.5' : 'left-0.5'
        }`} style={{ left: isActive ? '22px' : '2px' }} />
      </div>
    </button>
  )
}
