import { MapPin, Tag } from 'lucide-react'
import { truncatePromotionText } from '../../utils/promotionUtils'

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

  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} km`
}

function safeText(value, fallback = 'Por confirmar') {
  const text = String(value ?? '').trim()
  if (!text) return fallback
  if (text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return fallback
  return text
}

function PromotionCard({ unit, onViewDetail }) {
  const promotionSummary = truncatePromotionText(unit.promocion, 90)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lab-primary/35 hover:shadow-lab">
      <div className="relative aspect-[16/10] overflow-hidden bg-lab-bg">
        {unit.imagenPortada ? (
          <img
            src={unit.imagenPortada}
            alt={`${safeText(unit.marca, 'Unidad')} ${safeText(unit.modelo, '')}`.trim()}
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

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/35 bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Tag className="size-3.5" aria-hidden="true" />
          Promoción
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 min-h-[3.2rem] text-lg font-bold leading-tight text-lab-text">
            {safeText(unit.marca, 'Sin marca')} {safeText(unit.modelo, 'Sin modelo')}
          </h3>
          <p className="text-sm font-medium text-lab-muted">Año {safeText(unit.anio, 'Por confirmar')}</p>
        </div>

        <p className="text-2xl font-bold text-lab-primary">{formatCurrency(unit.precio)}</p>

        <div className="space-y-1 text-sm text-lab-muted">
          <p className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden="true" />
            <span className="truncate" title={safeText(unit.ubicacion, 'Ubicación por confirmar')}>
              {safeText(unit.ubicacion, 'Ubicación por confirmar')}
            </span>
          </p>
          <p>{formatKilometers(unit.kilometros)}</p>
          <p className="truncate" title={safeText(unit.motor, 'Motor por confirmar')}>
            Motor: {safeText(unit.motor, 'Motor por confirmar')}
          </p>
          <p className="truncate" title={safeText(unit.transmision, 'Transmisión por confirmar')}>
            Transmisión: {safeText(unit.transmision, 'Transmisión por confirmar')}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Promoción vigente</p>
          <p className="mt-1 min-h-11 text-sm leading-relaxed text-emerald-900" title={safeText(unit.promocion)}>
            {promotionSummary || 'Promoción disponible'}
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

export default PromotionCard

