function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function InventoryDetailModal({ unit, onClose, onCopy }) {
  if (!unit) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-lab-text">
              {unit.brand} {unit.model}
            </h2>
            <p className="text-sm text-lab-muted">
              {unit.year || 'Ano no especificado'} • {unit.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-lab-border px-3 py-1 text-sm font-medium text-lab-muted hover:text-lab-text"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-lab-bg p-3">
            <p className="text-xs uppercase tracking-wide text-lab-muted">Precio</p>
            <p className="text-xl font-bold text-lab-primary">{formatCurrency(unit.price)}</p>
          </div>
          <div className="rounded-xl bg-lab-bg p-3">
            <p className="text-xs uppercase tracking-wide text-lab-muted">Status</p>
            <p className="text-base font-semibold text-lab-text">{unit.status}</p>
          </div>
          <div className="rounded-xl bg-lab-bg p-3">
            <p className="text-xs uppercase tracking-wide text-lab-muted">Kilometraje</p>
            <p className="text-base font-semibold text-lab-text">{unit.mileage || 'No disponible'}</p>
          </div>
          <div className="rounded-xl bg-lab-bg p-3">
            <p className="text-xs uppercase tracking-wide text-lab-muted">Ubicacion</p>
            <p className="text-base font-semibold text-lab-text">{unit.location}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
            Especificaciones
          </h3>
          {Object.keys(unit.specs || {}).length === 0 ? (
            <p className="rounded-xl border border-dashed border-lab-border p-3 text-sm text-lab-muted">
              No hay especificaciones adicionales para esta unidad.
            </p>
          ) : (
            <div className="rounded-xl border border-lab-border">
              {Object.entries(unit.specs).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-lab-border p-3 last:border-0">
                  <span className="text-sm font-medium text-lab-muted">{label}</span>
                  <span className="text-sm text-lab-text">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:innovaciogoon@zapata.com.mx?subject=Interes%20en%20unidad%20de%20inventario"
            className="rounded-xl bg-lab-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Contactar
          </a>
          <button
            type="button"
            onClick={() => onCopy(unit)}
            className="rounded-xl border border-lab-border px-4 py-2.5 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary"
          >
            Copiar datos
          </button>
        </div>
      </div>
    </div>
  )
}

export default InventoryDetailModal
