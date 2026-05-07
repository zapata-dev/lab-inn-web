import { Link } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'

function Inicio() {
  const { user } = useAuth()

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="space-y-3">
        <h2 className="text-2xl font-bold text-lab-text">Inicio</h2>
        <p className="text-sm text-lab-muted">Placeholder Sprint 1 - autenticacion y persistencia base.</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="success">{user?.name}</Badge>
          <Badge variant="info">{user?.roleLabel}</Badge>
          <Badge>{user?.branchName}</Badge>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-lab-text">Navegacion demo</h3>
        <nav className="flex flex-wrap gap-2">
          <Link className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-lab-text ring-1 ring-slate-200" to="/inventario">
            Inventario
          </Link>
          <Link className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-lab-text ring-1 ring-slate-200" to="/herramientas">
            Herramientas
          </Link>
          <Link className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-lab-text ring-1 ring-slate-200" to="/capacitacion">
            Capacitacion
          </Link>
          <Link className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-lab-text ring-1 ring-slate-200" to="/salesforce">
            Salesforce
          </Link>
          <Link className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-lab-text ring-1 ring-slate-200" to="/perfil">
            Perfil
          </Link>
        </nav>
      </Card>
    </section>
  )
}

export default Inicio
