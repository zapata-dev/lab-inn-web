import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import { AUTH_PUBLIC_ERROR_CODES, getPublicAuthMessage } from '../utils/authMessages'

const AUTHORIZATION_CODES = new Set([
  AUTH_PUBLIC_ERROR_CODES.ACCESS,
  AUTH_PUBLIC_ERROR_CODES.PENDING,
  AUTH_PUBLIC_ERROR_CODES.DISABLED,
  AUTH_PUBLIC_ERROR_CODES.NETWORK,
  AUTH_PUBLIC_ERROR_CODES.UNKNOWN,
])

const LOGIN_FAILURE_CODES = new Set([
  AUTH_PUBLIC_ERROR_CODES.DOMAIN,
  AUTH_PUBLIC_ERROR_CODES.POPUP,
  AUTH_PUBLIC_ERROR_CODES.NETWORK,
  AUTH_PUBLIC_ERROR_CODES.UNKNOWN,
])

function Login() {
  const navigate = useNavigate()
  const {
    users,
    login,
    isAuthenticated,
    isFirebaseMode,
    loginWithGoogle,
    user,
    authIdentity,
    authErrorCode,
    authConfigBlocked,
    error,
    clearError,
    loading,
  } = useAuth()
  const [googleLoginPending, setGoogleLoginPending] = useState(false)

  const errorMessage = useMemo(() => {
    const source = authErrorCode || error
    return source ? getPublicAuthMessage(source) : ''
  }, [authErrorCode, error])

  const loginHintMessage = useMemo(() => {
    if (!authErrorCode) return ''
    if (!LOGIN_FAILURE_CODES.has(authErrorCode)) return ''

    return 'No pudimos completar el inicio de sesion con Google. Revisa que el dominio este autorizado o intenta de nuevo.'
  }, [authErrorCode])

  useEffect(() => {
    if (loading) return

    if (authIdentity?.uid && !user && authErrorCode && AUTHORIZATION_CODES.has(authErrorCode)) {
      navigate('/unauthorized', { replace: true })
    }
  }, [authErrorCode, authIdentity?.uid, loading, navigate, user])

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const isAuthConfigBlocked = Boolean(authConfigBlocked || authErrorCode === 'AUTH-CONFIG')
  const visibleErrorMessage = loginHintMessage || errorMessage

  const handleDemoLogin = (userId) => {
    clearError()
    const success = login(userId)
    if (success) {
      navigate('/', { replace: true })
    }
  }

  const handleFirebaseLogin = async () => {
    clearError()
    setGoogleLoginPending(true)

    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch {
      // El error se maneja en AuthContext para mantener el login limpio.
    } finally {
      setGoogleLoginPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-2">
          <Badge variant={isAuthConfigBlocked ? 'danger' : isFirebaseMode ? 'info' : 'demo'}>
            {isAuthConfigBlocked ? 'Acceso bloqueado' : isFirebaseMode ? 'Acceso con Google' : 'Modo demo'}
          </Badge>
          <h1 className="text-3xl font-bold text-lab-text">LAB MVP</h1>
          <p className="text-sm text-lab-muted">
            {isAuthConfigBlocked
              ? 'La configuracion de acceso no esta disponible. Contacta a soporte LAB.'
              : isFirebaseMode
                ? 'Inicia sesion con tu cuenta corporativa autorizada.'
                : 'Selecciona un perfil demo'}
          </p>
        </header>

        {isAuthConfigBlocked ? (
          <div role="alert" aria-live="polite" className="mx-auto max-w-md">
            <Card className="space-y-4 border-rose-200 bg-rose-50 p-6">
              <Badge variant="danger">Autenticacion bloqueada</Badge>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-lab-text">
                  La configuracion de acceso no esta disponible.
                </h2>
                <p className="text-sm text-lab-muted">
                  Contacta a soporte LAB para revisar la configuracion antes de publicar.
                </p>
              </div>
              <p className="rounded-lg border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700">
                Codigo: AUTH-CONFIG
              </p>
            </Card>
          </div>
        ) : visibleErrorMessage ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {visibleErrorMessage}
          </div>
        ) : null}

        {isFirebaseMode && !isAuthConfigBlocked ? (
          <Card className="mx-auto max-w-md space-y-4 p-6">
            <h2 className="text-lg font-semibold text-lab-text">Acceso con Google</h2>
            <p className="text-sm text-lab-muted">
              Usa tu cuenta corporativa autorizada para autenticarte en LAB.
            </p>
            <button
              type="button"
              onClick={handleFirebaseLogin}
              disabled={loading || googleLoginPending}
              className="w-full rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoginPending || loading ? 'Validando acceso...' : 'Entrar con Google Zapata'}
            </button>
          </Card>
        ) : null}

        {!isFirebaseMode && !isAuthConfigBlocked ? (
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
        ) : null}
      </section>
    </main>
  )
}

export default Login
