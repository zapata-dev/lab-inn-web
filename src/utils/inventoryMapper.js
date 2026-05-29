function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function toCanonicalKey(key) {
  return normalizeText(key).replace(/[^a-z0-9]/g, '')
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function parseNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

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

function parseBoolean(value) {
  if (typeof value === 'boolean') return value

  const normalized = normalizeText(value)
  if (!normalized) return null

  if (['1', 'true', 'si', 'sí', 'yes', 'promo', 'promocion', 'promocionactiva'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'none', 'ninguna', 'sinpromocion'].includes(normalized)) {
    return false
  }

  return null
}

function toArray(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item ?? '').trim()).filter(Boolean))]
  }

  const text = String(value ?? '').trim()
  if (!text) return []

  if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.map((item) => String(item ?? '').trim()).filter(Boolean))]
      }
    } catch (_) {
      // fallback regex/comma split
    }
  }

  const urls = text.match(/https?:\/\/[^\s,"]+/g)
  if (urls && urls.length) {
    return [...new Set(urls.map((item) => item.trim()).filter(Boolean))]
  }

  return [...new Set(text.split(/[|,;\n]/g).map((item) => item.trim()).filter(Boolean))]
}

function getKeyMap(source) {
  const keyMap = new Map()

  if (!isPlainObject(source)) return keyMap

  Object.keys(source).forEach((key) => {
    keyMap.set(toCanonicalKey(key), key)
  })

  return keyMap
}

function getValueByAliases(source, aliases) {
  if (!isPlainObject(source)) return ''

  const keyMap = getKeyMap(source)

  for (const alias of aliases) {
    const canonical = toCanonicalKey(alias)
    const originalKey = keyMap.get(canonical)
    if (!originalKey) continue

    const value = source[originalKey]
    if (value == null) continue

    const text = String(value).trim()
    if (!text && typeof value !== 'number' && typeof value !== 'boolean') continue

    return value
  }

  return ''
}

const FIELD_ALIASES = {
  vin: ['vin', 'vincompleto', 'serie', 'serievin', 'numerodeserie'],
  marca: ['marca', 'brand'],
  modelo: ['modelo', 'model'],
  anio: ['anio', 'ano', 'año', 'year'],
  sucursalId: ['sucursalid', 'branchid', 'sucursal', 'ubicacionid', 'centro', 'locationid'],
  sucursalNombre: ['sucursalnombre', 'branchname', 'ubicacion', 'centronombre', 'branch'],
  precio: ['precio', 'price', 'precioventa', 'preciofinal'],
  status: ['status', 'estado', 'estatus'],
  promocion: ['promocion', 'promotion', 'promo'],
  fotos: ['fotos', 'images', 'imagenes', 'photos', 'urlsfotos'],
  configuracion: ['configuracion', 'configuration'],
  engine: ['motor', 'engine'],
  transmission: ['transmision', 'transmission'],
  mileageKm: ['kilometros', 'kilometraje', 'mileagekm', 'mileage'],
  color: ['color'],
  fuente: ['fuente', 'source'],
}

export function getUnitVin(unit) {
  return String(getValueByAliases(unit, FIELD_ALIASES.vin) || unit?.id || '').trim().toUpperCase()
}

export function getUnitBranchId(unit) {
  return String(getValueByAliases(unit, FIELD_ALIASES.sucursalId) || '').trim()
}

export function getUnitBranchName(unit) {
  return String(getValueByAliases(unit, FIELD_ALIASES.sucursalNombre) || '').trim()
}

export function getUnitPrice(unit) {
  return parseNumber(getValueByAliases(unit, FIELD_ALIASES.precio))
}

function normalizeStatus(value) {
  const normalized = normalizeText(value)

  if (!normalized) return 'available'
  if (['disponible', 'available', 'enstock'].includes(normalized)) return 'available'
  if (['reservado', 'reserved', 'apartado'].includes(normalized)) return 'reserved'
  if (['mantenimiento', 'maintenance', 'taller'].includes(normalized)) return 'maintenance'
  if (['demo', 'demostracion', 'demostracionactiva'].includes(normalized)) return 'demo'

  return String(value || 'available').trim().toLowerCase().replace(/\s+/g, '_')
}

export function normalizeInventoryUnit(unit) {
  const source = isPlainObject(unit) ? unit : {}

  const vin = getUnitVin(source)
  const marca = String(getValueByAliases(source, FIELD_ALIASES.marca) || source.brand || source.marca || '').trim()
  const modelo = String(getValueByAliases(source, FIELD_ALIASES.modelo) || source.model || source.modelo || '').trim()
  const anioRaw = getValueByAliases(source, FIELD_ALIASES.anio)
  const anio = parseNumber(anioRaw)
  const sucursalId = getUnitBranchId(source)
  const sucursalNombre = getUnitBranchName(source)
  const precio = getUnitPrice(source)
  const status = normalizeStatus(getValueByAliases(source, FIELD_ALIASES.status) || source.status)
  const promoValue = getValueByAliases(source, FIELD_ALIASES.promocion)
  const promocionBoolean = parseBoolean(promoValue)
  const fotos = toArray(getValueByAliases(source, FIELD_ALIASES.fotos) || source.fotos)
  const configuracion = String(
    getValueByAliases(source, FIELD_ALIASES.configuracion) || source.configuration || source.configuracion || ''
  ).trim()
  const engine = String(getValueByAliases(source, FIELD_ALIASES.engine) || source.engine || source.motor || '').trim()
  const transmission = String(
    getValueByAliases(source, FIELD_ALIASES.transmission) || source.transmission || source.transmision || ''
  ).trim()
  const mileage = parseNumber(getValueByAliases(source, FIELD_ALIASES.mileageKm) || source.mileageKm || source.kilometros)
  const color = String(getValueByAliases(source, FIELD_ALIASES.color) || source.color || '').trim()
  const fuente = String(getValueByAliases(source, FIELD_ALIASES.fuente) || source.fuente || '').trim() || 'unknown'

  return {
    id: vin || String(source.id || '').trim(),
    vin,
    marca,
    brand: marca,
    modelo,
    model: modelo,
    anio: anio != null ? Math.round(anio) : null,
    year: anio != null ? Math.round(anio) : null,
    sucursalId,
    branchId: sucursalId,
    sucursalNombre,
    branchName: sucursalNombre,
    precio,
    priceUsd: precio,
    status,
    promocion: promocionBoolean != null ? promocionBoolean : Boolean(String(promoValue || '').trim()),
    fotos,
    configuracion,
    configuration: configuracion,
    engine,
    motor: engine,
    transmission,
    transmision: transmission,
    mileageKm: mileage,
    kilometros: mileage,
    color,
    fuente,
    lastImportedAt: source.lastImportedAt || null,
    updatedAt: source.updatedAt || null,
    raw: source,
  }
}

export function normalizeInventoryRow(row) {
  return normalizeInventoryUnit(row)
}

export function isValidInventoryUnit(unit) {
  const normalized = normalizeInventoryUnit(unit)
  return Boolean(normalized.vin)
}
