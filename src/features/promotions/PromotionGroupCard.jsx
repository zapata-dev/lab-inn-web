import { ChevronDown, FileDown } from 'lucide-react'
import { useState } from 'react'
import {
  buildPromotionDifferencesText,
  formatCurrency,
  getPromotionCoverImage,
  getUnitKilometers,
  getUnitVinShort,
  truncatePromotionText,
} from '../../utils/promotionUtils'
import { getSubempresa } from '../../utils/inventoryUnitUtils'

function safeText(value, fallback = 'Por confirmar') {
  const text = String(value ?? '').trim()
  if (!text || text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return fallback
  return text
}

function joinValues(values, fallback = 'Por confirmar') {
  const uniqueValues = [...new Set((Array.isArray(values) ? values : []).map((value) => safeText(value, '')).filter(Boolean))]
  return uniqueValues.length > 0 ? uniqueValues.join(' / ') : fallback
}

function PromotionGroupCard({ group, onViewUnit, onExportSummary }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const coverImage = group.coverImage || getPromotionCoverImage(group.representativeUnit)
  const yearsLabel = joinValues(group.years, 'Por confirmar')
  const modelsLabel = joinValues(group.models, 'Por confirmar')
  const branchLabel = safeText(group.agency)

  return (
    <article className="overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lab">
      <div className="aspect-[16/9] overflow-hidden border-b border-lab-border bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Portada de promoción ${branchLabel} ${yearsLabel}`}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-sm font-semibold text-lab-muted">
            Imagen de portada por confirmar
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{branchLabel}</p>
            <h3 className="mt-1 text-lg font-bold text-lab-text">Año: {yearsLabel}</h3>
            <p className="mt-1 text-sm text-lab-muted">
              {group.count} {group.count === 1 ? 'unidad disponible' : 'unidades disponibles'}
            </p>
          </div>
          <p className="text-2xl font-bold text-lab-primary">{formatCurrency(group.priceFrom)}</p>
        </div>

        <div className="mt-3 space-y-2 text-sm text-lab-muted">
          <p>
            <span className="font-semibold text-lab-text">Modelo:</span> {modelsLabel}
          </p>
          <p>
            <span className="font-semibold text-lab-text">Sucursal:</span> {branchLabel}
          </p>
          <p>
            <span className="font-semibold text-lab-text">Diferencias:</span>{' '}
            {buildPromotionDifferencesText(group) || 'Sin diferencias relevantes'}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Texto comercial</p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900">
            {truncatePromotionText(group.promoText, 180) || 'Promoción disponible'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((previous) => !previous)}
            className="inline-flex items-center gap-2 rounded-xl border border-lab-border px-3 py-2 text-xs font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary"
          >
            <ChevronDown className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            Ver unidades
          </button>
          <button
            type="button"
            onClick={() => onExportSummary(group)}
            className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/25 bg-lab-primary/10 px-3 py-2 text-xs font-semibold text-lab-primary transition-colors hover:bg-lab-primary hover:text-white"
          >
            <FileDown className="size-4" aria-hidden="true" />
            Exportar resumen
          </button>
        </div>

        {isExpanded ? (
          <div className="mt-4 grid gap-2 rounded-xl border border-lab-border bg-lab-bg p-3">
            {group.units.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => onViewUnit(unit)}
                className="grid gap-2 rounded-lg border border-lab-border bg-white p-3 text-left transition-colors hover:border-lab-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-lab-text">
                    {safeText(unit.marca, 'Sin marca')} {safeText(unit.modelo, 'Sin modelo')} ({safeText(unit.anio, 'Año')})
                  </p>
                  <p className="text-sm font-semibold text-lab-primary">{formatCurrency(unit.precio)}</p>
                </div>
                <p className="text-xs text-lab-muted">
                  Kilometraje: {getUnitKilometers(unit)} | VIN: {getUnitVinShort(unit)} | Subempresa:{' '}
                  {safeText(getSubempresa(unit), 'Por confirmar')}
                </p>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default PromotionGroupCard

