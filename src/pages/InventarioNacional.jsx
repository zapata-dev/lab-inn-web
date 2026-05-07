import { Link } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'

function InventarioNacional() {
  const { user } = useAuth()

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="space-y-3">
        <h2 className="text-2xl font-bold text-lab-text">Inventario Nacional</h2>
        <p className="text-sm text-lab-muted">Placeholder Sprint 1 - modulo de inventario pendiente.</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="success">{user?.name}</Badge>
          <Badge variant="info">{user?.roleLabel}</Badge>
        </div>
      </Card>
      <Link className="inline-flex rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white" to="/inicio">
        Volver a Inicio
      </Link>
    </section>
  )
}

export default InventarioNacional
