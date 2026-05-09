import { Home, Navigation, Zap, BarChart2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const tabs = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'trips', label: 'Trajets', icon: Navigation },
  { id: 'charge', label: 'Recharges', icon: Zap },
]

export default function BottomNav({ active, onChange }) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > lastY.current && y > 60)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out"
      style={{ transform: hidden ? 'translateY(100%)' : 'translateY(0)' }}
    >
      <div className="max-w-md mx-auto px-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 12px)' }}>
        <div className="nav-bar rounded-3xl px-2 py-1.5">
          <div className="flex">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-200"
                  style={isActive ? {
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  } : {}}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)' }}
                  />
                  <span className="text-xs font-medium" style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
