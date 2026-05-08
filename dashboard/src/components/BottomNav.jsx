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
      <div className="max-w-md mx-auto">
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-2 pb-safe">
          <div className="flex">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  active === id ? 'text-blue-400' : 'text-slate-500'
                }`}
              >
                <Icon size={22} strokeWidth={active === id ? 2.5 : 1.5} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
