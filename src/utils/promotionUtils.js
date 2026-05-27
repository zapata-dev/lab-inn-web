import { getCodigo, getSubempresa, getUnitAgency, isPromotionUnit } from './inventoryUnitUtils'

function unique(values) {
  return [...new Set(values.filter((value) => String(value ?? '').trim().length > 0))]
}

function toNumber(value) {
  return Number.isFinite(value) ? value : null
}

function hasText(value) {
  return String(value ?? '').trim().length > 0
}

export function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKilometers(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} km`
}

export function getUnitKilometers(unit) {
  if (hasText(unit?.kilometrosFormatted)) return String(unit.kilometrosFormatted).trim()
  return formatKilometers(unit?.kilometros)
}

export function getUnitVinShort(unit) {
  if (hasText(unit?.vin)) return String(unit.vin).trim()
  if (!hasText(unit?.vinCompleto)) return 'Por confirmar'

  const fullVin = String(unit.vinCompleto).trim()
  return fullVin.length > 8 ? fullVin.slice(-8) : fullVin
}

export function getPromotionCoverImage(unit) {
  const cover = String(unit?.imagenPortada ?? '').trim()
  if (/^https?:\/\//i.test(cover)) return cover

  const fallbackImages = Array.isArray(unit?.imagenesCompletas) ? unit.imagenesCompletas : []
  const fallback = String(fallbackImages[0] ?? '').trim()
  return /^https?:\/\//i.test(fallback) ? fallback : ''
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
  const representativeUnit =
    group.units.find((unit) => getPromotionCoverImage(unit)) ?? group.units[0] ?? null

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
    representativeUnit,
    coverImage: representativeUnit ? getPromotionCoverImage(representativeUnit) : '',
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
  if (group.units.length <= 1) {
    const unit = group.units[0]
    return `Kilometraje: ${unit ? getUnitKilometers(unit) : 'Por confirmar'}`
  }

  const kilometerValues = group.units.map((unit) => toNumber(unit.kilometros)).filter((value) => Number.isFinite(value))
  const kilometerText = kilometerValues.length
    ? `Kilometraje: ${formatKilometers(Math.min(...kilometerValues))} a ${formatKilometers(Math.max(...kilometerValues))}`
    : `Kilometraje: ${unique(group.units.map((unit) => getUnitKilometers(unit))).join(' / ') || 'Por confirmar'}`

  const comparableFields = [
    { key: 'motor', label: 'Motor', format: (value) => String(value ?? '').trim() || 'Por confirmar' },
    { key: 'rodada', label: 'Rodada', format: (value) => String(value ?? '').trim() || 'Por confirmar' },
    { key: 'paso', label: 'Paso', format: (value) => String(value ?? '').trim() || 'Por confirmar' },
    {
      key: 'transmision',
      label: 'Transmision',
      format: (value) => String(value ?? '').trim() || 'Por confirmar',
    },
    { key: 'anio', label: 'Ano', format: (value) => String(value ?? '').trim() || 'Por confirmar' },
    { key: 'precio', label: 'Precio', format: (value) => formatCurrency(value) },
    { key: 'subempresa', label: 'Subempresa', format: (value) => getSubempresa({ subempresa: value }) || 'Por confirmar' },
  ]

  const technicalDifferences = comparableFields
    .map((field) => {
      const values = unique(group.units.map((unit) => field.format(unit?.[field.key])))
      if (values.length <= 1) return null
      return `${field.label}: ${values.join(' / ')}`
    })
    .filter(Boolean)

  if (!technicalDifferences.length) {
    return `${kilometerText} | Las unidades comparten configuracion; varian principalmente en kilometraje y VIN.`
  }

  return [kilometerText, ...technicalDifferences].join(' | ')
}

export { getCodigo, isPromotionUnit }
