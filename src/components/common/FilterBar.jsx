import clsx from 'clsx'
import { SlidersHorizontal } from 'lucide-react'

function FilterBar({ children, title = 'Filtros', className }) {
  return (
    <section className={clsx('rounded-lab border border-lab-border bg-lab-surface p-4 shadow-lab', className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-lab-muted">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

export default FilterBar
