import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Unauthorized() {
  const navigate = useNavigate()
  const { authErrorCode, error, logout, isFirebaseMode } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl border border-lab-border bg-white p-8 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-lab-text">Acceso no autorizado</h1>
          <p className="text-sm text-lab-muted">
            Tu cuenta de Google es valida, pero todavia no esta autorizada para usar LAB.
          </p>
        </header>

        {authErrorCode ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Codigo: {authErrorCode}
            {error?.message ? ` - ${error.message}` : ''}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
          >
            Volver a login
          </button>

          {isFirebaseMode ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Cerrar sesion
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default Unauthorized