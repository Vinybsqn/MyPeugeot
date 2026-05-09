import { Home, Navigation, Zap, BarChart2 } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'trips', label: 'Trajets', icon: Navigation },
  { id: 'charge', label: 'Recharges', icon: Zap },
]

export default function BottomNav({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-4 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 12px)' }}>
      <div className="nav-bar rounded-3xl px-2 py-1.5">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => onChange(id)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
                style={isActive ? { background: 'rgba(255,255,255,0.09)' } : {}}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)' }} />
                <span className="text-xs font-medium"
                  style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
