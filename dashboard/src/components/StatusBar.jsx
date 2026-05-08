import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

export default function StatusBar({ lastUpdate, loading, error, onRefresh }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-green-400 animate-pulse'}`} />
        <span className="text-xs text-white/30">
          {error
            ? 'Connexion perdue'
            : lastUpdate
            ? `Mis à jour ${lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Connexion...'
          }
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-1.5 rounded-full text-white/30 active:text-white/80 transition-colors"
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
