import { Navigate, useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import { firebaseConfigError, isFirebaseConfigured } from '../services/firebase'
import { getAllowedDomain } from '../utils/authDomain'

const AUTHORIZATION_CODES = new Set([
  'auth/user-not-allowed',
  'auth/user-inactive',
  'auth/invalid-role',
])

function Login() {
  const navigate = useNavigate()
  const {
    users,
    login,
    loginWithGoogle,
    isAuthenticated,
    isFirebaseMode,
    loading,
    error,
    authErrorCode,
    authEmail,
    clearError,
  } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />
  }

  const handleDemoLogin = (userId) => {
    const success = login(userId)
    if (success) {
      navigate('/inicio', { replace: true })
    }
  }

  const handleFirebaseLogin = async () => {
    clearError()
    const result = await loginWithGoogle()

    if (result.success) {
      navigate('/inicio', { replace: true })
      return
    }

    if (AUTHORIZATION_CODES.has(result.code)) {
      navigate('/unauthorized', { replace: true, state: { email: authEmail } })
    }
  }

  const authorizationHelp =
    authErrorCode === 'auth/user-not-allowed'
      ? 'Tu cuenta no esta dada de alta en Firestore (usuarios/{uid}).'
      : authErrorCode === 'auth/user-inactive'
        ? 'Tu usuario existe, pero esta inactivo. Contacta a soporte.'
        : authErrorCode === 'auth/invalid-role'
          ? 'Tu usuario tiene un rol invalido. Solo vendedor, coordinador o soporte.'
          : ''

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-2">
          <Badge variant={isFirebaseMode ? 'info' : 'demo'}>
            {isFirebaseMode ? 'Modo Firebase' : 'Modo demo'}
          </Badge>
          <h1 className="text-3xl font-bold text-lab-text">LAB MVP</h1>
          {isFirebaseMode ? (
            <p className="text-sm text-lab-muted">Solo cuentas @{getAllowedDomain()} autorizadas.</p>
          ) : (
            <p className="text-sm text-lab-muted">Selecciona un perfil demo</p>
          )}
        </header>

        {isFirebaseMode ? (
          <Card className="mx-auto w-full max-w-lg space-y-4">
            {!isFirebaseConfigured && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {firebaseConfigError || 'Firebase no esta configurado. Revisa variables VITE_FIREBASE_*.'}
              </p>
            )}

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            )}

            {authorizationHelp && (
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                {authorizationHelp}
              </p>
            )}

            <button
              type="button"
              onClick={handleFirebaseLogin}
              disabled={loading || !isFirebaseConfigured}
              className="w-full rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Conectando con Google...' : 'Entrar con Google Zapata'}
            </button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((demoUser) => (
              <Card key={demoUser.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex size-10 items-center justify-center rounded-full bg-lab-primary/10 font-semibold text-lab-primary">
                    {demoUser.avatar}
                  </div>
                  <Badge variant="info">{demoUser.roleLabel}</Badge>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-lab-text">{demoUser.name}</h2>
                  <p className="text-sm text-lab-muted">{demoUser.position}</p>
                  <p className="text-xs text-slate-500">{demoUser.branchName}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDemoLogin(demoUser.id)}
                  className="w-full rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Entrar como {demoUser.roleLabel}
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Login
