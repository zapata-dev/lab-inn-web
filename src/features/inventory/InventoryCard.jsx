function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKilometers(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Kilometraje por confirmar'

  const formatted = new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(value)

  return `${formatted} km`
}

function getStatusStyle(status) {
  return /disponible/i.test(status)
    ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
    : 'border-amber-200 bg-amber-100 text-amber-700'
}

function InventoryCard({ unit, onViewDetail }) {
  const hasImage = Boolean(unit.imagenPortada)

  return (
    <article className="group overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lab">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-lab-bg">
        {hasImage ? (
          <img
            src={unit.imagenPortada}
            alt={`${unit.marca || 'Unidad'} ${unit.modelo || ''}`}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
            Sin foto
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent p-3">
          <p className="text-sm font-semibold text-white">
            {unit.marca || 'Sin marca'} {unit.modelo || 'Sin modelo'}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-lab-muted">{unit.anio || 'Ano no especificado'}</p>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(unit.status)}`}>
            {unit.status}
          </span>
        </div>

        <p className="text-2xl font-bold text-lab-primary">{formatCurrency(unit.precio)}</p>

        <div className="grid gap-1 text-sm text-lab-muted">
          <p>Ubicacion: {unit.ubicacion || 'Sin ubicacion'}</p>
          <p>Kilometraje: {formatKilometers(unit.kilometros)}</p>
          <p>Motor: {unit.motor || 'No especificado'}</p>
          <p>Transmision: {unit.transmision || 'No especificada'}</p>
          {unit.promocion ? <p>Promocion: {unit.promocion}</p> : null}
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
