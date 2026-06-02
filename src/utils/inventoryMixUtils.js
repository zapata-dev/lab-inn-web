import { getUnitAgency } from './inventoryUnitUtils'

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function getFirstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }

  return ''
}

function getCommercialBranch(unit) {
  return getFirstNonEmpty(
    unit?.branchName,
    unit?.branch,
    unit?.branchId,
    getUnitAgency(unit),
    unit?.ubicacion,
    unit?.ubicacionFisica,
    unit?.centro,
    unit?.location
  )
}

function getPrimaryImage(unit) {
  const gallery = Array.isArray(unit?.imagenesCompletas) ? unit.imagenesCompletas : []

  return getFirstNonEmpty(
    unit?.imagenPortada,
    unit?.coverImage,
    unit?.image,
    unit?.imageUrl,
    gallery[0]
  )
}

function buildBucketKey(unit) {
  const parts = [
    normalizeText(getFirstNonEmpty(unit?.brand, unit?.marca)),
    normalizeText(getFirstNonEmpty(unit?.model, unit?.modelo)),
    normalizeText(getFirstNonEmpty(unit?.year, unit?.anio, unit?.ano)),
    normalizeText(getCommercialBranch(unit)),
    normalizeText(getPrimaryImage(unit)),
  ].filter(Boolean)

  return parts.join('||') || `unit-${normalizeText(unit?.id)}`
}

export function mixInventoryForDisplay(units = []) {
  if (!Array.isArray(units) || units.length <= 1) {
    return Array.isArray(units) ? [...units] : []
  }

  const buckets = new Map()

  units.forEach((unit, index) => {
    const key = buildBucketKey(unit)
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        items: [],
        firstIndex: index,
      })
    }

    buckets.get(key).items.push(unit)
  })

  const orderedBuckets = [...buckets.values()].sort((left, right) => {
    if (right.items.length !== left.items.length) {
      return right.items.length - left.items.length
    }

    return left.firstIndex - right.firstIndex
  })

  const mixed = []
  let roundIndex = 0
  let hasItemsLeft = true

  while (hasItemsLeft) {
    hasItemsLeft = false

    orderedBuckets.forEach((bucket) => {
      if (roundIndex < bucket.items.length) {
        mixed.push(bucket.items[roundIndex])
        hasItemsLeft = true
      }
    })

    roundIndex += 1
  }

  return mixed
}

export default mixInventoryForDisplay
