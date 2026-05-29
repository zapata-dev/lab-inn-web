import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'

const AUTH_ERROR_MESSAGES = Object.freeze({
  'firebase-not-configured': 'Firebase no esta configurado. Revisa .env.local.',
  'authorization/domain-not-allowed': 'Solo se permite acceso con correo @zapata.com.mx.',
  'authorization/user-not-found':
    'Tu cuenta de Google es valida, pero no existe en usuarios/{uid}. Contacta a soporte.',
  'authorization/user-inactive': 'Tu cuenta existe pero esta inactiva. Solicita activacion.',
  'authorization/role-invalid': 'Tu cuenta tiene un rol no permitido para LAB.',
  'authorization/permission-denied':
    'No fue posible validar tu acceso en Firestore (permission-denied). Contacta a soporte.',
  'authorization/validation-timeout':
    'La validacion de acceso tardo demasiado. Revisa tu conexion e intenta de nuevo.',
  'authorization/unknown': 'No fue posible validar tu acceso. Intenta de nuevo.',
})

function Login() {
  const navigate = useNavigate()
  const {
    users,
    login,
    isAuthenticated,
    isFirebaseMode,
    loginWithGoogle,
    authErrorCode,
    error,
    clearError,
    loading,
  } = useAuth()

  const errorMessage = useMemo(() => {
    if (!authErrorCode) return ''
    return AUTH_ERROR_MESSAGES[authErrorCode] ?? error?.message ?? AUTH_ERROR_MESSAGES['authorization/unknown']
  }, [authErrorCode, error?.message])

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleDemoLogin = (userId) => {
    clearError()
    const success = login(userId)
    if (success) {
      navigate('/', { replace: true })
    }
  }

  const handleFirebaseLogin = async () => {
    clearError()

    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch (loginError) {
      // El error se maneja en AuthContext para centralizar codigos de autorizacion.
    }
  }

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-2">
          <Badge variant="demo">{isFirebaseMode ? 'Modo firebase' : 'Modo demo'}</Badge>
          <h1 className="text-3xl font-bold text-lab-text">LAB MVP</h1>
          <p className="text-sm text-lab-muted">
            {isFirebaseMode ? 'Inicia sesion con Google Zapata' : 'Selecciona un perfil demo'}
          </p>
        </header>

        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {isFirebaseMode ? (
          <Card className="mx-auto max-w-md space-y-4 p-6">
            <h2 className="text-lg font-semibold text-lab-text">Acceso con Google</h2>
            <p className="text-sm text-lab-muted">
              Usa tu cuenta corporativa para autenticarte y validar autorizacion por Firestore.
            </p>
            <button
              type="button"
              onClick={handleFirebaseLogin}
              disabled={loading}
              className="w-full rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Validando acceso...' : 'Entrar con Google Zapata'}
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
