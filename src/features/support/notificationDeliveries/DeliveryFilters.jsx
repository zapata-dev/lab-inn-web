import { useMemo, useState } from 'react'
import { DELIVERY_SOURCE_TYPES, DELIVERY_STATUSES } from '../../../services/notificationDeliveriesService'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: DELIVERY_STATUSES.PENDING, label: 'Pendiente' },
  { value: DELIVERY_STATUSES.DELIVERED, label: 'Entregada' },
  { value: DELIVERY_STATUSES.SKIPPED_DUPLICATE, label: 'Duplicado evitado' },
  { value: DELIVERY_STATUSES.FAILED, label: 'Fallida' },
  { value: DELIVERY_STATUSES.RETRIED, label: 'Reintentada' },
]

const SOURCE_TYPE_OPTIONS = [
  { value: '', label: 'Todos los eventos' },
  { value: DELIVERY_SOURCE_TYPES.REQUEST_CREATED, label: 'request_created' },
  { value: DELIVERY_SOURCE_TYPES.REQUEST_COMMENT_CREATED, label: 'request_comment_created' },
  { value: DELIVERY_SOURCE_TYPES.REQUEST_STATUS_UPDATED, label: 'request_status_updated' },
  { value: DELIVERY_SOURCE_TYPES.MANUAL_RETRY, label: 'manual_retry' },
]

async function copyText(text) {
  const normalized = String(text || '').trim()
  if (!normalized) return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(normalized)
      return true
    }
  } catch (_) {
    return false
  }

  return false
}

function DeliveryFilters({ filters, onChange, onClear }) {
  const [copyMessage, setCopyMessage] = useState('')

  const activeChips = useMemo(() => {
    const chips = []

    if (filters.status) chips.push(`status:${filters.status}`)
    if (filters.sourceType) chips.push(`sourceType:${filters.sourceType}`)
    if (filters.deliveryId) chips.push(`deliveryId:${filters.deliveryId}`)
    if (filters.solicitudId) chips.push(`solicitudId:${filters.solicitudId}`)
    if (filters.userId) chips.push(`userId:${filters.userId}`)

    return chips
  }, [filters])

  const handleCopyFilters = async () => {
    const payload = JSON.stringify(
      {
        status: filters.status,
        sourceType: filters.sourceType,
        deliveryId: filters.deliveryId,
        solicitudId: filters.solicitudId,
        userId: filters.userId,
      },
      null,
      0
    )

    const copied = await copyText(payload)
    setCopyMessage(copied ? 'Filtros copiados.' : 'No se pudieron copiar los filtros.')
  }

  return (
    <section className="space-y-3 rounded-2xl border border-lab-border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Estado
          <select
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all-status'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Source type
          <select
            value={filters.sourceType}
            onChange={(event) => onChange({ sourceType: event.target.value })}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            {SOURCE_TYPE_OPTIONS.map((option) => (
              <option key={option.value || 'all-source'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Delivery ID
          <input
            type="text"
            value={filters.deliveryId}
            onChange={(event) => onChange({ deliveryId: event.target.value })}
            placeholder="deliveryId"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          />
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Solicitud ID
          <input
            type="text"
            value={filters.solicitudId}
            onChange={(event) => onChange({ solicitudId: event.target.value })}
            placeholder="solicitudId"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          />
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          User ID
          <input
            type="text"
            value={filters.userId}
            onChange={(event) => onChange({ userId: event.target.value })}
            placeholder="userId"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          />
        </label>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-lab-primary/30 bg-lab-primary/10 px-3 py-2 text-sm font-semibold text-lab-primary hover:bg-lab-primary hover:text-white"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={handleCopyFilters}
            className="rounded-lg border border-lab-border px-3 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
          >
            Copiar filtros
          </button>
        </div>
      </div>

      {activeChips.length ? (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span key={chip} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-lab-text">
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-lab-muted">Sin filtros activos.</p>
      )}

      {copyMessage ? <p className="text-xs text-lab-muted">{copyMessage}</p> : null}
    </section>
  )
}

export default DeliveryFilters
