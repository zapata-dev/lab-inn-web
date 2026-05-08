import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import SalesDashboard from '../features/dashboard/SalesDashboard'
import { getDashboardVariant } from '../utils/roleConfig'

function Inicio() {
  const { user } = useAuth()
  const dashboardVariant = getDashboardVariant(user?.role)

  if (dashboardVariant === 'sales') {
    return <SalesDashboard />
  }

  let pendingMessage = 'Dashboard de este rol pendiente LAB-010'

  if (dashboardVariant === 'executive') {
    pendingMessage = 'Dashboard ejecutivo pendiente LAB-010'
  } else if (dashboardVariant === 'manager') {
    pendingMessage = 'Dashboard gerente pendiente LAB-010'
  } else if (dashboardVariant === 'bdcLab' || dashboardVariant === 'bdcSucursal') {
    pendingMessage = 'Dashboard BDC pendiente LAB-010'
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-5">
      <Card className="space-y-3">
        <h2 className="text-2xl font-bold text-lab-text">Inicio</h2>
        <p className="text-sm text-lab-muted">{pendingMessage}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="success">{user?.name}</Badge>
          <Badge variant="info">{user?.roleLabel}</Badge>
          <Badge>{user?.branchName}</Badge>
          <Badge variant="demo">Variant {dashboardVariant || 'sin definir'}</Badge>
        </div>
      </Card>
    </section>
  )
}

export default Inicio
