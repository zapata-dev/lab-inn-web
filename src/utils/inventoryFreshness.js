const STALE_THRESHOLD_HOURS = 48

export function formatLastUpdated(dateString) {
  if (!dateString) return 'Sin registro de actualizacion'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Sin registro de actualizacion'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getCacheFreshness(dateString, now = Date.now()) {
  if (!dateString) return { isStale: false, ageInDays: null }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return { isStale: false, ageInDays: null }

  const ageInHours = (now - date.getTime()) / (1000 * 60 * 60)
  const ageInDays = Math.max(0, Math.floor(ageInHours / 24))

  return { isStale: ageInHours > STALE_THRESHOLD_HOURS, ageInDays }
}
