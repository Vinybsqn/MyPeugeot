import { useState } from 'react'
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
  const { data, loading, error, lastUpdate, refresh } = useVehicle()
  const energy = data?.energy?.[0]

  return (
    <div className="app-bg max-w-md mx-auto min-h-svh relative">
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
                <HeroCard energy={energy} updatedAt={data?.timed_odometer?.updated_at} />
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
