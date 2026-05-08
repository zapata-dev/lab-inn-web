import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CircleDollarSign, ShieldAlert, UsersRound, Workflow } from 'lucide-react'
import { Badge, Card, StatusBadge } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../services/dataService'
import { formatNumber, formatPercent, formatUSD } from '../../utils/formatters'
import { filterByScope } from '../../utils/scopeFilters'
import { computeOverall } from '../../utils/progressUtils'
import { computeTrafficLight } from '../../utils/trafficLightUtils'
import AlertBanner from './components/AlertBanner'
import FunnelMiniChart from './components/FunnelMiniChart'
import MetricCard from './components/MetricCard'
import RiskUsersList from './components/RiskUsersList'

function ManagerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    users: [],
    progress: [],
    leads: [],
    opportunities: [],
    orders: [],
    invoices: [],
    tickets: [],
  })

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      if (!user?.id) {
        return
      }

      try {
        setLoading(true)
        setError('')

        const [users, progress, leads, opportunities, orders, invoices, support] = await Promise.all([
          dataService.getUsers(),
          dataService.getProgress(),
          dataService.getLeads(),
          dataService.getOpportunities(),
          dataService.getOrders(),
          dataService.getInvoices(),
          dataService.getSupport(),
        ])

        if (!isActive) {
          return
        }

        setData({
          users,
          progress,
          leads,
          opportunities,
          orders,
          invoices,
          tickets: support?.tickets ?? [],
        })
      } catch (loadError) {
        if (isActive) {
          setError(loadError?.message ?? 'No fue posible cargar la vista gerente.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [user])

  const computed = useMemo(() => {
    const branchLeads = filterByScope(data.leads, user?.role, user)
    const branchOpportunities = filterByScope(data.opportunities, user?.role, user)
    const branchOrders = filterByScope(data.orders, user?.role, user)
    const branchInvoices = filterByScope(data.invoices, user?.role, user)
    const branchTickets = filterByScope(data.tickets, user?.role, user)
    const teamUsers = data.users.filter(
      (candidate) => candidate.branchId === user?.branchId && !['admin', 'direccion'].includes(candidate.role)
    )

    const progressByUser = Object.fromEntries(data.progress.map((entry) => [entry.userId, entry]))
    const riskUsers = teamUsers.filter((teamUser) => {
      const overall = computeOverall(progressByUser[teamUser.id] ?? {})
      return computeTrafficLight(overall) === 'rojo'
    })

    const openTickets = branchTickets.filter((ticket) => ticket.status !== 'resuelto')
    const pipelineUsd = branchOpportunities.reduce(
      (total, opportunity) => total + (Number(opportunity.amountUsd) || 0),
      0
    )
    const conversionToOrder =
      branchOpportunities.length > 0 ? (branchOrders.length / branchOpportunities.length) * 100 : 0

    return {
      teamUsers,
      progressByUser,
      riskUsers,
      branchLeads,
      branchOpportunities,
      branchOrders,
      branchInvoices,
      openTickets,
      pipelineUsd,
      conversionToOrder,
    }
  }, [data, user])

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Vista Gerente</h2>
          <p className="text-sm text-lab-muted">Cargando datos de sucursal...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <AlertBanner title="Error en vista gerente" description={error} variant="danger" />
      </section>
    )
  }

  const alertVariant = computed.riskUsers.length > 0 ? 'danger' : 'success'
  const alertDescription =
    computed.riskUsers.length > 0
      ? `Detectamos ${computed.riskUsers.length} usuarios en rojo. Priorizar coaching esta semana.`
      : 'No hay usuarios en rojo. El equipo mantiene avance saludable.'

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-lab-text">Vista Gerente - {user?.branchName}</h2>
            <p className="text-sm text-lab-muted">Seguimiento de equipo y conversion comercial de sucursal.</p>
          </div>
          <StatusBadge status={computed.riskUsers.length > 0 ? 'rojo' : 'verde'} />
        </div>
        <AlertBanner title="Riesgo de equipo" description={alertDescription} variant={alertVariant} />
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Equipo activo"
          value={formatNumber(computed.teamUsers.length)}
          description="Integrantes comerciales en sucursal"
          icon={UsersRound}
          tone="info"
        />
        <MetricCard
          title="Usuarios en riesgo"
          value={formatNumber(computed.riskUsers.length)}
          description="Semaforo rojo en avance"
          icon={AlertTriangle}
          tone={computed.riskUsers.length > 0 ? 'danger' : 'success'}
        />
        <MetricCard
          title="Leads sucursal"
          value={formatNumber(computed.branchLeads.length)}
          description="Leads visibles por alcance gerente"
          icon={Workflow}
          tone="default"
        />
        <MetricCard
          title="Conversion OPP->PED"
          value={formatPercent(computed.conversionToOrder)}
          description="Relacion entre oportunidades y pedidos"
          icon={CircleDollarSign}
          tone="warning"
        />
        <MetricCard
          title="Tickets abiertos"
          value={formatNumber(computed.openTickets.length)}
          description={`Pipeline ${formatUSD(computed.pipelineUsd)}`}
          icon={ShieldAlert}
          tone={computed.openTickets.length > 0 ? 'warning' : 'success'}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RiskUsersList users={computed.teamUsers} progressByUser={computed.progressByUser} maxItems={6} />
        <FunnelMiniChart
          title="Embudo sucursal"
          leads={computed.branchLeads}
          opportunities={computed.branchOpportunities}
          orders={computed.branchOrders}
          invoices={computed.branchInvoices}
        />
      </section>
      <div className="flex justify-end">
        <Badge variant="info">Tickets abiertos: {computed.openTickets.length}</Badge>
      </div>
    </section>
  )
}

export default ManagerDashboard
