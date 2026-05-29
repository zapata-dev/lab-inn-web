import { FieldValue } from 'firebase-admin/firestore'

const INVENTORY_COLLECTION = 'inventario'

// Reads the full inventory collection into a Map keyed by VIN.
// Adequate for pilot scale. If collection grows significantly, optimize with pagination.
export async function getExistingInventorySnapshot(db) {
  if (!db) throw new Error('FIRESTORE_DB_REQUIRED')
  const snapshot = await db.collection(INVENTORY_COLLECTION).get()
  const inventoryMap = new Map()
  snapshot.forEach((doc) => {
    inventoryMap.set(doc.id, { ...doc.data(), vin: doc.id })
  })
  return inventoryMap
}

export function computeInventoryDrift({ existingInventory, importedUnits }) {
  const importedVins = new Set(importedUnits.map((u) => u.vin))
  const existingVins = new Set(existingInventory.keys())

  const nuevasUnits = importedUnits.filter((u) => !existingInventory.has(u.vin))
  const actualizadasUnits = importedUnits.filter((u) => existingInventory.has(u.vin))
  const ausentesVins = [...existingVins].filter((vin) => !importedVins.has(vin))

  return {
    nuevas: nuevasUnits.length,
    actualizadas: actualizadasUnits.length,
    ausentes: ausentesVins.length,
    totalPrevio: existingVins.size,
    totalActual: importedUnits.length,
    ausentesVins,
    nuevasUnits,
    actualizadasUnits,
  }
}

// Builds merge-update patches for units absent from the current import.
// Does not delete. Only sets missingSince fields the first time a unit goes absent.
export function buildMissingUnitUpdates({ missingUnits, importId }) {
  return missingUnits.map((unit) => {
    const wasAlreadyMissing = unit.importStatus === 'missing_from_latest_import'

    const update = {
      importStatus: 'missing_from_latest_import',
      presentInLatestImport: false,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (!wasAlreadyMissing) {
      update.missingSinceImportId = importId
      update.missingSinceAt = FieldValue.serverTimestamp()
    }

    return { vin: unit.vin, update }
  })
}

export function summarizeUnitsByBranch(units) {
  const byBranch = {}
  for (const unit of units) {
    const branch =
      String(unit.sucursalId || unit.sucursalNombre || 'sin_sucursal').trim() || 'sin_sucursal'
    byBranch[branch] = (byBranch[branch] || 0) + 1
  }
  return byBranch
}

export function countPromotions(units) {
  return units.filter((u) => u.promocion === true).length
}
