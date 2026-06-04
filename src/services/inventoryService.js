export const INVENTORY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTynebu-ZV4N2ehHI_Zktji7CVhT49C8_j5X0BQ0J0wQ5Vj8RmmaFvA-jqWBMMSA1kn7L12Aq-OASUy/pub?output=csv'
export const INVENTORY_CACHE_KEY = 'lab:v1:inventory_cache'
export const INVENTORY_LAST_UPDATED_KEY = 'lab:v1:inventory_last_updated'

export const INVENTORY_FILTER_FIELDS = [
  { key: 'marca', label: 'Marca', type: 'select' },
  { key: 'modelo', label: 'Modelo', type: 'select' },
  { key: 'anio', label: 'AÑO', type: 'select' },
  { key: 'precio', label: 'Precio', type: 'numberRange' },
  { key: 'ubicacion', label: 'Ubicacion / sucursal', type: 'select' },
  { key: 'subempresa', label: 'Subempresa', type: 'select' },
  { key: 'status', label: 'Status', type: 'select' },
  { key: 'paso', label: 'Paso', type: 'select' },
  { key: 'rodada', label: 'Rodada', type: 'select' },
  { key: 'motor', label: 'Motor', type: 'select' },
  { key: 'transmision', label: 'Transmision', type: 'select' },
  { key: 'kilometros', label: 'Kilometraje', type: 'numberRange' },
  { key: 'cabina', label: 'Cabina', type: 'select' },
  { key: 'configuracion', label: 'Configuracion', type: 'select' },
  { key: 'tipoUnidad', label: 'Tipo de unidad', type: 'select' },
  { key: 'suspension', label: 'Suspension', type: 'select' },
  { key: 'potenciaHp', label: 'Potencia HP', type: 'select' },
  { key: 'torque', label: 'Torque', type: 'select' },
  { key: 'numeroEjes', label: 'Numero de ejes', type: 'select' },
  { key: 'tipoCombustible', label: 'Tipo de combustible', type: 'select' },
  { key: 'traccion', label: 'Traccion', type: 'select' },
  { key: 'capacidadCarga', label: 'Capacidad de carga', type: 'select' },
  { key: 'sleeperDaycab', label: 'Sleeper / daycab', type: 'select' },
  { key: 'color', label: 'Color', type: 'select' },
  { key: 'vin', label: 'VIN', type: 'text' },
  { key: 'placas', label: 'Placas', type: 'text' },
  { key: 'cajaRemolque', label: 'Caja / remolque', type: 'select' },
  { key: 'promocion', label: 'Promocion', type: 'select' },
]

const BASE_HEADER_MAP = {
  vinCompleto: 'vinCompleto',
  vin: 'vin',
  centro: 'centro',
  ubicacionFisica: 'ubicacionFisica',
  marca: 'marca',
  modelo: 'modelo',
  cilindros: 'cilindros',
  color: 'color',
  colorInterior: 'colorInterior',
  ano: 'anio',
  precioSugDeVenta: 'precioRaw',
  kilometros: 'kilometrosRaw',
  motor: 'motor',
  transmision: 'transmision',
  paso: 'paso',
  rodada: 'rodada',
  ejeDelantera: 'ejeDelantero',
  ejeTrasera: 'ejeTrasero',
  dormitorio: 'dormitorio',
  subempresa: 'subempresa',
  promocion: 'promocion',
  codigo: 'codigo',
  imagenPortada: 'imagenPortadaRaw',
  imagenesCompletas: 'imagenesCompletasRaw',
}

const OPTIONAL_COLUMN_ALIASES = {
  subempresa: ['subempresa'],
  codigo: ['codigo', 'Codigo', 'Código', 'CODIGO', 'codigoPromocion', 'codigoPromo'],
  cabina: ['cabina'],
  configuracion: ['configuracion'],
  tipoUnidad: ['tipoUnidad', 'tipoDeUnidad', 'tipo'],
  suspension: ['suspension'],
  potenciaHp: ['potenciaHp', 'hp', 'horsepower'],
  torque: ['torque'],
  numeroEjes: ['numeroDeEjes', 'ejes'],
  tipoCombustible: ['tipoDeCombustible', 'combustible'],
  traccion: ['traccion'],
  capacidadCarga: ['capacidadDeCarga', 'payload'],
  sleeperDaycab: ['sleeper', 'daycab'],
  placas: ['placas', 'placa'],
  cajaRemolque: ['caja', 'remolque', 'cajaRemolque'],
  descripcion: ['descripcion', 'descripcionComercial'],
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function logInventoryDebug(message, details) {
  if (!import.meta.env.DEV) return

  if (typeof details === 'undefined') {
    console.info('[LAB][inventory]', message)
    return
  }

  console.info('[LAB][inventory]', message, details)
}

export function normalizeHeader(header) {
  const cleaned = normalizeText(header).replace(/[^a-z0-9]+/g, ' ').trim()
  if (!cleaned) return ''

  const words = cleaned.split(/\s+/)
  return words
    .map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
    .join('')
}

function parseCsv(csvText) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index]
    const nextCharacter = csvText[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (character === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      row.push(cell.trim())
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += character
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim())
    rows.push(row)
  }

  return rows.filter((parsedRow) => parsedRow.some((value) => String(value).trim().length > 0))
}

function parseNumber(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.,-]/g, '')
  if (!cleaned) return null

  let normalized = cleaned

  if (cleaned.includes('.') && cleaned.includes(',')) {
    normalized = cleaned.replace(/,/g, '')
  } else if (cleaned.includes(',')) {
    const commaCount = (cleaned.match(/,/g) || []).length
    const [left = '', right = ''] = cleaned.split(',')
    const isThousandsSeparator = commaCount > 1 || (right.length === 3 && left.length >= 1)
    normalized = isThousandsSeparator ? cleaned.replace(/,/g, '') : cleaned.replace(',', '.')
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

function normalizeIntegerLike(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''

  if (/^-?\d+\.0+$/.test(text)) {
    return text.split('.')[0]
  }

  return text
}

function getFirstNotEmpty(row, keys) {
  for (const key of keys) {
    const value = String(row[key] ?? '').trim()
    if (value) return value
  }

  return ''
}

function splitImageUrls(value) {
  const text = String(value ?? '').trim()
  if (!text) return []

  const urls = text.match(/https?:\/\/[^\s,"]+/g)
  if (!urls) return []

  return [...new Set(urls)]
}

function getCodigoFromCachedUnit(unit) {
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

function mapRowToUnit(rawRow, index) {
  const precioNumber = parseNumber(rawRow.precioRaw)
  const kilometrosNumber = parseNumber(rawRow.kilometrosRaw)
  const imagenesCompletas = splitImageUrls(rawRow.imagenesCompletasRaw)
  const imagenPortada = splitImageUrls(rawRow.imagenPortadaRaw)[0] || imagenesCompletas[0] || ''
  const optionalFields = {}

  Object.entries(OPTIONAL_COLUMN_ALIASES).forEach(([targetKey, aliases]) => {
    const value = getFirstNotEmpty(rawRow, aliases)
    if (value) optionalFields[targetKey] = value
  })

  const marca = String(rawRow.marca ?? '').trim()
  const modelo = normalizeIntegerLike(rawRow.modelo)
  const anio = normalizeIntegerLike(rawRow.anio)
  const cilindros = normalizeIntegerLike(rawRow.cilindros)
  const vinCompleto = String(rawRow.vinCompleto ?? '').trim()
  const vin = String(rawRow.vin ?? '').trim()
  const codigo = getFirstNotEmpty(rawRow, ['codigo', 'Codigo', 'Código', 'CODIGO', 'codigoPromocion', 'codigoPromo'])

  return {
    id: vinCompleto || vin || `unit-${index + 1}`,
    vinCompleto,
    vin,
    marca,
    modelo,
    anio,
    precio: precioNumber,
    kilometros: kilometrosNumber,
    motor: String(rawRow.motor ?? '').trim(),
    transmision: String(rawRow.transmision ?? '').trim(),
    paso: String(rawRow.paso ?? '').trim(),
    rodada: String(rawRow.rodada ?? '').trim(),
    ejeDelantero: String(rawRow.ejeDelantero ?? '').trim(),
    ejeTrasero: String(rawRow.ejeTrasero ?? '').trim(),
    dormitorio: String(rawRow.dormitorio ?? '').trim(),
    color: String(rawRow.color ?? '').trim(),
    colorInterior: String(rawRow.colorInterior ?? '').trim(),
    cilindros,
    subempresa: String(rawRow.subempresa ?? '').trim(),
    codigo: String(codigo).trim(),
    promocion: String(rawRow.promocion ?? '').trim(),
    ubicacion: String(rawRow.ubicacionFisica ?? '').trim() || String(rawRow.centro ?? '').trim(),
    centro: String(rawRow.centro ?? '').trim(),
    status: 'Disponible',
    imagenPortada,
    imagenesCompletas,
    raw: rawRow,
    ...optionalFields,
  }
}

function normalizeRows(parsedRows) {
  if (!parsedRows.length) return []

  const headerRow = parsedRows[0]
  const normalizedHeaders = headerRow.map((header) => normalizeHeader(header))

  const normalizedUnits = parsedRows.slice(1).map((row, rowIndex) => {
    const normalizedRow = {}

    normalizedHeaders.forEach((normalizedHeader, columnIndex) => {
      const mappedKey = BASE_HEADER_MAP[normalizedHeader] ?? normalizedHeader
      normalizedRow[mappedKey] = String(row[columnIndex] ?? '').trim()
    })

    return mapRowToUnit(normalizedRow, rowIndex)
  })

  logInventoryDebug('CSV de inventario procesado', {
    headersCount: normalizedHeaders.length,
    rowsCount: normalizedUnits.length,
  })

  return normalizedUnits
}

export async function fetchInventoryFromCsv(csvUrl = INVENTORY_CSV_URL) {
  const response = await fetch(csvUrl, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`CSV_FETCH_FAILED_${response.status}`)
  }

  const csvText = await response.text()
  const parsedRows = parseCsv(csvText)

  return normalizeRows(parsedRows)
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
    const normalizedItems = Array.isArray(items)
      ? items.map((unit) => ({
          ...unit,
          codigo: getCodigoFromCachedUnit(unit),
        }))
      : []
    return { items: normalizedItems, lastUpdated: lastUpdated ?? null }
  } catch (error) {
    return { items: [], lastUpdated: lastUpdated ?? null }
  }
}
