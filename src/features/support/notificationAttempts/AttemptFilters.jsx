import { useMemo } from 'react'
import {
  ATTEMPT_REASONS,
  ATTEMPT_STATUSES,
  ATTEMPT_TRIGGERED_BY,
} from '../../../services/notificationAttemptsService'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: ATTEMPT_STATUSES.PENDING, label: 'pending' },
  { value: ATTEMPT_STATUSES.DELIVERED, label: 'delivered' },
  { value: ATTEMPT_STATUSES.SKIPPED_DUPLICATE, label: 'skipped_duplicate' },
  { value: ATTEMPT_STATUSES.FAILED, label: 'failed' },
  { value: ATTEMPT_STATUSES.RETRIED, label: 'retried' },
  { value: ATTEMPT_STATUSES.RETRY_NOT_REQUIRED, label: 'retry_not_required' },
]

const REASON_OPTIONS = [
  { value: '', label: 'Todos los reasons' },
  { value: ATTEMPT_REASONS.INITIAL_DELIVERY, label: ATTEMPT_REASONS.INITIAL_DELIVERY },
  {
    value: ATTEMPT_REASONS.NOTIFICATION_ALREADY_EXISTS,
    label: ATTEMPT_REASONS.NOTIFICATION_ALREADY_EXISTS,
  },
  { value: ATTEMPT_REASONS.NOTIFICATION_CREATED, label: ATTEMPT_REASONS.NOTIFICATION_CREATED },
  {
    value: ATTEMPT_REASONS.NOTIFICATION_CREATE_FAILED,
    label: ATTEMPT_REASONS.NOTIFICATION_CREATE_FAILED,
  },
  { value: ATTEMPT_REASONS.MANUAL_RETRY, label: ATTEMPT_REASONS.MANUAL_RETRY },
  { value: ATTEMPT_REASONS.MANUAL_RETRY_SUCCESS, label: ATTEMPT_REASONS.MANUAL_RETRY_SUCCESS },
  { value: ATTEMPT_REASONS.MANUAL_RETRY_FAILED, label: ATTEMPT_REASONS.MANUAL_RETRY_FAILED },
  { value: ATTEMPT_REASONS.STATUS_NOT_FAILED, label: ATTEMPT_REASONS.STATUS_NOT_FAILED },
]

const TRIGGERED_BY_OPTIONS = [
  { value: '', label: 'Todos los orígenes' },
  { value: ATTEMPT_TRIGGERED_BY.CLOUD_FUNCTION, label: ATTEMPT_TRIGGERED_BY.CLOUD_FUNCTION },
  { value: ATTEMPT_TRIGGERED_BY.SUPPORT_RETRY, label: ATTEMPT_TRIGGERED_BY.SUPPORT_RETRY },
]

function AttemptFilters({ filters, onChange, onClear }) {
  const activeChips = useMemo(() => {
    const chips = []

    if (filters.status) chips.push(`status:${filters.status}`)
    if (filters.reason) chips.push(`reason:${filters.reason}`)
    if (filters.triggeredBy) chips.push(`triggeredBy:${filters.triggeredBy}`)
    if (filters.deliveryId) chips.push(`deliveryId:${filters.deliveryId}`)
    if (filters.solicitudId) chips.push(`solicitudId:${filters.solicitudId}`)
    if (filters.userId) chips.push(`userId:${filters.userId}`)

    return chips
  }, [filters])

  return (
    <section className="space-y-3 rounded-2xl border border-lab-border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Status
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
          Reason
          <select
            value={filters.reason}
            onChange={(event) => onChange({ reason: event.target.value })}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option.value || 'all-reason'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Triggered by
          <select
            value={filters.triggeredBy}
            onChange={(event) => onChange({ triggeredBy: event.target.value })}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            {TRIGGERED_BY_OPTIONS.map((option) => (
              <option key={option.value || 'all-triggered'} value={option.value}>
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

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-lg border border-lab-primary/30 bg-lab-primary/10 px-3 py-2 text-sm font-semibold text-lab-primary hover:bg-lab-primary hover:text-white"
          >
            Limpiar filtros
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
    </section>
  )
}

export default AttemptFilters
