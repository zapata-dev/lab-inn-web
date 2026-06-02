import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, LogOut, Settings2, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'

function getDisplayName(user) {
  return String(user?.nombre || user?.displayName || user?.name || user?.email || 'Usuario').trim()
}

function getDisplayRole(user) {
  const fromProfile = String(user?.roleLabel || '').trim()
  if (fromProfile) return fromProfile

  const normalizedRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  if (normalizedRole === 'soporte') return 'Soporte'
  if (normalizedRole === 'coordinador') return 'Coordinador'
  if (normalizedRole === 'vendedor') return 'Vendedor'
  return 'Sin rol'
}

function getDisplayBranch(user) {
  return String(user?.sucursalNombre || user?.sucursal || user?.branchName || 'Sin sucursal asignada').trim()
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'US'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function UserMenu({ variant = 'sidebar', className = '' }) {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)

  const displayName = getDisplayName(user)
  const displayRole = getDisplayRole(user)
  const displayBranch = getDisplayBranch(user)
  const initials = getInitials(displayName)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!user) return null

  const handleLogout = async () => {
    try {
      toast.info('Sesión cerrada')
      await logout()
      setOpen(false)
      navigate('/login', { replace: true })
    } catch {
      setOpen(false)
    }
  }

  const triggerClasses =
    variant === 'compact'
      ? 'inline-flex w-full items-center gap-2 rounded-xl border border-lab-border bg-white px-3 py-2 text-left shadow-sm transition hover:border-lab-primary/25 hover:bg-slate-50'
      : 'flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-lab-primary/25 hover:bg-white hover:shadow-md'

  const triggerContent =
    variant === 'compact' ? (
      <>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lab-primary via-sky-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-lab-primary/20">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{displayName}</span>
          <span className="block truncate text-xs text-slate-500">{displayRole}</span>
        </span>
      </>
    ) : (
      <>
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lab-primary via-sky-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-lab-primary/20">
          {initials}
        </span>
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block truncate text-sm font-semibold text-slate-900">{displayName}</span>
          <span className="block truncate text-xs text-slate-500">{displayRole}</span>
          <span className="block truncate text-xs text-slate-500">{displayBranch}</span>
        </span>
      </>
    )

  const menuPosition =
    variant === 'compact'
      ? 'right-0 top-full mt-3 w-[min(18rem,calc(100vw-1.5rem))]'
      : 'bottom-full left-0 mb-3 w-full'

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className={triggerClasses}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {triggerContent}
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {open ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
        </span>
      </button>

      {open ? (
        <div className={`absolute z-50 ${menuPosition}`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Menú de usuario
              </p>
              <p className="mt-1 text-sm text-slate-600">Acciones rápidas de tu cuenta.</p>
            </div>

            <div className="p-2">
              <Link
                to="/perfil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-lab-primary/10 hover:text-lab-primary"
                role="menuitem"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-lab-primary/10 text-lab-primary">
                  <UserRound className="size-4" aria-hidden="true" />
                </span>
                Mi perfil
              </Link>

              <button
                type="button"
                disabled
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition"
                aria-disabled="true"
                role="menuitem"
                title="Próximamente"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    <Settings2 className="size-4" aria-hidden="true" />
                  </span>
                  Configuración
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Próximamente
                </span>
              </button>

              <div className="my-2 h-px bg-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                role="menuitem"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <LogOut className="size-4" aria-hidden="true" />
                </span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UserMenu
