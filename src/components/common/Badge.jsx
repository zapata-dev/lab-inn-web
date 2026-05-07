import clsx from 'clsx'

const variants = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-700 ring-amber-200',
  danger: 'bg-rose-100 text-rose-700 ring-rose-200',
  info: 'bg-sky-100 text-sky-700 ring-sky-200',
  demo: 'bg-lab-primary/10 text-lab-primary ring-lab-primary/20',
}

function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        variants[variant] ?? variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge
