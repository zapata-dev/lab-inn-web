function toSafeDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (value && typeof value.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatRelativeTime(fromDate, now = new Date()) {
  const from = toSafeDate(fromDate)
  if (!from) return 'fecha invalida'

  const diffMs = now.getTime() - from.getTime()
  if (diffMs < 0) return 'hace unos segundos'

  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return 'hace menos de 1 minuto'
  if (minutes < 60) return `hace ${minutes} minuto${minutes === 1 ? '' : 's'}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? '' : 's'}`

  const days = Math.floor(hours / 24)
  return `hace ${days} dia${days === 1 ? '' : 's'}`
}

function getFreshnessState(lastImportedAt, staleHours) {
  if (!lastImportedAt) {
    return {
      tone: 'warning',
      title: 'No se detecto ultima actualizacion de inventario.',
      detail: 'Valida el proceso de import diario.',
    }
  }

  const date = toSafeDate(lastImportedAt)
  if (!date) {
    return {
      tone: 'warning',
      title: 'No se detecto ultima actualizacion de inventario.',
      detail: 'El valor de fecha no es valido.',
    }
  }

  const ageHours = (Date.now() - date.getTime()) / (1000 * 60 * 60)
  const relative = formatRelativeTime(date)

  if (ageHours > staleHours) {
    return {
      tone: 'danger',
      title: `Inventario desactualizado (${relative}).`,
      detail: `Supera el umbral de ${staleHours} horas.`,
    }
  }

  return {
    tone: 'fresh',
    title: `Inventario actualizado ${relative}.`,
    detail: `Dentro del umbral de ${staleHours} horas.`,
  }
}

// Props opcionales de LAB-PROD-016 (wiring desde InventarioNacional pendiente):
//   missingUnitsCount  — numero de unidades ausentes en el ultimo import
//   lastFailedImportAt — timestamp del ultimo import con status=fallido
function InventoryFreshnessBanner({
  lastImportedAt,
  staleHours = 24,
  loading = false,
  error = '',
  missingUnitsCount,
  lastFailedImportAt,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-lab-border bg-white px-4 py-3 text-sm text-lab-muted shadow-sm">
        Validando frescura del inventario...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
        No fue posible validar frescura del inventario: {error}
      </div>
    )
  }

  const state = getFreshnessState(lastImportedAt, staleHours)

  const toneClass =
    state.tone === 'fresh'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : state.tone === 'danger'
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-slate-200 bg-slate-50 text-slate-700'

  const hasMissingUnits = typeof missingUnitsCount === 'number' && missingUnitsCount > 0
  const failedDate = toSafeDate(lastFailedImportAt)

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${toneClass}`}>
      <p className="text-sm font-semibold">{state.title}</p>
      <p className="mt-1 text-xs">{state.detail}</p>
      {hasMissingUnits && (
        <p className="mt-1 text-xs opacity-80">
          {missingUnitsCount} unidad{missingUnitsCount === 1 ? '' : 'es'} ausente{missingUnitsCount === 1 ? '' : 's'} en ultimo import.
        </p>
      )}
      {failedDate && (
        <p className="mt-1 text-xs opacity-80">
          Ultimo import fallido {formatRelativeTime(failedDate)}.
        </p>
      )}
    </div>
  )
}

export default InventoryFreshnessBanner
