import { FieldValue } from 'firebase-admin/firestore'

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

  if (['1', 'true', 'si', 'yes', 'promo', 'promocion', 'promocionactiva'].includes(normalized)) return true
  if (['0', 'false', 'no', 'none', 'ninguna', 'sinpromocion'].includes(normalized)) return false

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
      // ignore and fallback
    }
  }

  const urls = text.match(/https?:\/\/[^\s,"]+/g)
  if (urls && urls.length) {
    return [...new Set(urls.map((item) => item.trim()).filter(Boolean))]
  }

  return [...new Set(text.split(/[|,;\n]/g).map((item) => item.trim()).filter(Boolean))]
}

function getKeyMap(source) {
  const map = new Map()
  if (!isPlainObject(source)) return map

  Object.keys(source).forEach((key) => {
    map.set(toCanonicalKey(key), key)
  })

  return map
}

function getValueByAliases(source, aliases) {
  if (!isPlainObject(source)) return ''

  const keyMap = getKeyMap(source)

  for (const alias of aliases) {
    const originalKey = keyMap.get(toCanonicalKey(alias))
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
  vin: ['vin', 'vinCompleto', 'serie', 'numeroDeSerie', 'serialNumber'],
  marca: ['marca', 'brand'],
  modelo: ['modelo', 'model'],
  anio: ['anio', 'ano', 'año', 'year'],
  sucursalId: ['sucursalId', 'branchId', 'sucursal', 'centro'],
  sucursalNombre: ['sucursalNombre', 'branchName', 'ubicacion', 'sucursal'],
  precio: ['precio', 'price', 'precioVenta'],
  status: ['status', 'estado', 'estatus'],
  promocion: ['promocion', 'promotion', 'promo'],
  fotos: ['fotos', 'images', 'imagenes', 'photos'],
  configuracion: ['configuracion', 'configuration'],
}

function normalizeStatus(value) {
  const normalized = normalizeText(value)

  if (!normalized) return 'available'
  if (['disponible', 'available', 'enstock'].includes(normalized)) return 'available'
  if (['reservado', 'reserved', 'apartado'].includes(normalized)) return 'reserved'
  if (['mantenimiento', 'maintenance', 'taller'].includes(normalized)) return 'maintenance'
  if (['demo', 'demostracion'].includes(normalized)) return 'demo'

  return String(value || 'available').trim().toLowerCase().replace(/\s+/g, '_')
}

export function getUnitVin(unit) {
  return String(getValueByAliases(unit, FIELD_ALIASES.vin) || unit?.id || '').trim().toUpperCase()
}

export function normalizeInventoryRow(row) {
  const source = isPlainObject(row) ? row : {}
  const vin = getUnitVin(source)

  const marca = String(getValueByAliases(source, FIELD_ALIASES.marca) || '').trim()
  const modelo = String(getValueByAliases(source, FIELD_ALIASES.modelo) || '').trim()
  const anioNumber = parseNumber(getValueByAliases(source, FIELD_ALIASES.anio))
  const sucursalId = String(getValueByAliases(source, FIELD_ALIASES.sucursalId) || '').trim()
  const sucursalNombre = String(getValueByAliases(source, FIELD_ALIASES.sucursalNombre) || '').trim()
  const precio = parseNumber(getValueByAliases(source, FIELD_ALIASES.precio))
  const status = normalizeStatus(getValueByAliases(source, FIELD_ALIASES.status))
  const promoRaw = getValueByAliases(source, FIELD_ALIASES.promocion)
  const promocionBoolean = parseBoolean(promoRaw)
  const fotos = toArray(getValueByAliases(source, FIELD_ALIASES.fotos))
  const configuracion = String(getValueByAliases(source, FIELD_ALIASES.configuracion) || '').trim()

  return {
    vin,
    marca,
    modelo,
    anio: anioNumber != null ? Math.round(anioNumber) : null,
    sucursalId,
    sucursalNombre,
    precio,
    status,
    promocion: promocionBoolean != null ? promocionBoolean : Boolean(String(promoRaw || '').trim()),
    fotos,
    configuracion,
    rawSource: source,
  }
}

export function isValidInventoryUnit(unit) {
  const normalized = normalizeInventoryRow(unit)
  return Boolean(normalized.vin)
}

export function buildInventoryDoc(unit, importContext = {}) {
  const normalized = normalizeInventoryRow(unit)
  const timestamp = importContext.serverTimestamp || FieldValue.serverTimestamp()
  const source = String(importContext.sourceName || importContext.source || normalized.fuente || 'csv').trim() || 'csv'
  const qualityResult = importContext.qualityResult || null
  const importId = importContext.importId || null

  return {
    vin: normalized.vin,
    marca: normalized.marca,
    modelo: normalized.modelo,
    anio: normalized.anio,
    sucursalId: normalized.sucursalId,
    sucursalNombre: normalized.sucursalNombre,
    precio: normalized.precio,
    status: normalized.status,
    promocion: normalized.promocion,
    fotos: normalized.fotos,
    configuracion: normalized.configuracion,
    fuente: source,
    lastImportedAt: timestamp,
    updatedAt: timestamp,
    rawSource: normalized.rawSource,

    // Import tracking (LAB-PROD-016)
    importId,
    importStatus: 'active',
    presentInLatestImport: true,
    lastSeenImportId: importId,
    lastSeenAt: timestamp,
    missingSinceImportId: null,
    missingSinceAt: null,

    // Data quality (LAB-PROD-016)
    dataQualityWarnings: qualityResult ? qualityResult.warnings.map((w) => w.type) : [],
    dataQualityScore: qualityResult ? qualityResult.score : 100,
  }
}
