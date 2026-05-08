import { CalendarDays, LogOut, Play, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../common'
import { useAuth } from '../../context/AuthContext'
import { useDemo } from '../../context/DemoContext'
import useToast from '../../hooks/useToast'
import UserSwitcher from './UserSwitcher'

const titleByPath = {
  '/inicio': 'Inicio',
  '/inventario': 'Inventario Nacional',
  '/herramientas': 'Herramientas Comerciales',
  '/capacitacion': 'Capacitacion y Soporte',
  '/salesforce': 'Salesforce',
  '/perfil': 'Perfil',
}

function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const { demoActive, start } = useDemo()

  const pageTitle = titleByPath[location.pathname] ?? 'LAB MVP'
  const dateLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleLogout = () => {
    toast.info('Sesion cerrada')
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-lab-border bg-lab-surface px-5 py-4 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-lab-text">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-lab-muted">
            <CalendarDays className="size-4" aria-hidden="true" />
            {dateLabel}
            <Badge variant="demo">Modo demo</Badge>
            {!demoActive && (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-1 rounded-md border border-lab-primary px-2 py-0.5 text-xs font-semibold text-lab-primary hover:bg-lab-primary/5"
              >
                <Play className="size-3" aria-hidden="true" />
                Demo guiada
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <UserSwitcher />

          <Link
            to="/perfil"
            className="inline-flex items-center gap-2 rounded-lg border border-lab-border bg-white px-3 py-1.5 text-xs font-medium text-lab-text hover:bg-slate-50"
          >
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-lab-primary/10 text-lab-primary">
              {user?.avatar || <User className="size-3.5" />}
            </span>
            <span className="max-w-36 truncate">{user?.name}</span>
            <span className="hidden text-lab-muted md:inline">| {user?.roleLabel}</span>
            <span className="hidden text-lab-muted lg:inline">| {user?.branchName}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}

export default Topbar
