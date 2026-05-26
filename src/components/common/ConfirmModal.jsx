function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[1px]" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-lab-border bg-white p-5 shadow-2xl">
        <h3 className="text-xl font-bold text-lab-text">{title}</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-lab-muted">{description}</p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
