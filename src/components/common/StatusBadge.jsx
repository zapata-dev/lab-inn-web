import clsx from 'clsx'
import StatusDot from './StatusDot'

const statusConfig = {
  verde: { dot: 'green', label: 'Verde', tone: 'text-emerald-700 bg-emerald-50 ring-emerald-200' },
  amarillo: {
    dot: 'yellow',
    label: 'Amarillo',
    tone: 'text-amber-700 bg-amber-50 ring-amber-200',
  },
  rojo: { dot: 'red', label: 'Rojo', tone: 'text-rose-700 bg-rose-50 ring-rose-200' },
  neutral: { dot: 'gray', label: 'Neutral', tone: 'text-slate-700 bg-slate-100 ring-slate-200' },
}

function StatusBadge({ status = 'neutral', label, className }) {
  const current = statusConfig[status] ?? statusConfig.neutral

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        current.tone,
        className
      )}
    >
      <StatusDot status={current.dot} />
      {label || current.label}
    </span>
  )
}

export default StatusBadge
