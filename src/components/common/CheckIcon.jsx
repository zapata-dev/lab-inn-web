import clsx from 'clsx'
import { Check } from 'lucide-react'

function CheckIcon({ completed = false, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full p-1 ring-1 ring-inset',
        completed
          ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
          : 'bg-slate-100 text-slate-500 ring-slate-200',
        className
      )}
      aria-label={completed ? 'Completado' : 'Pendiente'}
    >
      <Check className="size-4" />
    </span>
  )
}

export default CheckIcon
