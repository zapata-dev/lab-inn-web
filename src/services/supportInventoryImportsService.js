import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { firebaseDb, firebaseFunctions } from './firebase'

const IMPORTS_COLLECTION = 'importsInventario'

export const IMPORT_STATUSES = {
  PROCESANDO: 'procesando',
  COMPLETADO: 'completado',
  COMPLETADO_CON_ERRORES: 'completado_con_errores',
  FALLIDO: 'fallido',
}

export const IMPORT_STATUS_LABELS = {
  procesando: 'Procesando',
  completado: 'Completado',
  completado_con_errores: 'Con errores',
  fallido: 'Fallido',
}

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para imports de inventario.')
    error.code = 'firestore/not-configured'
    throw error
  }
}

function assertFunctionsReady() {
  if (!firebaseFunctions) {
    const error = new Error('Firebase Functions no esta configurado para ejecutar import manual.')
    error.code = 'functions/not-configured'
    throw error
  }
}

function asIso(value) {
  if (!value) return null
  if (value?.toDate) return value.toDate().toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function safeNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function normalizeInventoryImport(docSnap) {
  const data = docSnap.data() || {}

  return {
    importId: data.importId || docSnap.id,
    status: String(data.status || 'desconocido'),
    startedAt: asIso(data.startedAt),
    finishedAt: asIso(data.finishedAt),
    fuente: String(data.fuente || ''),
    archivoNombre: String(data.archivoNombre || ''),
    createdBy: String(data.createdBy || 'system'),
    totalRegistros: safeNumber(data.totalRegistros),
    registrosCreados: safeNumber(data.registrosCreados),
    registrosActualizados: safeNumber(data.registrosActualizados),
    registrosUpserted: safeNumber(data.registrosUpserted),
    registrosConError: safeNumber(data.registrosConError),
    registrosAusentes: safeNumber(data.registrosAusentes),
    totalInventarioPrevio: safeNumber(data.totalInventarioPrevio),
    totalCsvActual: safeNumber(data.totalCsvActual),
    driftResumen: data.driftResumen || null,
    calidadResumen: data.calidadResumen || null,
    erroresPorTipo: data.erroresPorTipo || null,
    warningsPorTipo: data.warningsPorTipo || null,
    unidadesPorSucursal: data.unidadesPorSucursal || null,
    promocionesActivas: safeNumber(data.promocionesActivas),
    completedWithWarnings: Boolean(data.completedWithWarnings),
    errorResumen: data.errorResumen || null,
  }
}

export function buildImportStatusLabel(status) {
  return IMPORT_STATUS_LABELS[String(status || '')] || String(status || 'Sin estado')
}

export function subscribeInventoryImports(filters, callback) {
  assertFirestoreReady()

  const displayLimit = Math.max(1, Math.min(safeNumber(filters.limitCount) || 25, 100))
  const queryConstraints = []

  if (filters.status) {
    queryConstraints.push(where('status', '==', filters.status))
  }

  queryConstraints.push(orderBy('startedAt', 'desc'))
  queryConstraints.push(limit(displayLimit))

  const importsQuery = query(collection(firebaseDb, IMPORTS_COLLECTION), ...queryConstraints)

  return onSnapshot(
    importsQuery,
    (snapshot) => {
      const items = snapshot.docs.map(normalizeInventoryImport)
      callback({ items, error: null })
    },
    (firestoreError) => {
      const err =
        firestoreError.code === 'failed-precondition'
          ? Object.assign(
              new Error(
                'Falta índice Firestore para status + startedAt. Despliega firestore.indexes.json.'
              ),
              { code: firestoreError.code }
            )
          : firestoreError
      callback({ items: [], error: err })
    }
  )
}

export async function getInventoryImports(options = {}) {
  assertFirestoreReady()

  const historyLimit = Math.max(1, Math.min(safeNumber(options.limitCount) || 25, 100))
  const importsQuery = query(
    collection(firebaseDb, IMPORTS_COLLECTION),
    orderBy('startedAt', 'desc'),
    limit(historyLimit)
  )

  const snapshot = await getDocs(importsQuery)
  return snapshot.docs.map(normalizeInventoryImport)
}

export async function runInventoryImportNow({ sourceUrl } = {}) {
  assertFunctionsReady()

  const fn = httpsCallable(firebaseFunctions, 'runInventoryImportNow')
  const payload = {}

  const resolvedUrl = String(sourceUrl || '').trim()
  if (resolvedUrl) {
    payload.sourceUrl = resolvedUrl
  }

  const result = await fn(payload)
  return result.data
}
