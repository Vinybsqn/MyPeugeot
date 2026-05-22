import { useState, useEffect, useRef } from 'react'
import { useVehicle } from './hooks/useVehicle'
import HeroCard from './components/HeroCard'
import BatteryCard from './components/BatteryCard'
import StatsRow from './components/StatsRow'
import MapCard from './components/MapCard'
import StatusBar from './components/StatusBar'
import BottomNav from './components/BottomNav'
import PreconditionButton from './components/PreconditionButton'
import TripsPage from './pages/TripsPage'
import ChargePage from './pages/ChargePage'
import StatsPage from './pages/StatsPage'

export default function App() {
  const [tab, setTab] = useState('home')
  const { data, loading, error, lastUpdate, fresh, refresh } = useVehicle()
  const energy = data?.energy?.[0]
  const [barWidth, setBarWidth] = useState(0)
  const barTimer = useRef(null)

  useEffect(() => {
    if (loading) {
      setBarWidth(0)
      clearTimeout(barTimer.current)
      requestAnimationFrame(() => setBarWidth(80))
    } else {
      setBarWidth(100)
      barTimer.current = setTimeout(() => setBarWidth(0), 400)
    }
    return () => clearTimeout(barTimer.current)
  }, [loading])

  return (
    <div className="app-bg max-w-md mx-auto min-h-svh relative">

      {/* Progress bar */}
      {barWidth > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3 }}>
          <div style={{
            height: '100%',
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #ef4444, #f97316, #facc15)',
            boxShadow: '0 0 8px rgba(239,68,68,0.8)',
            transition: loading ? 'width 3s ease-out' : 'width 0.3s ease-in',
          }} />
        </div>
      )}

      {/* Toast */}
      {fresh && (
        <div className="fixed top-14 left-1/2 z-50 toast" style={{ transform: 'translateX(-50%)' }}>
          <div className="px-4 py-2 rounded-2xl text-xs font-medium text-white/80"
            style={{ background: 'rgba(30,30,45,0.9)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            Données reçues
          </div>
        </div>
      )}

      <div className="px-4 pt-safe pb-36 flex flex-col gap-4">

        {/* Status bar */}
        <StatusBar lastUpdate={lastUpdate} loading={loading} error={error} onRefresh={refresh} />

        {tab === 'home' && (
          <>
            {loading && !data ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-white/30 text-sm animate-pulse">Connexion en cours...</div>
              </div>
            ) : error && !data ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="text-red-400/80 text-sm">Serveur inaccessible</div>
                <button onClick={refresh} className="glass rounded-2xl px-5 py-2.5 text-sm text-white">
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <HeroCard energy={energy} />
                <StatsRow data={data} />
                <BatteryCard energy={energy} voltage={data?.battery?.voltage} />
                <PreconditionButton currentStatus={data?.preconditionning?.air_conditioning?.status} />
                <MapCard position={data?.last_position} />
              </>
            )}
          </>
        )}

        {tab === 'stats' && <StatsPage />}
        {tab === 'trips' && <TripsPage />}
        {tab === 'charge' && <ChargePage />}

      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
