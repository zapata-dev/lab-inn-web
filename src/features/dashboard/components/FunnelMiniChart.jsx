import { Card } from '../../../components/common'

const stagesMeta = [
  { key: 'leads', label: 'Leads' },
  { key: 'opportunities', label: 'Oportunidades' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'invoices', label: 'Facturas' },
]

const getWidthClass = (ratio) => {
  if (ratio >= 0.9) return 'w-full'
  if (ratio >= 0.8) return 'w-10/12'
  if (ratio >= 0.7) return 'w-9/12'
  if (ratio >= 0.6) return 'w-8/12'
  if (ratio >= 0.5) return 'w-7/12'
  if (ratio >= 0.4) return 'w-6/12'
  if (ratio >= 0.3) return 'w-5/12'
  if (ratio >= 0.2) return 'w-4/12'
  if (ratio >= 0.1) return 'w-3/12'
  if (ratio > 0) return 'w-2/12'
  return 'w-1/12'
}

function FunnelMiniChart({ leads = [], opportunities = [], orders = [], invoices = [], title = 'Embudo' }) {
  const counts = {
    leads: leads.length,
    opportunities: opportunities.length,
    orders: orders.length,
    invoices: invoices.length,
  }

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-lab-text">{title}</h3>
      <ul className="space-y-3">
        {stagesMeta.map((stage, index) => {
          const count = counts[stage.key]
          const previousCount = index === 0 ? count : counts[stagesMeta[index - 1].key]
          const conversion = index === 0 ? 100 : previousCount > 0 ? Math.round((count / previousCount) * 100) : 0
          const ratio = count / maxCount
          const widthClass = getWidthClass(ratio)

          return (
            <li key={stage.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lab-text">{stage.label}</span>
                <span className="text-lab-muted">
                  {count} {index === 0 ? '' : `(${conversion}%)`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full bg-lab-primary transition-all duration-300 ${widthClass}`} />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default FunnelMiniChart
