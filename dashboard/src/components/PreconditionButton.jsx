import { useState } from 'react'
import { Thermometer, Loader } from 'lucide-react'

const VIN = 'VR3UHZKXZPT583300'

export default function PreconditionButton({ currentStatus }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const isActive = currentStatus === 'Enabled'

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
    <div className="bg-slate-800/60 rounded-3xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Thermometer size={16} className="text-orange-400" />
          <span className="text-sm font-medium text-slate-300">Préchauffage</span>
        </div>
        {result && (
          <span className={`text-xs px-2 py-1 rounded-lg ${
            result === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {result === 'on' ? 'Activé ✓' : result === 'off' ? 'Désactivé ✓' : 'Erreur'}
          </span>
        )}
      </div>

      <button
        onClick={toggle}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl transition-colors disabled:opacity-50 ${
          isActive
            ? 'bg-orange-500/30 border border-orange-400/50 text-orange-300 active:bg-orange-500/50'
            : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 active:bg-slate-700'
        }`}
      >
        {loading
          ? <Loader size={18} className="animate-spin" />
          : <Thermometer size={18} />
        }
        <span className="text-sm font-medium">
          {isActive ? 'Désactiver le préchauffage' : 'Activer le préchauffage'}
        </span>
      </button>
    </div>
  )
}
