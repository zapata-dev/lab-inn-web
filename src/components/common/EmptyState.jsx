import clsx from 'clsx'
import { Inbox } from 'lucide-react'

function EmptyState({
  icon: Icon = Inbox,
  title = 'Sin resultados',
  description = 'Todavia no hay informacion para mostrar aqui.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <section
      className={clsx(
        'rounded-lab border border-dashed border-lab-border bg-slate-50 p-8 text-center',
        className
      )}
    >
      <div className="mx-auto mb-3 inline-flex rounded-full bg-lab-primary/10 p-3 text-lab-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-lab-text">{title}</h3>
      <p className="mt-2 text-sm text-lab-muted">{description}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </section>
  )
}

export default EmptyState
