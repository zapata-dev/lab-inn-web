import { Calculator, Cloud, GraduationCap, Heart, LayoutDashboard, Truck } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const mainItems = [
  { label: 'Inicio', to: '/inicio', icon: LayoutDashboard },
  { label: 'Inventario Nacional', to: '/inventario', icon: Truck },
  { label: 'Favoritos', to: '/favoritos', icon: Heart },
  { label: 'Herramientas Comerciales', to: '/herramientas', icon: Calculator },
  { label: 'Capacitacion y Soporte', to: '/capacitacion', icon: GraduationCap },
  { label: 'Salesforce', to: '/salesforce', icon: Cloud },
]

function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-full flex-col border-r border-lab-border bg-lab-surface p-4">
      <header className="mb-6 rounded-lab border border-lab-border bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lab-muted">LAB MVP</p>
        <p className="mt-1 text-sm font-medium text-lab-text">Navegacion principal</p>
      </header>

      <nav className="flex flex-col gap-1.5">
        {mainItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-lab-primary text-white shadow-sm'
                  : 'text-lab-text hover:bg-slate-100 hover:text-lab-primary',
              ].join(' ')
            }
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
