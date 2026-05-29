import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { firebaseDb } from './firebase'
import { normalizeInventoryUnit } from '../utils/inventoryMapper'

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para inventario en vivo.')
    error.code = 'firestore/not-configured'
    throw error
  }
}

function asDate(value) {
  if (!value) return null
  if (value?.toDate) return value.toDate()

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function asIso(value) {
  const parsed = asDate(value)
  return parsed ? parsed.toISOString() : null
}

function getSortTime(value) {
  return asDate(value)?.getTime() ?? 0
}

export function normalizeInventoryDoc(docSnap) {
  const data = docSnap.data() || {}
  const normalized = normalizeInventoryUnit({ id: docSnap.id, ...data })

  return {
    ...normalized,
    id: normalized.id || docSnap.id,
    vin: normalized.vin || docSnap.id,
    refPath: docSnap.ref.path,
    lastImportedAt: asIso(data.lastImportedAt || normalized.lastImportedAt),
    updatedAt: asIso(data.updatedAt || normalized.updatedAt),
  }
}

function buildInventoryQuery(options = {}) {
  const requestedLimit = Number(options.limitCount)
  const safeLimit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 2000)) : 500

  return query(collection(firebaseDb, 'inventario'), orderBy('updatedAt', 'desc'), limit(safeLimit))
}

function summarizeFreshness(units) {
  if (!units.length) {
    return {
      lastImportedAt: null,
      lastUpdatedAt: null,
    }
  }

  let latestImport = null
  let latestUpdate = null

  units.forEach((unit) => {
    const importTime = getSortTime(unit.lastImportedAt)
    const updateTime = getSortTime(unit.updatedAt)

    if (importTime && (!latestImport || importTime > latestImport)) latestImport = importTime
    if (updateTime && (!latestUpdate || updateTime > latestUpdate)) latestUpdate = updateTime
  })

  return {
    lastImportedAt: latestImport ? new Date(latestImport).toISOString() : null,
    lastUpdatedAt: latestUpdate ? new Date(latestUpdate).toISOString() : null,
  }
}

export function subscribeLiveInventory(callback, options = {}) {
  assertFirestoreReady()

  const inventoryQuery = buildInventoryQuery(options)

  return onSnapshot(
    inventoryQuery,
    (snapshot) => {
      const items = snapshot.docs.map(normalizeInventoryDoc)
      callback({
        items,
        error: null,
        ...summarizeFreshness(items),
      })
    },
    (error) => {
      const isIndexError =
        error?.code === 'failed-precondition' && String(error?.message || '').toLowerCase().includes('index')

      callback({
        items: [],
        error: isIndexError
          ? new Error(
              'La consulta de inventario requiere un indice compuesto en Firestore. Revisa firestore.indexes.json y despliega indices.'
            )
          : error,
        lastImportedAt: null,
        lastUpdatedAt: null,
      })
    }
  )
}

export async function getLiveInventoryOnce(options = {}) {
  assertFirestoreReady()

  const snapshot = await getDocs(buildInventoryQuery(options))
  const items = snapshot.docs.map(normalizeInventoryDoc)

  return {
    items,
    ...summarizeFreshness(items),
  }
}

export async function getInventoryFreshness() {
  assertFirestoreReady()

  const [importsSnapshot, inventorySnapshot] = await Promise.allSettled([
    getDocs(query(collection(firebaseDb, 'importsInventario'), orderBy('finishedAt', 'desc'), limit(1))),
    getDocs(query(collection(firebaseDb, 'inventario'), orderBy('updatedAt', 'desc'), limit(1))),
  ])

  let importsLast = null
  let inventoryLast = null

  if (importsSnapshot.status === 'fulfilled' && !importsSnapshot.value.empty) {
    const importData = importsSnapshot.value.docs[0].data() || {}
    importsLast = asIso(importData.finishedAt || importData.updatedAt || importData.startedAt)
  }

  if (inventorySnapshot.status === 'fulfilled' && !inventorySnapshot.value.empty) {
    const inventoryData = inventorySnapshot.value.docs[0].data() || {}
    inventoryLast = asIso(inventoryData.lastImportedAt || inventoryData.updatedAt)
  }

  const candidateDates = [importsLast, inventoryLast]
    .map((value) => (value ? new Date(value).getTime() : 0))
    .filter(Boolean)

  const lastImportedAt = candidateDates.length ? new Date(Math.max(...candidateDates)).toISOString() : null

  return {
    lastImportedAt,
    importsLast,
    inventoryLast,
  }
}
