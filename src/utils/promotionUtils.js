import { getCodigo, isPromotionUnit } from './inventoryUnitUtils'

export function hasPromotion(unit) {
  return isPromotionUnit(unit)
}

export function truncatePromotionText(value, maxLength = 90) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export { getCodigo, isPromotionUnit }
