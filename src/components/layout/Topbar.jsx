import { CalendarDays, Play } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Badge } from '../common'
import { useAuth } from '../../context/AuthContext'
import { useDemo } from '../../context/DemoContext'
import UserMenu from './UserMenu'
import UserSwitcher from './UserSwitcher'

const titleByPath = {
  '/inicio': 'Inicio',
  '/inventario': 'Inventario Nacional',
  '/herramientas': 'Herramientas Comerciales',
  '/capacitacion': 'Capacitación y Soporte',
  '/soporte/usuarios': 'Soporte de usuarios',
  '/salesforce': 'Salesforce',
  '/perfil': 'Perfil',
}

function Topbar() {
  const location = useLocation()
  const { demoActive, start } = useDemo()
  const { isFirebaseMode: authFirebaseMode } = useAuth()
  const effectiveFirebaseMode = authFirebaseMode

  const pageTitle = titleByPath[location.pathname] ?? 'LAB MVP'
  const dateLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="border-b border-lab-border bg-lab-surface px-5 py-4 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-lab-text">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-lab-muted">
            <CalendarDays className="size-4" aria-hidden="true" />
            {dateLabel}
            {!effectiveFirebaseMode ? <Badge variant="demo">Modo demo</Badge> : null}
            {!effectiveFirebaseMode && !demoActive ? (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-1 rounded-md border border-lab-primary px-2 py-0.5 text-xs font-semibold text-lab-primary hover:bg-lab-primary/5"
              >
                <Play className="size-3" aria-hidden="true" />
                Demo guiada
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {!effectiveFirebaseMode ? <UserSwitcher /> : null}
          <UserMenu variant="compact" className="lg:hidden" />
        </div>
      </div>
    </header>
  )
}

export default Topbar
