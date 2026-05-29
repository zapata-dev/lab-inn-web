import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AUTHORIZATION_ROUTE_ERROR_CODES = new Set([
  'auth/user-not-allowed',
  'auth/user-inactive',
  'auth/invalid-role',
])

function ProtectedRoute({ children }) {
  const { user, loading, authErrorCode, authEmail, isFirebaseMode } = useAuth()

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-lab-bg px-6">
        <p className="text-sm font-medium text-lab-muted">Validando sesion...</p>
      </main>
    )
  }

  if (!user) {
    if (isFirebaseMode && AUTHORIZATION_ROUTE_ERROR_CODES.has(authErrorCode)) {
      return <Navigate to="/unauthorized" replace state={{ email: authEmail }} />
    }

    return <Navigate to="/login" replace />
  }

  if (children) {
    return children
  }

  return <Outlet />
}

export default ProtectedRoute
