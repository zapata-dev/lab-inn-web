import { useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import { resetDemo } from '../services/storage'

function Perfil() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = () => {
    toast.info('Sesion cerrada')
    logout()
    navigate('/login', { replace: true })
  }

  const handleResetDemo = () => {
    const confirmed = window.confirm(
      'Esto limpiara los datos demo guardados en lab:v1:* y cerrara tu sesion. Continuar?'
    )
    if (!confirmed) {
      return
    }

    resetDemo()
    logout()
    toast.warning('Demo reseteada')
    navigate('/login', { replace: true })
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="space-y-3">
        <h2 className="text-2xl font-bold text-lab-text">Perfil</h2>
        <p className="text-sm text-lab-muted">Placeholder Sprint 1 - gestion de sesion demo.</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="success">{user?.name}</Badge>
          <Badge variant="info">{user?.roleLabel}</Badge>
          <Badge>{user?.email}</Badge>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-lab-text">Acciones</h3>
        <p className="text-sm text-lab-muted">Resetear demo limpia las claves guardadas bajo el namespace `lab:v1:*`.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Cerrar sesion
          </button>
          <button
            type="button"
            onClick={handleResetDemo}
            className="rounded-lg border border-lab-border bg-white px-4 py-2 text-sm font-semibold text-lab-text transition hover:bg-slate-50"
          >
            Resetear demo
          </button>
        </div>
      </Card>
    </section>
  )
}

export default Perfil
