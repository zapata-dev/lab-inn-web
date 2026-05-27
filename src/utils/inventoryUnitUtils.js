function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function toCanonicalAgency(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const normalized = normalizeText(raw).replace(/\s+/g, ' ')

  if (normalized.includes('camiones tlanepantla')) return 'CAMIONES TLALNEPANTLA'
  if (normalized.includes('camiones guadalajara otero')) return 'CAMIONES GUADALAJARA OTERO'
  if (normalized.includes('camiones aeropuerto')) return 'CAMIONES AEROPUERTO'
  if (normalized.includes('camiones leon')) return 'CAMIONES LEON'
  if (normalized.includes('camiones queretaro') || normalized.includes('camiones qro'))
    return 'CAMIONES QUERETARO'
  if (normalized.includes('camiones celaya')) return 'CAMIONES CELAYA'
  if (normalized.includes('camiones tampico')) return 'CAMIONES TAMPICO'
  if (normalized.includes('camiones monterrey') || normalized.includes('camiones mty'))
    return 'CAMIONES MONTERREY'

  return raw.replace(/\s+/g, ' ').trim()
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
  return String(
    unit?.codigo ??
      unit?.Codigo ??
      unit?.['Código'] ??
      unit?.CODIGO ??
      unit?.raw?.codigo ??
      unit?.raw?.Codigo ??
      unit?.raw?.['Código'] ??
      unit?.raw?.CODIGO ??
      ''
  ).trim()
}

export function isPromotionUnit(unit) {
  return Boolean(getCodigo(unit))
}

export function getUnitAgency(unit) {
  const candidates = [
    unit?.sucursal,
    unit?.Sucursal,
    unit?.agencia,
    unit?.Agencia,
    unit?.ubicacion,
    unit?.Ubicacion,
    unit?.ubicacionFisica,
    unit?.UbicacionFisica,
    unit?.location,
    unit?.Location,
    unit?.centro,
    unit?.Centro,
  ]

  const value = candidates.find((candidate) => hasText(candidate)) ?? ''
  return toCanonicalAgency(value)
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
