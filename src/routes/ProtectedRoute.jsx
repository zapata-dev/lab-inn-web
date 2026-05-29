import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AUTHORIZATION_CODES = new Set([
  'authorization/domain-not-allowed',
  'authorization/user-not-found',
  'authorization/user-inactive',
  'authorization/role-invalid',
])

function ProtectedRoute({ children }) {
  const { user, loading, authErrorCode } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-lab-bg px-4">
        <p className="text-sm font-medium text-lab-muted">Validando acceso...</p>
      </main>
    )
  }

  if (!user && authErrorCode && AUTHORIZATION_CODES.has(authErrorCode)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (children) {
    return children
  }

  return <Outlet />
}

export default ProtectedRoute