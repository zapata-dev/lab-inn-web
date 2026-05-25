function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const EXCLUDED_PROMOTION_VALUES = new Set([
  'por confirmar',
  'sin promocion',
  'n a',
  'na',
  '-',
  'no aplica',
])

export function hasPromotion(unit) {
  const normalizedPromotion = normalizeText(unit?.promocion)

  if (!normalizedPromotion) return false

  return !EXCLUDED_PROMOTION_VALUES.has(normalizedPromotion)
}

export function truncatePromotionText(value, maxLength = 90) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}
