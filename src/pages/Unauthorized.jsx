import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Unauthorized() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authEmail, error, logout } = useAuth()

  const emailFromState = location.state?.email
  const visibleEmail = emailFromState || authEmail

  const handleBackToLogin = () => {
    navigate('/login', { replace: true })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-lab-bg px-5 py-8 md:px-8">
      <section className="w-full max-w-xl rounded-2xl border border-lab-border bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-lab-text">Acceso no autorizado</h1>
        <p className="mt-3 text-sm text-lab-muted">
          Tu cuenta de Google es valida, pero todavia no esta autorizada para usar LAB.
        </p>

        {visibleEmail ? (
          <p className="mt-3 rounded-lg border border-lab-border bg-lab-bg px-3 py-2 text-xs text-lab-text">
            Cuenta detectada: <span className="font-semibold">{visibleEmail}</span>
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
        ) : null}

        <p className="mt-4 text-sm text-lab-muted">
          Pide a soporte que cree tu usuario en Firestore dentro de <code>usuarios/{'{uid}'}</code>.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
          >
            Volver al login
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Cerrar sesion
          </button>
        </div>
      </section>
    </main>
  )
}

export default Unauthorized
