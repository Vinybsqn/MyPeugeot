import { Home, Navigation, Zap, BarChart2 } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'trips', label: 'Trajets', icon: Navigation },
  { id: 'charge', label: 'Recharges', icon: Zap },
]

export default function BottomNav({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-3 pb-safe">
        <div className="glass-nav rounded-3xl px-2 py-2 mb-2">
          <div className="flex">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all"
                  style={isActive ? { background: 'rgba(255,255,255,0.1)' } : {}}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={isActive ? 'text-white' : 'text-white/35'}
                  />
                  <span className={`text-xs transition-colors ${isActive ? 'text-white font-medium' : 'text-white/35'}`}>
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
