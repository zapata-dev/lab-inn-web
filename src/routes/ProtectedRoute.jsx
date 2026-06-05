import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AUTH_PUBLIC_ERROR_CODES } from '../utils/authMessages'

const AUTHORIZATION_CODES = new Set([
  AUTH_PUBLIC_ERROR_CODES.ACCESS,
  AUTH_PUBLIC_ERROR_CODES.PENDING,
  AUTH_PUBLIC_ERROR_CODES.DISABLED,
  AUTH_PUBLIC_ERROR_CODES.NETWORK,
  AUTH_PUBLIC_ERROR_CODES.UNKNOWN,
])

function normalizeRole(role) {
  return String(role ?? '').trim().toLowerCase()
}

function hasAllowedRole(user, allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true

  const normalizedRole = normalizeRole(user?.rol || user?.role)
  if (!normalizedRole) return false

  return allowedRoles.some((role) => normalizeRole(role) === normalizedRole)
}

function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const { user, authIdentity, loading, authErrorCode, logout } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-lab-bg px-4">
        <p className="text-sm font-medium text-lab-muted">Validando acceso...</p>
      </main>
    )
  }

  if (!user && authIdentity?.uid && authErrorCode && AUTHORIZATION_CODES.has(authErrorCode)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasAllowedRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  const handleLogout = async () => {
    setLogoutError('')
    setLoggingOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error?.message || 'No fue posible cerrar sesion. Intenta de nuevo.')
    } finally {
      setLoggingOut(false)
    }
  }

  const content = children || <Outlet />

  if (children) {
    return (
      <>
        {content}
        <div className="fixed right-3 top-3 z-50 flex flex-col items-end gap-2">
          {logoutError ? (
            <p className="max-w-xs rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 shadow-sm">
              {logoutError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            {loggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {content}
      <div className="fixed right-3 top-3 z-50 flex flex-col items-end gap-2">
        {logoutError ? (
          <p className="max-w-xs rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 shadow-sm">
            {logoutError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
          {loggingOut ? 'Saliendo...' : 'Salir'}
        </button>
      </div>
    </>
  )
}

export default ProtectedRoute
