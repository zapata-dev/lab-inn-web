import { collection, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { firebaseDb } from './firebase'

const IMPORTS_COLLECTION = 'importsInventario'
const HISTORY_LIMIT = 10

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para metricas de import.')
    error.code = 'firestore/not-configured'
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

export function getLatestSuccessfulImport(imports) {
  return (
    imports.find(
      (imp) => imp.status === 'completado' || imp.status === 'completado_con_errores'
    ) || null
  )
}

export function getLatestFailedImport(imports) {
  return imports.find((imp) => imp.status === 'fallido') || null
}

export function buildInventoryImportMetrics(imports) {
  const latestImport = imports[0] || null
  const latestSuccessfulImport = getLatestSuccessfulImport(imports)
  const latestFailedImport = getLatestFailedImport(imports)

  const missingUnitsCount = latestSuccessfulImport
    ? safeNumber(
        latestSuccessfulImport.registrosAusentes ||
          latestSuccessfulImport.driftResumen?.ausentes
      )
    : 0

  const lastImportedAt = latestSuccessfulImport?.finishedAt || null
  const lastFailedImportAt =
    latestFailedImport?.finishedAt || latestFailedImport?.startedAt || null

  const dataQualityScore =
    latestSuccessfulImport?.calidadResumen?.promedioScore ?? null

  const completedWithWarnings = Boolean(latestSuccessfulImport?.completedWithWarnings)

  const hasErrors = latestSuccessfulImport
    ? latestSuccessfulImport.registrosConError > 0 ||
      latestSuccessfulImport.status === 'completado_con_errores'
    : false

  const STATUS_LABELS = {
    completado: 'Completado',
    completado_con_errores: 'Completado con errores',
    fallido: 'Fallido',
    procesando: 'Procesando',
  }
  const statusLabel = latestImport
    ? STATUS_LABELS[latestImport.status] || latestImport.status
    : 'Sin imports'

  return {
    latestImport,
    latestSuccessfulImport,
    latestFailedImport,
    missingUnitsCount,
    lastImportedAt,
    lastFailedImportAt,
    dataQualityScore,
    completedWithWarnings,
    hasErrors,
    statusLabel,
  }
}

export function subscribeLatestInventoryImports(callback, options = {}) {
  assertFirestoreReady()

  const historyLimit = Math.max(1, Math.min(safeNumber(options.limitCount) || HISTORY_LIMIT, 50))
  const importsQuery = query(
    collection(firebaseDb, IMPORTS_COLLECTION),
    orderBy('startedAt', 'desc'),
    limit(historyLimit)
  )

  return onSnapshot(
    importsQuery,
    (snapshot) => {
      const imports = snapshot.docs.map(normalizeInventoryImport)
      callback({ imports, error: null })
    },
    (error) => {
      callback({ imports: [], error })
    }
  )
}

export function subscribeLatestInventoryImportMetrics(callback) {
  return subscribeLatestInventoryImports(({ imports, error }) => {
    if (error) {
      callback({ metrics: null, imports: [], error })
      return
    }
    const metrics = buildInventoryImportMetrics(imports)
    callback({ metrics, imports, error: null })
  })
}

export async function getLatestInventoryImports(options = {}) {
  assertFirestoreReady()

  const historyLimit = Math.max(1, Math.min(safeNumber(options.limitCount) || HISTORY_LIMIT, 50))
  const importsQuery = query(
    collection(firebaseDb, IMPORTS_COLLECTION),
    orderBy('startedAt', 'desc'),
    limit(historyLimit)
  )

  const snapshot = await getDocs(importsQuery)
  return snapshot.docs.map(normalizeInventoryImport)
}
