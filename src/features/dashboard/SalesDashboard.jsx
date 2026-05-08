import { useEffect, useMemo, useState } from 'react'
import { Activity, Briefcase, CircleDollarSign, ClipboardList, UserRound } from 'lucide-react'
import { Badge, Card, DonutChart, ProgressBar, StatusBadge } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../services/dataService'
import { computeOverall } from '../../utils/progressUtils'
import { formatNumber, formatUSD } from '../../utils/formatters'
import { filterByScope } from '../../utils/scopeFilters'
import { computeTrafficLight, getTrafficLightMeta } from '../../utils/trafficLightUtils'
import AlertBanner from './components/AlertBanner'
import MetricCard from './components/MetricCard'
import PendingTasksList from './components/PendingTasksList'

const DAYS_TO_FLAG_OVERDUE = 7

const getDaysSinceDate = (dateValue) => {
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) {
    return 0
  }

  const now = new Date()
  return Math.floor((now - parsedDate) / 86400000)
}

function SalesDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState({
    progress: null,
    leads: [],
    opportunities: [],
    supportTickets: [],
  })

  useEffect(() => {
    let isActive = true

    const loadDashboardData = async () => {
      if (!user?.id) {
        return
      }

      try {
        setLoading(true)
        setError('')

        const [progress, leads, opportunities, support] = await Promise.all([
          dataService.getProgressByUser(user.id),
          dataService.getLeads(),
          dataService.getOpportunities(),
          dataService.getSupport(),
        ])

        if (!isActive) {
          return
        }

        setDashboardData({
          progress,
          leads,
          opportunities,
          supportTickets: support?.tickets ?? [],
        })
      } catch (loadError) {
        if (isActive) {
          setError(loadError?.message ?? 'No fue posible cargar el dashboard.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isActive = false
    }
  }, [user])

  const computed = useMemo(() => {
    const progress = dashboardData.progress ?? {}
    const overall = computeOverall(progress)
    const leads = filterByScope(dashboardData.leads, user?.role, user)
    const opportunities = filterByScope(dashboardData.opportunities, user?.role, user)
    const tickets = filterByScope(dashboardData.supportTickets, user?.role, user)
    const pendingTasks = Array.isArray(progress.pendingTasks) ? progress.pendingTasks : []

    const openTickets = tickets.filter((ticket) => ticket.status !== 'resuelto')
    const overdueTickets = openTickets.filter((ticket) => getDaysSinceDate(ticket.createdAt) > DAYS_TO_FLAG_OVERDUE)

    const hasCriticalPending = pendingTasks.some((task) => task.priority === 'critica')
    const trafficStatus = computeTrafficLight(overall, {
      hasCriticalPending,
      overdueTickets: overdueTickets.length,
    })
    const trafficMeta = getTrafficLightMeta(trafficStatus)

    const pipelineUsd = opportunities.reduce((total, opportunity) => total + (Number(opportunity.amountUsd) || 0), 0)

    return {
      progress,
      overall,
      leadsCount: leads.length,
      opportunitiesCount: opportunities.length,
      pipelineUsd,
      openTicketsCount: openTickets.length,
      pendingTasks,
      trafficStatus,
      trafficMeta,
    }
  }, [dashboardData, user])

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Inicio</h2>
          <p className="text-sm text-lab-muted">Cargando dashboard comercial...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <AlertBanner
          title="No pudimos cargar el dashboard"
          description={error}
          variant="danger"
          actionLabel="Intentar de nuevo"
          onAction={() => window.location.reload()}
        />
      </section>
    )
  }

  const alertVariant =
    computed.overall >= 80 ? 'success' : computed.overall >= 50 ? 'warning' : 'danger'

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Hola, {user?.name?.split(' ')[0] ?? 'equipo'}</h2>
            <p className="text-sm text-lab-muted">
              {user?.roleLabel} | {user?.branchName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={computed.trafficStatus} label={computed.trafficMeta.label} />
            <Badge variant="info">Avance {computed.overall}%</Badge>
          </div>
        </div>

        <AlertBanner
          variant={alertVariant}
          title={`Semaforo ${computed.trafficMeta.label}`}
          description={computed.trafficMeta.description}
        />
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Leads activos"
          value={formatNumber(computed.leadsCount)}
          description="Leads visibles por tu alcance"
          icon={UserRound}
          tone="info"
        />
        <MetricCard
          title="Oportunidades"
          value={formatNumber(computed.opportunitiesCount)}
          description="Oportunidades en tu pipeline"
          icon={Briefcase}
          tone="default"
        />
        <MetricCard
          title="Pipeline USD"
          value={formatUSD(computed.pipelineUsd)}
          description="Monto estimado de cierre"
          icon={CircleDollarSign}
          tone="success"
        />
        <MetricCard
          title="Tickets abiertos"
          value={formatNumber(computed.openTicketsCount)}
          description="Incidencias pendientes de soporte"
          icon={ClipboardList}
          tone={computed.openTicketsCount > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Avance general"
          value={`${computed.overall}%`}
          description="Promedio ponderado de progreso"
          icon={Activity}
          tone={alertVariant}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-5">
          <h3 className="text-base font-semibold text-lab-text">Progreso comercial</h3>
          <ProgressBar value={computed.overall} label="Avance ponderado" />
          <div className="pt-2">
            <DonutChart value={computed.overall} label="Estado global" />
          </div>
        </Card>

        <PendingTasksList tasks={computed.pendingTasks} />
      </section>
    </section>
  )
}

export default SalesDashboard

