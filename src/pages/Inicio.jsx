import {
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  GraduationCap,
  LifeBuoy,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { Badge, Card } from '../components/common'
import { resultMetrics } from '../data/mockAccessLinks'
import { useAuth } from '../context/AuthContext'
import BdcDashboardStub from '../features/dashboard/BdcDashboardStub'
import ExecutiveDashboard from '../features/dashboard/ExecutiveDashboard'
import ManagerDashboard from '../features/dashboard/ManagerDashboard'
import SalesDashboard from '../features/dashboard/SalesDashboard'
import { getDashboardVariant } from '../utils/roleConfig'

const iconMap = {
  BadgeCheck,
  CircleDollarSign,
  GraduationCap,
  LifeBuoy,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
}

function Inicio() {
  const { user } = useAuth()
  const dashboardVariant = getDashboardVariant(user?.role)

  let dashboardView = null

  if (dashboardVariant === 'sales') {
    dashboardView = <SalesDashboard />
  } else if (dashboardVariant === 'manager') {
    dashboardView = <ManagerDashboard />
  } else if (dashboardVariant === 'executive') {
    dashboardView = <ExecutiveDashboard />
  } else if (dashboardVariant === 'bdcLab') {
    dashboardView = <BdcDashboardStub variant="lab" />
  } else if (dashboardVariant === 'bdcSucursal') {
    dashboardView = <BdcDashboardStub variant="sucursal" />
  } else {
    const pendingMessage =
      'No encontramos una vista para este rol. Validar configuración en roleConfig.'
    dashboardView = (
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

  return (
    <div className="space-y-6">
      {dashboardView}

      <section className="mx-auto w-full max-w-7xl space-y-4">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Mis Resultados</h2>
            <p className="text-sm text-lab-muted">
              Resumen comercial personal dentro de la simulación LAB.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {resultMetrics.map((metric) => {
              const Icon = iconMap[metric.icon] ?? BarChart3

              return (
                <article
                  key={metric.id}
                  className="rounded-lab border border-lab-border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-lab-text">{metric.value}</p>
                    </div>
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-lab-primary/10 text-lab-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-lab-muted">{metric.description}</p>
                </article>
              )
            })}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default Inicio
