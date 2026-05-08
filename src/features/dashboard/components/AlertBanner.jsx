import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react'

const variantConfig = {
  info: {
    className: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: Info,
  },
  warning: {
    className: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: AlertTriangle,
  },
  danger: {
    className: 'border-rose-200 bg-rose-50 text-rose-900',
    icon: ShieldAlert,
  },
  success: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
  },
}

function AlertBanner({ title, description, variant = 'info', actionLabel, onAction }) {
  const selected = variantConfig[variant] ?? variantConfig.info
  const Icon = selected.icon

  return (
    <section className={`rounded-lab border p-4 ${selected.className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
          </div>
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="ring-current/20 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-current ring-1 transition hover:bg-white"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  )
}

export default AlertBanner
