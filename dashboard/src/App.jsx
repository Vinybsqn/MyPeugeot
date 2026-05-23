import { useState, useEffect, useRef } from 'react'
import { useVehicle } from './hooks/useVehicle'
import HeroCard from './components/HeroCard'
import BatteryCard from './components/BatteryCard'
import StatsRow from './components/StatsRow'
import MapCard from './components/MapCard'
import StatusBar from './components/StatusBar'
import BottomNav from './components/BottomNav'
import PreconditionButton from './components/PreconditionButton'
import ChargeScheduleCard from './components/ChargeScheduleCard'
import TripsPage from './pages/TripsPage'
import ChargePage from './pages/ChargePage'
import StatsPage from './pages/StatsPage'
import CostPage from './pages/CostPage'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [theme, setTheme] = useState(getSystemTheme)
  const { data, loading, error, lastUpdate, fresh, refresh } = useVehicle()
  const energy = data?.energy?.[0]
  const [barWidth, setBarWidth] = useState(0)
  const barTimer = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
    <div data-theme={theme} className="app-bg max-w-md mx-auto min-h-svh relative">

      {/* Progress bar */}
      {barWidth > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3 }}>
          <div style={{
            height: '100%',
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #ef4444, #f97316)',
            transition: loading ? 'width 3s ease-out' : 'width 0.3s ease-in',
          }} />
        </div>
      )}

      {/* Toast */}
      {fresh && (
        <div className="fixed top-14 left-1/2 z-50 toast">
          <div className="px-4 py-2 rounded-2xl text-xs font-medium"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              color: 'var(--t1)',
              boxShadow: 'var(--card-shadow)',
            }}>
            Données reçues
          </div>
        </div>
      )}

      <div className="px-4 pt-safe pb-36 flex flex-col gap-4">

        <StatusBar lastUpdate={lastUpdate} loading={loading} error={error} onRefresh={refresh} />

        {tab === 'home' && (
          <>
            {loading && !data ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-sm animate-pulse" style={{ color: 'var(--t3)' }}>Connexion en cours...</div>
              </div>
            ) : error && !data ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="text-sm" style={{ color: '#f87171' }}>Serveur inaccessible</div>
                <button onClick={refresh} className="card px-5 py-2.5 text-sm" style={{ color: 'var(--t1)' }}>
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <HeroCard energy={energy} />
                <StatsRow data={data} />
                <BatteryCard energy={energy} />
                <PreconditionButton currentStatus={data?.preconditionning?.air_conditioning?.status} level={energy?.level} isCharging={energy?.charging?.status === 'InProgress'} />
                <ChargeScheduleCard charging={energy?.charging} />
                <MapCard position={data?.last_position} />
              </>
            )}
          </>
        )}

        {tab === 'stats' && <StatsPage />}
        {tab === 'trips' && <TripsPage />}
        {tab === 'charge' && <ChargePage />}
        {tab === 'cost' && <CostPage />}

      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
