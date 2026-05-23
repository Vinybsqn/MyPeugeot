import { RefreshCw } from 'lucide-react'

export default function StatusBar({ lastUpdate, loading, error, onRefresh }) {
  return (
    <div className="flex items-center justify-between px-1 pt-safe">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full"
          style={{ background: error ? '#ef4444' : '#22c55e', opacity: error ? 1 : 0.8 }} />
        <span className="text-xs" style={{ color: 'var(--t3)' }}>
          {error ? 'Connexion perdue' : lastUpdate
            ? `Mis à jour à ${lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Connexion...'}
        </span>
      </div>
      <button onClick={onRefresh} disabled={loading} className="p-1.5 rounded-full" style={{ color: 'var(--t3)' }}>
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
