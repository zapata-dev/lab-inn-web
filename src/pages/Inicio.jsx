import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import BdcDashboardStub from '../features/dashboard/BdcDashboardStub'
import ExecutiveDashboard from '../features/dashboard/ExecutiveDashboard'
import ManagerDashboard from '../features/dashboard/ManagerDashboard'
import SalesDashboard from '../features/dashboard/SalesDashboard'
import { getDashboardVariant } from '../utils/roleConfig'

function Inicio() {
  const { user } = useAuth()
  const dashboardVariant = getDashboardVariant(user?.role)

  if (dashboardVariant === 'sales') {
    return <SalesDashboard />
  }
  if (dashboardVariant === 'manager') {
    return <ManagerDashboard />
  }
  if (dashboardVariant === 'executive') {
    return <ExecutiveDashboard />
  }
  if (dashboardVariant === 'bdcLab') {
    return <BdcDashboardStub variant="lab" />
  }
  if (dashboardVariant === 'bdcSucursal') {
    return <BdcDashboardStub variant="sucursal" />
  }

  const pendingMessage = 'No encontramos una vista para este rol. Validar configuracion en roleConfig.'

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
