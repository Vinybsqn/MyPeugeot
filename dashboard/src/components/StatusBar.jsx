import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

export default function StatusBar({ lastUpdate, loading, error, onRefresh }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        {error
          ? <WifiOff size={14} className="text-red-400" />
          : <Wifi size={14} className="text-green-400" />
        }
        <span className="text-xs text-slate-500">
          {error
            ? 'Connexion perdue'
            : lastUpdate
            ? `Mis à jour ${lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Chargement...'
          }
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-2 rounded-full text-slate-400 active:text-white transition-colors"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
