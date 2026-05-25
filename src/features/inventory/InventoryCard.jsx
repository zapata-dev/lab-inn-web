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

function toSafeText(value, fallback) {
  const text = String(value ?? '').trim()
  if (!text) return fallback
  if (text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return fallback
  return text
}

function truncateText(value, maxLength = 42) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3).trim()}...`
}

function getPromotionBadge(promotionText) {
  const normalized = String(promotionText ?? '').toLowerCase()
  if (!normalized.trim()) return ''
  if (normalized.includes('bono')) return 'Bono disponible'
  if (normalized.includes('regalo')) return 'Incluye regalo'
  if (normalized.includes('financiamiento')) return 'Financiamiento especial...'
  return truncateText(promotionText, 40) || 'Promocion'
}

function InventoryCard({ unit, onViewDetail }) {
  const hasImage = Boolean(unit.imagenPortada)
  const promotionBadge = getPromotionBadge(unit.promocion)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lab-primary/35 hover:shadow-lab">
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-3">
          <p className="text-sm font-semibold text-white">
            {toSafeText(unit.marca, 'Sin marca')} {toSafeText(unit.modelo, 'Sin modelo')}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-lab-muted">{toSafeText(unit.anio, 'Ano no especificado')}</p>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(unit.status)}`}>
            {toSafeText(unit.status, 'Disponible')}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-bold text-lab-primary">{formatCurrency(unit.precio)}</p>
          {promotionBadge ? (
            <span
              className="inline-flex max-w-full truncate rounded-full border border-lab-primary/25 bg-lab-primary/10 px-2.5 py-1 text-xs font-semibold text-lab-primary"
              title={unit.promocion}
            >
              {promotionBadge}
            </span>
          ) : null}
        </div>

        <div className="grid min-h-[116px] gap-1.5 text-sm text-lab-muted">
          <p className="truncate" title={toSafeText(unit.ubicacion, 'Sin ubicacion')}>
            Ubicacion: {toSafeText(unit.ubicacion, 'Sin ubicacion')}
          </p>
          <p>Kilometraje: {formatKilometers(unit.kilometros)}</p>
          <p className="truncate" title={toSafeText(unit.motor, 'No especificado')}>
            Motor: {toSafeText(unit.motor, 'No especificado')}
          </p>
          <p className="truncate" title={toSafeText(unit.transmision, 'No especificada')}>
            Transmision: {toSafeText(unit.transmision, 'No especificada')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onViewDetail(unit)}
          className="mt-auto w-full rounded-xl border border-lab-primary/20 bg-lab-primary/5 px-4 py-2.5 text-sm font-semibold text-lab-primary transition-colors duration-200 hover:bg-lab-primary hover:text-white"
        >
          Ver detalle
        </button>
      </div>
    </article>
  )
}

export default InventoryCard
