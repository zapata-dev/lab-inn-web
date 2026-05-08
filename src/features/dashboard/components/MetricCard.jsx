import { Card } from '../../../components/common'

const toneClasses = {
  default: 'border-lab-border',
  success: 'border-emerald-200 bg-emerald-50/40',
  warning: 'border-amber-200 bg-amber-50/40',
  danger: 'border-rose-200 bg-rose-50/40',
  info: 'border-sky-200 bg-sky-50/40',
}

function MetricCard({ title, value, description, icon: Icon, tone = 'default' }) {
  return (
    <Card className={`space-y-3 ${toneClasses[tone] ?? toneClasses.default}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-lab-muted">{title}</p>
        {Icon && (
          <span className="inline-flex rounded-lg bg-white p-2 text-lab-muted ring-1 ring-slate-200">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-lab-text">{value}</p>
      {description && <p className="text-xs text-lab-muted">{description}</p>}
    </Card>
  )
}

export default MetricCard
