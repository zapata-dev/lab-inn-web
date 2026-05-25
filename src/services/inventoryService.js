export const INVENTORY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTynebu-ZV4N2ehHI_Zktji7CVhT49C8_j5X0BQ0J0wQ5Vj8RmmaFvA-jqWBMMSA1kn7L12Aq-OASUy/pub?output=csv'
export const INVENTORY_CACHE_KEY = 'lab:v1:inventory_cache'
export const INVENTORY_LAST_UPDATED_KEY = 'lab:v1:inventory_last_updated'

export const INVENTORY_FILTER_FIELDS = [
  { key: 'brand', label: 'Marca', type: 'select' },
  { key: 'model', label: 'Modelo', type: 'select' },
  { key: 'year', label: 'Ano', type: 'select' },
  { key: 'price', label: 'Precio', type: 'numberRange' },
  { key: 'location', label: 'Ubicacion / sucursal', type: 'select' },
  { key: 'status', label: 'Status', type: 'select' },
  { key: 'paso', label: 'Paso', type: 'select' },
  { key: 'rodada', label: 'Rodada', type: 'select' },
  { key: 'motor', label: 'Motor', type: 'select' },
  { key: 'transmission', label: 'Transmision', type: 'select' },
  { key: 'cabina', label: 'Cabina', type: 'select' },
  { key: 'configuration', label: 'Configuracion', type: 'select' },
  { key: 'mileage', label: 'Kilometraje', type: 'numberRange' },
  { key: 'unitType', label: 'Tipo de unidad', type: 'select' },
  { key: 'suspension', label: 'Suspension', type: 'select' },
  { key: 'horsepower', label: 'Potencia HP', type: 'select' },
  { key: 'torque', label: 'Torque', type: 'select' },
  { key: 'axles', label: 'Numero de ejes', type: 'select' },
  { key: 'fuelType', label: 'Tipo de combustible', type: 'select' },
  { key: 'traction', label: 'Traccion', type: 'select' },
  { key: 'payload', label: 'Capacidad de carga', type: 'select' },
  { key: 'sleeper', label: 'Sleeper / daycab', type: 'select' },
  { key: 'color', label: 'Color', type: 'select' },
  { key: 'vin', label: 'VIN', type: 'text' },
  { key: 'plates', label: 'Placas', type: 'text' },
  { key: 'boxTrailer', label: 'Caja / remolque', type: 'select' },
]

const FIELD_ALIASES = {
  brand: ['marca', 'brand'],
  model: ['modelo', 'model'],
  year: ['ano', 'anio', 'year'],
  price: ['precio sug. de venta', 'precio', 'price', 'valor'],
  location: ['ubicacion fisica', 'ubicacion', 'sucursal', 'centro', 'location'],
  status: ['status', 'estado', 'disponibilidad', 'promocion'],
  mileage: ['kilometraje', 'kilometros', 'km', 'kms', 'mileage'],
  paso: ['paso'],
  rodada: ['rodada'],
  motor: ['motor'],
  transmission: ['transmision', 'transmission', 'caja'],
  cabina: ['cabina'],
  configuration: ['configuracion'],
  unitType: ['tipo de unidad', 'tipo unidad', 'tipo'],
  suspension: ['suspension'],
  horsepower: ['potencia hp', 'hp', 'horsepower'],
  torque: ['torque'],
  axles: ['numero de ejes', 'ejes', 'axles'],
  fuelType: ['combustible', 'tipo de combustible', 'fuel'],
  traction: ['traccion', 'traction'],
  payload: ['capacidad de carga', 'payload'],
  sleeper: ['sleeper', 'daycab', 'dormitorio'],
  color: ['color'],
  vin: ['vin completo', 'vin'],
  plates: ['placas', 'placa'],
  boxTrailer: ['caja', 'remolque', 'caja / remolque'],
  description: ['descripcion', 'descripcion comercial'],
  image: ['imagen portada', 'foto', 'imagen', 'image', 'photo', 'url imagen', 'image url'],
  gallery: ['imagenes completas', 'galeria'],
  engineCylinders: ['cilindros'],
  interiorColor: ['color interior'],
  frontAxle: ['eje delantera'],
  rearAxle: ['eje trasera'],
  company: ['subempresa'],
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function parseNumber(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.,-]/g, '')
  if (!cleaned) return null

  const normalized = cleaned.includes(',') && cleaned.includes('.')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(/,/g, '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

function getFirstUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''

  const matchedUrl = text.match(/https?:\/\/[^\s,]+/i)
  return matchedUrl ? matchedUrl[0] : text
}

function findField(row, aliases) {
  const normalizedAliases = aliases.map(normalizeText)

  for (const [key, value] of Object.entries(row)) {
    if (!normalizedAliases.includes(normalizeText(key))) continue

    const formattedValue = String(value ?? '').trim()
    if (!formattedValue) continue

    return formattedValue
  }

  return ''
}

function cleanSelectValue(value) {
  return String(value ?? '').trim()
}

function buildSpecs(row, usedKeys) {
  const specs = {}

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeText(key)
    if (usedKeys.has(normalizedKey)) return

    const cleaned = String(value ?? '').trim()
    if (!cleaned) return

    specs[key] = cleaned
  })

  return specs
}

function normalizeInventoryRow(row, index) {
  const usedKeys = new Set()
  const valueMap = {}

  Object.entries(FIELD_ALIASES).forEach(([fieldKey, aliases]) => {
    const value = findField(row, aliases)
    valueMap[fieldKey] = value
    aliases.forEach((alias) => usedKeys.add(normalizeText(alias)))
  })

  const rawPrice = parseNumber(valueMap.price)
  const rawMileage = parseNumber(valueMap.mileage)
  const image = getFirstUrl(valueMap.image || valueMap.gallery)

  const unitType =
    valueMap.unitType || valueMap.configuration || valueMap.company || (valueMap.paso ? 'Tractocamion' : '')

  return {
    id: `unit-${index + 1}`,
    brand: cleanSelectValue(valueMap.brand) || 'Sin marca',
    model: cleanSelectValue(valueMap.model) || 'Sin modelo',
    year: cleanSelectValue(valueMap.year),
    price: rawPrice ?? 0,
    location: cleanSelectValue(valueMap.location) || 'Sin ubicacion',
    status: cleanSelectValue(valueMap.status) || 'Disponible',
    mileage: cleanSelectValue(valueMap.mileage),
    mileageValue: rawMileage,
    paso: cleanSelectValue(valueMap.paso),
    rodada: cleanSelectValue(valueMap.rodada),
    motor: cleanSelectValue(valueMap.motor),
    transmission: cleanSelectValue(valueMap.transmission),
    cabina: cleanSelectValue(valueMap.cabina),
    configuration: cleanSelectValue(valueMap.configuration),
    unitType: cleanSelectValue(unitType),
    suspension: cleanSelectValue(valueMap.suspension),
    horsepower: cleanSelectValue(valueMap.horsepower),
    torque: cleanSelectValue(valueMap.torque),
    axles: cleanSelectValue(valueMap.axles),
    fuelType: cleanSelectValue(valueMap.fuelType),
    traction: cleanSelectValue(valueMap.traction),
    payload: cleanSelectValue(valueMap.payload),
    sleeper: cleanSelectValue(valueMap.sleeper),
    color: cleanSelectValue(valueMap.color),
    vin: cleanSelectValue(valueMap.vin),
    plates: cleanSelectValue(valueMap.plates),
    boxTrailer: cleanSelectValue(valueMap.boxTrailer),
    description: cleanSelectValue(valueMap.description),
    image,
    specs: buildSpecs(row, usedKeys),
  }
}

export async function fetchInventoryFromCsv(csvUrl = INVENTORY_CSV_URL) {
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
