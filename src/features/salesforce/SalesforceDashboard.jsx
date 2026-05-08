import { DollarSign, Package, Target, Users } from 'lucide-react'
import MetricCard from '../dashboard/components/MetricCard'
import FunnelMiniChart from '../dashboard/components/FunnelMiniChart'
import { Card } from '../../components/common'
import { formatUSD } from '../../utils/formatters'

const oppStageConfig = {
  prospecto: { label: 'Prospecto', className: 'bg-slate-100 text-slate-700' },
  cotizacion: { label: 'Cotizacion', className: 'bg-blue-100 text-blue-700' },
  negociacion: { label: 'Negociacion', className: 'bg-amber-100 text-amber-700' },
  ganada: { label: 'Ganada', className: 'bg-emerald-100 text-emerald-700' },
  perdida: { label: 'Perdida', className: 'bg-rose-100 text-rose-700' },
}

function StagePill({ stage }) {
  const config = oppStageConfig[stage] ?? oppStageConfig.prospecto
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}

function SalesforceDashboard({ leads, opportunities, simulatedOpps, orders, invoices, leadsById, inventoryById }) {
  const activeLeads = leads.filter((l) => l.stage !== 'descartado')
  const allOpps = [...opportunities, ...simulatedOpps]
  const openOpps = allOpps.filter((o) => o.stage !== 'ganada' && o.stage !== 'perdida')
  const pipelineTotal = openOpps.reduce((sum, o) => sum + (o.amountUsd || 0), 0)
  const ordersInProcess = orders.filter((o) => o.status === 'en_proceso')

  const topOpps = [...openOpps]
    .sort((a, b) => (b.amountUsd || 0) - (a.amountUsd || 0))
    .slice(0, 5)

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          title="Leads activos"
          value={activeLeads.length}
          description={`de ${leads.length} totales`}
        />
        <MetricCard
          icon={Target}
          title="Oportunidades abiertas"
          value={openOpps.length}
          description={`de ${allOpps.length} totales`}
          tone="info"
        />
        <MetricCard
          icon={DollarSign}
          title="Pipeline USD"
          value={formatUSD(pipelineTotal)}
          description="Oportunidades no cerradas"
          tone="success"
        />
        <MetricCard
          icon={Package}
          title="Pedidos en proceso"
          value={ordersInProcess.length}
          description={`de ${orders.length} totales`}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <FunnelMiniChart
          leads={leads}
          opportunities={allOpps}
          orders={orders}
          invoices={invoices}
          title="Embudo comercial"
        />

        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-lab-text">Oportunidades abiertas — top 5</h3>
          {topOpps.length === 0 ? (
            <p className="text-sm text-lab-muted">Sin oportunidades abiertas en el scope actual.</p>
          ) : (
            <ul className="divide-y divide-lab-border">
              {topOpps.map((opp) => {
                const lead = leadsById[opp.leadId]
                const unit = inventoryById[opp.unitId]
                const company = opp.companyName ?? lead?.companyName ?? '-'
                const unitLabel = unit
                  ? `${unit.brand} ${unit.model} ${unit.year}`
                  : opp.sourceQuoteId ?? opp.unitId ?? '-'

                return (
                  <li key={opp.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-semibold text-lab-text">{company}</p>
                      <p className="truncate text-xs text-lab-muted">{unitLabel}</p>
                    </div>
                    <div className="shrink-0 space-y-1 text-right">
                      <p className="font-bold text-lab-text">{formatUSD(opp.amountUsd)}</p>
                      <StagePill stage={opp.stage} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </section>
  )
}

export default SalesforceDashboard
