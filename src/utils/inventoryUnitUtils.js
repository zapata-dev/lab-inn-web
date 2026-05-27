function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function hasText(value) {
  return String(value ?? '').trim().length > 0
}

function toCanonicalSubempresa(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const normalized = normalizeText(raw).replace(/\s+/g, '')

  if (normalized === 'selectrucks') return 'Selectrucks'
  if (normalized === 'goon') return 'GoOn'

  return raw
}

export function getSubempresa(unit) {
  return toCanonicalSubempresa(unit?.subempresa ?? unit?.Subempresa ?? '')
}

export function getCodigo(unit) {
  return String(unit?.codigo ?? unit?.Codigo ?? '').trim()
}

export function isPromotionUnit(unit) {
  return Boolean(getCodigo(unit))
}

export function getUnitFieldValue(unit, key) {
  if (key === 'subempresa') return getSubempresa(unit)
  if (key === 'codigo') return getCodigo(unit)

  const directValue = unit?.[key]
  if (hasText(directValue)) return directValue

  const upperKey = `${String(key).charAt(0).toUpperCase()}${String(key).slice(1)}`
  const upperValue = unit?.[upperKey]
  if (hasText(upperValue)) return upperValue

  return directValue ?? upperValue ?? ''
}
