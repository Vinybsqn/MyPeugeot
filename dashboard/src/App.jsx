import { useState } from 'react'
import { useVehicle } from './hooks/useVehicle'
import BatteryCard from './components/BatteryCard'
import StatsRow from './components/StatsRow'
import MapCard from './components/MapCard'
import StatusBar from './components/StatusBar'
import BottomNav from './components/BottomNav'
import TripsPage from './pages/TripsPage'
import ChargePage from './pages/ChargePage'

export default function App() {
  const [tab, setTab] = useState('home')
  const { data, loading, error, lastUpdate, refresh } = useVehicle()
  const energy = data?.energy?.[0]

  return (
    <div className="min-h-svh bg-slate-900 max-w-md mx-auto">
      {/* Scrollable content */}
      <div className="px-4 pt-12 pb-28 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-white">Peugeot e-208</h1>
            <p className="text-xs text-slate-400">VR3UHZKXZPT583300</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg">
            ⚡
          </div>
        </div>

        {tab === 'home' && (
          <>
            <StatusBar
              lastUpdate={lastUpdate}
              loading={loading}
              error={error}
              onRefresh={refresh}
            />
            {loading && !data ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-slate-400 text-sm animate-pulse">Connexion en cours...</div>
              </div>
            ) : error && !data ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                <div className="text-red-400 text-sm">Impossible de contacter le serveur</div>
                <button onClick={refresh} className="px-4 py-2 bg-blue-600 rounded-xl text-sm text-white">
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <BatteryCard energy={energy} />
                <StatsRow data={data} />
                <MapCard position={data?.last_position} />
              </>
            )}
          </>
        )}

        {tab === 'trips' && <TripsPage />}
        {tab === 'charge' && <ChargePage />}

      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
