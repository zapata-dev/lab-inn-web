const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function getStatusStyle(status) {
  return /disponible/i.test(status)
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-amber-100 text-amber-700 border-amber-200'
}

function InventoryCard({ unit, onViewDetail }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lab">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-lab-bg">
        <img
          src={unit.image || PLACEHOLDER_IMAGE}
          alt={`${unit.brand} ${unit.model}`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-3">
          <p className="text-sm font-semibold text-white">
            {unit.brand} {unit.model}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-lab-muted">{unit.year || 'Ano no especificado'}</p>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(unit.status)}`}>
            {unit.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {unit.unitType ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {unit.unitType}
            </span>
          ) : null}
          {unit.transmission ? (
            <span className="rounded-full bg-lab-primary/10 px-2.5 py-1 text-xs font-medium text-lab-primary">
              {unit.transmission}
            </span>
          ) : null}
        </div>

        <p className="text-2xl font-bold text-lab-primary">{formatCurrency(unit.price)}</p>

        <div className="grid gap-1 text-sm text-lab-muted">
          <p>Ubicacion: {unit.location}</p>
          {unit.mileage ? <p>Kilometraje: {unit.mileage}</p> : null}
          {unit.motor ? <p>Motor: {unit.motor}</p> : null}
        </div>

        <button
          type="button"
          onClick={() => onViewDetail(unit)}
          className="w-full rounded-xl border border-lab-primary/20 bg-lab-primary/5 px-4 py-2.5 text-sm font-semibold text-lab-primary transition-colors hover:bg-lab-primary hover:text-white"
        >
          Ver detalle
        </button>
      </div>
    </article>
  )
}

export default InventoryCard
