const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function InventoryCard({ unit, onViewDetail }) {
  const statusClass = /disponible/i.test(unit.status)
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700'

  return (
    <article className="overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lab">
      <div className="aspect-[16/10] w-full overflow-hidden bg-lab-bg">
        <img
          src={unit.image || PLACEHOLDER_IMAGE}
          alt={`${unit.brand} ${unit.model}`}
          className="size-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-lab-text">
              {unit.brand} {unit.model}
            </h3>
            <p className="text-sm text-lab-muted">{unit.year || 'Ano no especificado'}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
            {unit.status}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold text-lab-primary">{formatCurrency(unit.price)}</p>
          <p className="text-sm text-lab-muted">{unit.location}</p>
          {unit.mileage ? <p className="text-sm text-lab-muted">Kilometraje: {unit.mileage}</p> : null}
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
