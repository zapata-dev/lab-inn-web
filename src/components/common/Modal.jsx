import { X } from 'lucide-react'

function Modal({ isOpen, title, children, onClose, footer }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-lg rounded-lab border border-lab-border bg-white shadow-lab">
        <header className="flex items-center justify-between border-b border-lab-border px-5 py-4">
          <h3 className="text-lg font-semibold text-lab-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar modal"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-lab-border px-5 py-4">{footer}</footer>}
      </div>
    </div>
  )
}

export default Modal
