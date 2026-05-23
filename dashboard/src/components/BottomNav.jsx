import { Home, Navigation, Zap, BarChart2, Euro } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const tabs = [
  { id: 'home',   label: 'Accueil',   icon: Home },
  { id: 'stats',  label: 'Stats',     icon: BarChart2 },
  { id: 'trips',  label: 'Trajets',   icon: Navigation },
  { id: 'charge', label: 'Recharges', icon: Zap },
  { id: 'cost',   label: 'Coût',      icon: Euro },
]

const SPRING = 'cubic-bezier(0.22, 1.8, 0.36, 1)'
const SPRING_PILL = 'cubic-bezier(0.28, 2.2, 0.40, 1)'
const ACCENT = '#ff2d55'

export default function BottomNav({ active, onChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const lastY = useRef(0)
  const navRef = useRef(null)
  const btnRefs = useRef({})

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setCollapsed(y > lastY.current && y > 80)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const btn = btnRefs.current[active]
    const nav = navRef.current
    if (!btn || !nav) return
    const navRect = nav.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setPillStyle({ left: btnRect.left - navRect.left, width: btnRect.width })
  }, [active])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="max-w-md mx-auto flex justify-start"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 12px)', paddingLeft: 16, paddingRight: 16 }}
      >
        <div style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(100px) saturate(180%)',
          WebkitBackdropFilter: 'blur(100px) saturate(180%)',
          border: '1px solid var(--nav-border)',
          borderRadius: 28,
          padding: '5px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          width: collapsed ? 56 : '100%',
          transition: `width 0.55s ${SPRING}`,
        }}>
          <div ref={navRef} className="relative" style={{ display: 'flex', gap: 4 }}>

            {/* Sliding pill */}
            {!collapsed && pillStyle.width > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: pillStyle.left,
                width: pillStyle.width,
                height: '100%',
                background: 'rgba(255,45,85,0.12)',
                border: 'none',
                borderRadius: 24,
                transition: `left 0.45s ${SPRING_PILL}, width 0.45s ${SPRING_PILL}`,
                pointerEvents: 'none',
              }} />
            )}

            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = active === id
              const isHome = id === 'home'

              return (
                <button
                  key={id}
                  ref={el => btnRefs.current[id] = el}
                  onClick={() => {
                    if (collapsed) { setCollapsed(false); onChange('home') }
                    else onChange(id)
                  }}
                  className="flex flex-col items-center gap-1 rounded-3xl relative z-10"
                  style={{
                    flex: collapsed ? (isHome ? '0 0 46px' : '0 0 0px') : '1',
                    minWidth: 0,
                    overflow: 'hidden',
                    border: '1px solid transparent',
                    transition: `flex 0.55s ${SPRING}, padding 0.3s ease`,
                    paddingTop: 10,
                    paddingBottom: collapsed ? 10 : 10,
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive && !collapsed ? 2.5 : collapsed && isHome ? 2 : 1.5}
                    style={{
                      color: (isActive && !collapsed) ? ACCENT : (collapsed && isHome) ? ACCENT : 'var(--t3)',
                      transition: 'color 0.25s ease',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    color: isActive ? ACCENT : 'var(--t3)',
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 400,
                    whiteSpace: 'nowrap',
                    opacity: collapsed ? 0 : 1,
                    maxHeight: collapsed ? 0 : 14,
                    overflow: 'hidden',
                    transition: 'opacity 0.2s ease, color 0.25s ease, max-height 0.3s ease',
                  }}>
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
