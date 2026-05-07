import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'

const variantMap = {
  success: {
    icon: CheckCircle,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  info: {
    icon: Info,
    tone: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  warning: {
    icon: AlertTriangle,
    tone: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  error: {
    icon: XCircle,
    tone: 'border-rose-200 bg-rose-50 text-rose-800',
  },
  simulated: {
    icon: Info,
    tone: 'border-lab-primary/25 bg-lab-primary/10 text-lab-primary',
  },
}

function Toast({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2 md:inset-x-auto md:right-4 md:top-4 md:w-full">
      {toasts.map((toastItem) => {
        const config = variantMap[toastItem.variant] ?? variantMap.info
        const Icon = config.icon

        return (
          <article
            key={toastItem.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-sm ${config.tone}`}
            role="status"
            aria-live="polite"
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{toastItem.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toastItem.id)}
              className="rounded-md p-1 transition hover:bg-black/5"
              aria-label="Cerrar notificacion"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </article>
        )
      })}
    </div>
  )
}

export default Toast
