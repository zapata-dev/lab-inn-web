import { getCodigo, getUnitAgency, isPromotionUnit } from './inventoryUnitUtils'

function unique(values) {
  return [...new Set(values.filter((value) => String(value ?? '').trim().length > 0))]
}

function toNumber(value) {
  return Number.isFinite(value) ? value : null
}

export function hasPromotion(unit) {
  return isPromotionUnit(unit)
}

export function truncatePromotionText(value, maxLength = 90) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export function getPromotionGroupKey(unit) {
  const agency = String(getUnitAgency(unit) || 'SIN_AGENCIA').trim()
  const code = String(getCodigo(unit) || 'SIN_CODIGO').trim()
  return `${agency}::${code}`
}

export function buildPromotionGroupSummary(group) {
  const prices = group.units.map((unit) => toNumber(unit.precio)).filter((value) => Number.isFinite(value))
  const models = unique(group.units.map((unit) => `${unit.marca || ''} ${unit.modelo || ''}`.trim()))
  const motors = unique(group.units.map((unit) => String(unit.motor ?? '').trim()))
  const rodadas = unique(group.units.map((unit) => String(unit.rodada ?? '').trim()))
  const pasos = unique(group.units.map((unit) => String(unit.paso ?? '').trim()))
  const years = unique(group.units.map((unit) => String(unit.anio ?? '').trim()))
  const promoText =
    group.units.find((unit) => String(unit.promocion ?? '').trim())?.promocion?.trim() ?? ''

  return {
    ...group,
    count: group.units.length,
    priceFrom: prices.length ? Math.min(...prices) : null,
    models,
    motors,
    rodadas,
    pasos,
    years,
    promoText,
  }
}

export function groupPromotionUnits(units) {
  const groupsMap = new Map()

  units.forEach((unit) => {
    const key = getPromotionGroupKey(unit)
    const agency = String(getUnitAgency(unit) || '').trim()
    const code = String(getCodigo(unit) || '').trim()

    if (!code) return

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        id: key,
        agency,
        code,
        units: [],
      })
    }

    groupsMap.get(key).units.push(unit)
  })

  return Array.from(groupsMap.values()).map(buildPromotionGroupSummary)
}

export function buildPromotionDifferencesText(group) {
  if (!group || !Array.isArray(group.units)) return ''
  if (group.units.length <= 1) return '1 unidad disponible.'

  const yearText = group.years?.length ? `Años: ${group.years.join(' / ')}` : ''
  const motorText = group.motors?.length ? `Motores: ${group.motors.join(' / ')}` : ''
  const rodadaText = group.rodadas?.length ? `Rodadas: ${group.rodadas.join(' / ')}` : ''
  const pasoText = group.pasos?.length ? `Pasos: ${group.pasos.join(' / ')}` : ''

  return [yearText, motorText, rodadaText, pasoText].filter(Boolean).join(' | ')
}

export { getCodigo, isPromotionUnit }

