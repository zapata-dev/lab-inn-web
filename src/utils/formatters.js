const MISSING_VALUE = '-'

const isNil = (value) => value === null || value === undefined

const toNumber = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const toDate = (value) => {
  if (isNil(value)) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const numberFormatter = new Intl.NumberFormat('es-MX')
const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const usdFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const percentFormatter = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const formatNumber = (value) => {
  const numeric = toNumber(value)
  return numeric === null ? MISSING_VALUE : numberFormatter.format(numeric)
}

export const formatMXN = (value) => {
  const numeric = toNumber(value)
  return numeric === null ? MISSING_VALUE : mxnFormatter.format(numeric)
}

export const formatUSD = (value) => {
  const numeric = toNumber(value)
  return numeric === null ? MISSING_VALUE : usdFormatter.format(numeric)
}

export const formatPercent = (value) => {
  const numeric = toNumber(value)
  if (numeric === null) return MISSING_VALUE
  return percentFormatter.format(numeric / 100)
}

export const formatDate = (value) => {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : MISSING_VALUE
}

export const formatRelativeTime = (value) => {
  const date = toDate(value)
  if (!date) return MISSING_VALUE

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDifference = Math.round((startOfTarget - startOfToday) / 86400000)

  if (dayDifference === 0) return 'Hoy'
  if (dayDifference === -1) return 'Ayer'
  if (dayDifference < 0 && dayDifference >= -30) return `Hace ${Math.abs(dayDifference)} dias`
  if (dayDifference > 0 && dayDifference <= 30) return `En ${dayDifference} dias`

  return formatDate(date)
}
