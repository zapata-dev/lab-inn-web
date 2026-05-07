import { Calculator, Cloud, GraduationCap, LayoutDashboard, Truck } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const mobileItems = [
  { label: 'Inicio', to: '/inicio', icon: LayoutDashboard },
  { label: 'Inventario', to: '/inventario', icon: Truck },
  { label: 'Herramientas', to: '/herramientas', icon: Calculator },
  { label: 'Capacitacion', to: '/capacitacion', icon: GraduationCap },
  { label: 'Salesforce', to: '/salesforce', icon: Cloud },
]

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-lab-border bg-lab-surface lg:hidden">
      {mobileItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition',
              isActive ? 'text-lab-primary' : 'text-lab-muted hover:text-lab-text',
            ].join(' ')
          }
        >
          <Icon className="size-4" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
