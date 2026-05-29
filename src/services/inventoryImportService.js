import { isValidInventoryUnit, normalizeInventoryRow } from '../utils/inventoryMapper'

function normalizeRowsInput(rows) {
  return Array.isArray(rows) ? rows : []
}

export function validateInventoryRows(rows) {
  const inputRows = normalizeRowsInput(rows)

  const validRows = []
  const errors = []

  inputRows.forEach((row, index) => {
    const normalized = normalizeInventoryRow(row)

    if (!isValidInventoryUnit(normalized)) {
      errors.push({
        rowIndex: index + 1,
        code: 'missing-vin',
        message: 'Fila sin VIN valido. Se omite del payload.',
        row,
      })
      return
    }

    validRows.push(normalized)
  })

  return {
    totalRows: inputRows.length,
    validRows,
    errors,
  }
}

export function buildInventoryImportPayload(rows, sourceInfo = {}) {
  const validation = validateInventoryRows(rows)

  const unitsByVin = {}
  const units = []

  validation.validRows.forEach((unit) => {
    const vin = String(unit.vin || '').trim().toUpperCase()
    if (!vin) return

    const payloadUnit = {
      vin,
      marca: unit.marca || unit.brand || '',
      modelo: unit.modelo || unit.model || '',
      anio: unit.anio || unit.year || null,
      sucursalId: unit.sucursalId || unit.branchId || '',
      sucursalNombre: unit.sucursalNombre || unit.branchName || '',
      precio: unit.precio ?? unit.priceUsd ?? null,
      status: unit.status || 'available',
      promocion: unit.promocion ?? false,
      fotos: Array.isArray(unit.fotos) ? unit.fotos : [],
      configuracion: unit.configuracion || unit.configuration || '',
      fuente: String(sourceInfo?.fuente || unit.fuente || 'csv_manual').trim(),
    }

    unitsByVin[vin] = payloadUnit
  })

  Object.values(unitsByVin).forEach((unit) => units.push(unit))

  return {
    sourceInfo: {
      fuente: String(sourceInfo?.fuente || 'csv_manual').trim(),
      archivoNombre: String(sourceInfo?.archivoNombre || '').trim(),
      url: String(sourceInfo?.url || '').trim(),
      createdBy: String(sourceInfo?.createdBy || '').trim(),
    },
    totalRows: validation.totalRows,
    totalUnits: units.length,
    units,
    unitsByVin,
    errors: validation.errors,
  }
}

export function summarizeInventoryImport({ created = 0, updated = 0, errors = [] }) {
  const createdCount = Number(created) || 0
  const updatedCount = Number(updated) || 0
  const safeErrors = Array.isArray(errors) ? errors : []

  return {
    totalRegistros: createdCount + updatedCount + safeErrors.length,
    registrosCreados: createdCount,
    registrosActualizados: updatedCount,
    registrosConError: safeErrors.length,
    status: safeErrors.length > 0 ? 'completed_with_errors' : 'completed',
    errorResumen: safeErrors.slice(0, 5).map((error) => error.message || String(error)).join(' | '),
    errors: safeErrors,
  }
}
