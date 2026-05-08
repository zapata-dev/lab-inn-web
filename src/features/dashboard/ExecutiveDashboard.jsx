import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Building2, CircleDollarSign, ShieldAlert, UsersRound } from 'lucide-react'
import { Badge, Card } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../services/dataService'
import { computeOverall } from '../../utils/progressUtils'
import { computeTrafficLight } from '../../utils/trafficLightUtils'
import { formatNumber, formatUSD } from '../../utils/formatters'
import { canEdit } from '../../utils/roleConfig'
import AlertBanner from './components/AlertBanner'
import BranchProgressList from './components/BranchProgressList'
import FunnelMiniChart from './components/FunnelMiniChart'
import MetricCard from './components/MetricCard'
import RiskUsersList from './components/RiskUsersList'

function ExecutiveDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    branches: [],
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

        const [branches, users, progress, leads, opportunities, orders, invoices, support] = await Promise.all([
          dataService.getBranches(),
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
          branches,
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
          setError(loadError?.message ?? 'No fue posible cargar la vista ejecutiva.')
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
    const progressByUser = Object.fromEntries(data.progress.map((entry) => [entry.userId, entry]))

    const riskUsers = data.users.filter((candidate) => {
      const overall = computeOverall(progressByUser[candidate.id] ?? {})
      return computeTrafficLight(overall) === 'rojo'
    })

    const openTickets = data.tickets.filter((ticket) => ticket.status !== 'resuelto')
    const criticalOpenTickets = openTickets.filter((ticket) => ticket.priority === 'critica')

    const pipelineUsd = data.opportunities.reduce(
      (total, opportunity) => total + (Number(opportunity.amountUsd) || 0),
      0
    )
    const conversionToOrder =
      data.opportunities.length > 0 ? (data.orders.length / data.opportunities.length) * 100 : 0
    const hasFunnelLeak = data.opportunities.length > 0 && conversionToOrder < 40

    return {
      progressByUser,
      riskUsers,
      openTickets,
      criticalOpenTickets,
      pipelineUsd,
      conversionToOrder,
      hasFunnelLeak,
    }
  }, [data])

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Vista ejecutiva</h2>
          <p className="text-sm text-lab-muted">Cargando indicadores nacionales...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <AlertBanner title="Error en vista ejecutiva" description={error} variant="danger" />
      </section>
    )
  }

  const alertVariant =
    computed.criticalOpenTickets.length > 0
      ? 'danger'
      : computed.riskUsers.length > 0 || computed.hasFunnelLeak
        ? 'warning'
        : 'success'

  const headerTitle = user?.role === 'admin' ? 'Vista Admin LAB' : 'Vista Direccion Nacional'

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-lab-text">{headerTitle}</h2>
            <p className="text-sm text-lab-muted">KPIs nacionales, progreso por sucursal y alertas criticas.</p>
          </div>
          <Badge variant={canEdit(user?.role) ? 'success' : 'warning'}>
            {canEdit(user?.role) ? 'CanEdit habilitado' : 'Modo lectura'}
          </Badge>
        </div>
        <AlertBanner
          variant={alertVariant}
          title="Resumen de riesgo nacional"
          description={`Rojos: ${computed.riskUsers.length} | Tickets criticos: ${computed.criticalOpenTickets.length} | Conversion OPP->PED: ${Math.round(computed.conversionToOrder)}%`}
        />
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Sucursales"
          value={formatNumber(data.branches.length)}
          description="Cobertura nacional activa"
          icon={Building2}
          tone="info"
        />
        <MetricCard
          title="Usuarios activos"
          value={formatNumber(data.users.length)}
          description="Perfiles demo en operacion"
          icon={UsersRound}
          tone="default"
        />
        <MetricCard
          title="Leads nacionales"
          value={formatNumber(data.leads.length)}
          description="Demanda comercial total"
          icon={AlertTriangle}
          tone="default"
        />
        <MetricCard
          title="Pipeline USD"
          value={formatUSD(computed.pipelineUsd)}
          description="Monto nacional de oportunidades"
          icon={CircleDollarSign}
          tone="success"
        />
        <MetricCard
          title="Tickets abiertos"
          value={formatNumber(computed.openTickets.length)}
          description={`Criticos: ${computed.criticalOpenTickets.length}`}
          icon={ShieldAlert}
          tone={computed.criticalOpenTickets.length > 0 ? 'danger' : 'warning'}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1.2fr]">
        <BranchProgressList branches={data.branches} users={data.users} progress={data.progress} />
        <FunnelMiniChart
          title="Embudo global"
          leads={data.leads}
          opportunities={data.opportunities}
          orders={data.orders}
          invoices={data.invoices}
        />
      </section>

      <RiskUsersList users={data.users} progressByUser={computed.progressByUser} maxItems={8} />
    </section>
  )
}

export default ExecutiveDashboard
