import { getCodigo } from './inventoryUnitUtils'

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function normalizeUrl(value) {
  return String(value || '').trim()
}

export function normalizeCoverUrlForKey(value) {
  const rawUrl = normalizeUrl(value)
  if (!rawUrl) return ''

  try {
    const parsed = new URL(rawUrl)
    parsed.search = ''
    parsed.hash = ''
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    return `${parsed.origin.toLowerCase()}${pathname}`
  } catch {
    return rawUrl.split('#')[0].split('?')[0].trim().toLowerCase()
  }
}

export function getCoverFromPortadaColumn(unit) {
  const rawPortadaValue = normalizeUrl(unit?.raw?.imagenPortadaRaw ?? unit?.imagenPortadaRaw ?? '')
  if (!rawPortadaValue) return ''
  const match = rawPortadaValue.match(/https?:\/\/[^\s,"]+/i)
  return match ? normalizeUrl(match[0]) : ''
}

export function getPromotionValue(unit) {
  const candidates = [
    unit?.promocion,
    unit?.Promocion,
    unit?.Promoción,
    unit?.promotion,
    unit?.raw?.Promoción,
    unit?.raw?.Promocion,
    unit?.raw?.promocion,
    unit?.raw?.promotion,
  ]

  const firstCandidate = candidates.find((value) => String(value ?? '').trim().length > 0)
  return String(firstCandidate ?? '').trim()
}

export function isPromotionFlagUnit(unit) {
  const normalized = normalizeText(getPromotionValue(unit))
  return normalized === 'si' || normalized === 's' || normalized === 'sí'
}

export function buildCoverDedupeKey(coverImage) {
  const normalizedCoverUrl = normalizeCoverUrlForKey(coverImage)
  if (normalizedCoverUrl) return `cover:${normalizedCoverUrl}`
  return 'cover:sin-url'
}

export function countUniquePromotionCoverImages(units = []) {
  const seen = new Set()
  let count = 0

  units.forEach((unit) => {
    if (!isPromotionFlagUnit(unit)) return
    const coverImage = getCoverFromPortadaColumn(unit)
    if (!coverImage) return
    const dedupeKey = buildCoverDedupeKey(coverImage)
    if (seen.has(dedupeKey)) return
    seen.add(dedupeKey)
    count += 1
  })

  return count
}

export function collectUniquePromotionCoverItems(units = []) {
  const byImageKey = new Map()

  units.forEach((unit) => {
    if (!isPromotionFlagUnit(unit)) return

    const coverImage = getCoverFromPortadaColumn(unit)
    if (!coverImage) return

    const dedupeKey = buildCoverDedupeKey(coverImage)
    const promotionCode = String(getCodigo(unit) || '').trim()
    const existing = byImageKey.get(dedupeKey)

    if (existing) {
      if (promotionCode) existing.codeSet.add(promotionCode)
      return
    }

    byImageKey.set(dedupeKey, {
      unit,
      dedupeKey,
      coverImage,
      codeSet: new Set(promotionCode ? [promotionCode] : []),
    })
  })

  return [...byImageKey.values()].map((item) => ({
    ...item,
    associatedCodes: [...item.codeSet].sort((left, right) => left.localeCompare(right, 'es')),
    associatedCodeCount: item.codeSet.size,
  }))
}
