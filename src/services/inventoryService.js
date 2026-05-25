export const INVENTORY_CSV_URL = 'PEGAR_AQUI_URL_CSV_PUBLICA'
export const INVENTORY_CACHE_KEY = 'lab:v1:inventory_cache'
export const INVENTORY_LAST_UPDATED_KEY = 'lab:v1:inventory_last_updated'

const FIELD_ALIASES = {
  brand: ['marca', 'brand'],
  model: ['modelo', 'model'],
  year: ['ano', 'anio', 'year'],
  price: ['precio', 'price', 'valor'],
  mileage: ['kilometraje', 'km', 'kms', 'mileage'],
  location: ['sucursal', 'ubicacion', 'location', 'branch'],
  status: ['status', 'estado', 'disponibilidad', 'availability'],
  image: ['foto', 'imagen', 'image', 'photo', 'url imagen', 'image url'],
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parsePrice(value) {
  const cleaned = String(value ?? '')
    .replace(/[^0-9.,-]/g, '')
    .replace(/,/g, '')
  const parsed = Number(cleaned)

  return Number.isFinite(parsed) ? parsed : 0
}

function parseCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

function parseCsv(csvText) {
  const lines = String(csvText ?? '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0])
  const records = []

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index])
    const row = {}

    headers.forEach((header, columnIndex) => {
      row[header] = values[columnIndex] ?? ''
    })

    records.push(row)
  }

  return records
}

function findField(row, aliases) {
  const normalizedAliases = aliases.map(normalizeText)

  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.includes(normalizeText(key)) && String(value ?? '').trim()) {
      return String(value).trim()
    }
  }

  return ''
}

function buildSpecs(row) {
  const blockedKeys = Object.values(FIELD_ALIASES).flat().map(normalizeText)
  const specs = {}

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeText(key)
    if (blockedKeys.includes(normalizedKey)) return
    if (!String(value ?? '').trim()) return
    specs[key] = String(value).trim()
  })

  return specs
}

function normalizeInventoryRow(row, index) {
  const brand = findField(row, FIELD_ALIASES.brand) || 'Sin marca'
  const model = findField(row, FIELD_ALIASES.model) || 'Sin modelo'
  const year = findField(row, FIELD_ALIASES.year)
  const price = parsePrice(findField(row, FIELD_ALIASES.price))
  const mileage = findField(row, FIELD_ALIASES.mileage)
  const location = findField(row, FIELD_ALIASES.location) || 'Sin ubicacion'
  const status = findField(row, FIELD_ALIASES.status) || 'Disponible'
  const image = findField(row, FIELD_ALIASES.image)

  return {
    id: `unit-${index + 1}`,
    brand,
    model,
    year,
    price,
    mileage,
    location,
    status,
    image,
    specs: buildSpecs(row),
  }
}

export async function fetchInventoryFromCsv(csvUrl = INVENTORY_CSV_URL) {
  if (!csvUrl || csvUrl === 'PEGAR_AQUI_URL_CSV_PUBLICA') {
    throw new Error('CSV_URL_NOT_CONFIGURED')
  }

  const response = await fetch(csvUrl, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`CSV_FETCH_FAILED_${response.status}`)
  }

  const csvText = await response.text()
  const parsedRows = parseCsv(csvText)

  return parsedRows.map((row, index) => normalizeInventoryRow(row, index))
}

export function saveInventoryCache(inventory) {
  localStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(inventory))
  localStorage.setItem(INVENTORY_LAST_UPDATED_KEY, new Date().toISOString())
}

export function getInventoryCache() {
  const rawCache = localStorage.getItem(INVENTORY_CACHE_KEY)
  const lastUpdated = localStorage.getItem(INVENTORY_LAST_UPDATED_KEY)

  if (!rawCache) {
    return { items: [], lastUpdated: lastUpdated ?? null }
  }

  try {
    const items = JSON.parse(rawCache)
    return { items: Array.isArray(items) ? items : [], lastUpdated: lastUpdated ?? null }
  } catch (error) {
    return { items: [], lastUpdated: lastUpdated ?? null }
  }
}
