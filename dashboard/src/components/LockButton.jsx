import { useState } from 'react'
import { Lock, Unlock, Loader } from 'lucide-react'

const VIN = 'VR3UHZKXZPT583300'

export default function LockButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // 'locked' | 'unlocked' | 'error'

  async function toggle(action) {
    setLoading(true)
    setResult(null)
    try {
      const val = action === 'lock' ? 1 : 0
      const res = await fetch(`https://api.vbasquin.com/lock_door/${VIN}/${val}`)
      if (!res.ok) throw new Error()
      setResult(action === 'lock' ? 'locked' : 'unlocked')
    } catch {
      setResult('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/60 rounded-3xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-300">Verrouillage</span>
        {result && (
          <span className={`text-xs px-2 py-1 rounded-lg ${
            result === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {result === 'locked' ? 'Verrouillé ✓' : result === 'unlocked' ? 'Déverrouillé ✓' : 'Erreur'}
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => toggle('lock')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 active:bg-blue-600/40 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Lock size={18} />}
          <span className="text-sm font-medium">Verrouiller</span>
        </button>

        <button
          onClick={() => toggle('unlock')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-300 active:bg-orange-600/40 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Unlock size={18} />}
          <span className="text-sm font-medium">Déverrouiller</span>
        </button>
      </div>
    </div>
  )
}
