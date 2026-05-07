import clsx from 'clsx'
import { X } from 'lucide-react'

function Drawer({ isOpen, title, children, onClose, side = 'right' }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45">
      <aside
        className={clsx(
          'absolute top-0 size-full max-w-md border-lab-border bg-white shadow-lab',
          side === 'left' ? 'left-0 border-r' : 'right-0 border-l'
        )}
      >
        <header className="flex items-center justify-between border-b border-lab-border px-5 py-4">
          <h3 className="text-lg font-semibold text-lab-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar drawer"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="h-[calc(100%-65px)] overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  )
}

export default Drawer
