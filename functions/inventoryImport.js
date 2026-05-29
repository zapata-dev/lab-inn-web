import { FieldValue, getFirestore } from 'firebase-admin/firestore'

import { parseCsv } from './csvParser.js'
import { buildInventoryDoc, normalizeInventoryRow } from './inventoryMapper.js'
import { groupErrorsByType, groupWarningsByType, validateInventoryUnit } from './inventoryQuality.js'
import {
  buildMissingUnitUpdates,
  computeInventoryDrift,
  countPromotions,
  getExistingInventorySnapshot,
  summarizeUnitsByBranch,
} from './inventoryDrift.js'

const db = getFirestore()
const INVENTORY_COLLECTION = 'inventario'
const IMPORTS_COLLECTION = 'importsInventario'
const DEFAULT_SOURCE_NAME = 'csv'

function buildImportId() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  const yyyy = now.getFullYear()
  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const hh = pad(now.getHours())
  const min = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  return `import_${yyyy}${mm}${dd}_${hh}${min}${ss}`
}

function sanitizeSourceName(sourceUrl = '') {
  const text = String(sourceUrl || '').trim()
  if (!text) return 'inventory-source'

  try {
    const parsed = new URL(text)
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    const filename = pathParts[pathParts.length - 1] || parsed.hostname || 'inventory-source'
    return filename.slice(0, 120)
  } catch (_) {
    return text.slice(0, 120)
  }
}

function buildErrorSummary(errors = []) {
  if (!errors.length) return null

  const firstItems = errors.slice(0, 10).map((errorItem) => {
    const rowIndex = Number(errorItem.rowIndex || 0) + 1
    return `fila ${rowIndex}: ${errorItem.reason || errorItem.type || 'error'}`
  })

  const suffix = errors.length > 10 ? ` (+${errors.length - 10} mas)` : ''
  return `${firstItems.join(' | ')}${suffix}`.slice(0, 1000)
}

export function chunkArray(items = [], size = 400) {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 400
  const chunks = []

  for (let index = 0; index < items.length; index += safeSize) {
    chunks.push(items.slice(index, index + safeSize))
  }

  return chunks
}

export async function createImportLogStart({ importId, sourceUrl, sourceName, triggeredBy }) {
  const importRef = db.collection(IMPORTS_COLLECTION).doc(importId)
  const resolvedSourceName = String(sourceName || sanitizeSourceName(sourceUrl) || DEFAULT_SOURCE_NAME).trim()

  await importRef.set(
    {
      importId,
      fuente: String(sourceUrl || '').trim() || resolvedSourceName,
      archivoNombre: resolvedSourceName,
      totalRegistros: 0,
      registrosCreados: 0,
      registrosActualizados: 0,
      registrosUpserted: 0,
      registrosConError: 0,
      registrosAusentes: 0,
      status: 'procesando',
      errorResumen: null,
      startedAt: FieldValue.serverTimestamp(),
      finishedAt: null,
      createdBy: String(triggeredBy || 'system').trim() || 'system',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  return importRef
}

export async function updateImportLogResult({ importId, patch }) {
  const importRef = db.collection(IMPORTS_COLLECTION).doc(importId)

  await importRef.set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
      finishedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}

export async function importInventoryFromCsvUrl({ sourceUrl, triggeredBy = 'system', importId = null, sourceName = '' }) {
  const resolvedUrl = String(sourceUrl || '').trim()
  if (!resolvedUrl) {
    throw new Error('INVENTORY_IMPORT_SOURCE_URL_REQUIRED')
  }

  const response = await fetch(resolvedUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`INVENTORY_IMPORT_FETCH_FAILED_${response.status}`)
  }

  const csvText = await response.text()
  const rows = parseCsv(csvText)

  const validUnits = []
  const rowErrors = []
  const allWarnings = []
  const allErrors = []
  const qualityByVin = new Map()

  rows.forEach((row, rowIndex) => {
    try {
      const normalized = normalizeInventoryRow(row)
      const qualityResult = validateInventoryUnit(normalized, rowIndex)

      if (!qualityResult.valid) {
        const firstError = qualityResult.errors[0] || {}
        rowErrors.push({ rowIndex, reason: firstError.type || 'validation_failed', errors: qualityResult.errors })
        allErrors.push(...qualityResult.errors)
        return
      }

      validUnits.push(normalized)
      allWarnings.push(...qualityResult.warnings)
      qualityByVin.set(normalized.vin, qualityResult)
    } catch (error) {
      rowErrors.push({ rowIndex, reason: String(error?.message || 'normalize_failed').slice(0, 160) })
    }
  })

  // Read existing inventory snapshot once to compute drift and skip per-chunk reads
  const existingInventory = await getExistingInventorySnapshot(db)
  const drift = computeInventoryDrift({ existingInventory, importedUnits: validUnits })

  // Upsert valid units
  let registrosCreados = 0
  let registrosActualizados = 0
  const chunkedUnits = chunkArray(validUnits, 400)

  for (const unitsChunk of chunkedUnits) {
    const batch = db.batch()

    for (const unit of unitsChunk) {
      const docRef = db.collection(INVENTORY_COLLECTION).doc(unit.vin)
      const isNew = !existingInventory.has(unit.vin)

      if (isNew) {
        registrosCreados += 1
      } else {
        registrosActualizados += 1
      }

      const qualityResult = qualityByVin.get(unit.vin) || null
      const docData = buildInventoryDoc(unit, {
        sourceName: sourceName || DEFAULT_SOURCE_NAME,
        sourceUrl: resolvedUrl,
        importId,
        qualityResult,
      })

      batch.set(docRef, docData, { merge: true })
    }

    if (unitsChunk.length) {
      await batch.commit()
    }
  }

  // Mark absent units as missing without deleting them.
  // Only runs when the import had valid data to avoid marking everything missing on empty CSV.
  if (drift.ausentesVins.length > 0 && validUnits.length > 0) {
    const absentUnits = drift.ausentesVins.map((vin) => ({
      vin,
      ...(existingInventory.get(vin) || {}),
    }))

    const missingUpdates = buildMissingUnitUpdates({ missingUnits: absentUnits, importId })
    const chunkedMissing = chunkArray(missingUpdates, 400)

    for (const missingChunk of chunkedMissing) {
      const batch = db.batch()
      for (const { vin, update } of missingChunk) {
        const docRef = db.collection(INVENTORY_COLLECTION).doc(vin)
        batch.set(docRef, update, { merge: true })
      }
      await batch.commit()
    }
  }

  // Build quality summary
  const scores = validUnits.map((u) => qualityByVin.get(u.vin)?.score ?? 100)
  const promedioScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100

  const calidadResumen = {
    filasValidas: validUnits.length,
    filasInvalidas: rowErrors.length,
    promedioScore,
    warnings: allWarnings.length,
  }

  const driftResumen = {
    nuevas: drift.nuevas,
    actualizadas: drift.actualizadas,
    ausentes: drift.ausentes,
    errores: rowErrors.length,
    totalPrevio: drift.totalPrevio,
    totalActual: drift.totalActual,
  }

  const hasWarnings = allWarnings.length > 0
  const hasErrors = rowErrors.length > 0
  const status = hasErrors ? 'completado_con_errores' : 'completado'

  return {
    importId,
    triggeredBy,
    sourceUrl: resolvedUrl,
    sourceName: sourceName || DEFAULT_SOURCE_NAME,
    totalRegistros: rows.length,
    registrosCreados,
    registrosActualizados,
    registrosUpserted: validUnits.length,
    registrosConError: rowErrors.length,
    registrosAusentes: drift.ausentes,
    totalInventarioPrevio: drift.totalPrevio,
    totalCsvActual: drift.totalActual,
    errors: rowErrors,
    errorResumen: buildErrorSummary(rowErrors),
    driftResumen,
    calidadResumen,
    erroresPorTipo: groupErrorsByType(allErrors),
    warningsPorTipo: groupWarningsByType(allWarnings),
    unidadesPorSucursal: summarizeUnitsByBranch(validUnits),
    promocionesActivas: countPromotions(validUnits),
    completedWithWarnings: hasWarnings,
    status,
  }
}

export async function runInventoryImport({ triggeredBy = 'scheduler', sourceUrl, sourceName = process.env.INVENTORY_IMPORT_SOURCE || DEFAULT_SOURCE_NAME }) {
  const importId = buildImportId()
  const resolvedSourceUrl = String(sourceUrl || process.env.INVENTORY_CSV_URL || '').trim()

  if (!resolvedSourceUrl) {
    throw new Error('INVENTORY_CSV_URL_NOT_CONFIGURED')
  }

  await createImportLogStart({
    importId,
    sourceUrl: resolvedSourceUrl,
    sourceName,
    triggeredBy,
  })

  try {
    const summary = await importInventoryFromCsvUrl({
      sourceUrl: resolvedSourceUrl,
      triggeredBy,
      importId,
      sourceName,
    })

    await updateImportLogResult({
      importId,
      patch: {
        status: summary.status,
        totalRegistros: summary.totalRegistros,
        registrosCreados: summary.registrosCreados,
        registrosActualizados: summary.registrosActualizados,
        registrosUpserted: summary.registrosUpserted,
        registrosConError: summary.registrosConError,
        registrosAusentes: summary.registrosAusentes,
        totalInventarioPrevio: summary.totalInventarioPrevio,
        totalCsvActual: summary.totalCsvActual,
        errorResumen: summary.errorResumen,
        driftResumen: summary.driftResumen,
        calidadResumen: summary.calidadResumen,
        erroresPorTipo: summary.erroresPorTipo,
        warningsPorTipo: summary.warningsPorTipo,
        unidadesPorSucursal: summary.unidadesPorSucursal,
        promocionesActivas: summary.promocionesActivas,
        completedWithWarnings: summary.completedWithWarnings,
      },
    })

    return summary
  } catch (error) {
    const message = String(error?.message || error || 'inventory_import_failed').slice(0, 1000)

    await updateImportLogResult({
      importId,
      patch: {
        status: 'fallido',
        errorResumen: message,
      },
    })

    throw error
  }
}
