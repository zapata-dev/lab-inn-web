import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { firebaseDb, firebaseFunctions } from './firebase'

export const DELIVERY_STATUSES = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  SKIPPED_DUPLICATE: 'skipped_duplicate',
  FAILED: 'failed',
  RETRIED: 'retried',
  RETRY_NOT_REQUIRED: 'retry_not_required',
}

export const DELIVERY_SOURCE_TYPES = {
  REQUEST_CREATED: 'request_created',
  REQUEST_COMMENT_CREATED: 'request_comment_created',
  REQUEST_STATUS_UPDATED: 'request_status_updated',
  MANUAL_RETRY: 'manual_retry',
}

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para consultar entregas de notificaciones.')
    error.code = 'firestore/not-configured'
    throw error
  }
}

function assertFunctionsReady() {
  if (!firebaseFunctions) {
    const error = new Error('Firebase Functions no esta configurado para ejecutar retry manual.')
    error.code = 'functions/not-configured'
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

export function normalizeDeliveryAttempt(docSnap) {
  const data = docSnap.data() || {}

  return {
    id: docSnap.id,
    attemptId: data.attemptId || docSnap.id,
    deliveryId: data.deliveryId || '',
    notificationId: data.notificationId || '',
    sourceType: data.sourceType || '',
    sourcePath: data.sourcePath || '',
    solicitudId: data.solicitudId || '',
    userId: data.userId || '',
    tipo: data.tipo || '',
    status: data.status || DELIVERY_STATUSES.PENDING,
    reason: data.reason || '',
    attemptNumber: Number(data.attemptNumber || 0),
    triggeredBy: data.triggeredBy || '',
    triggeredByUid: data.triggeredByUid || '',
    errorCode: data.errorCode || '',
    errorMessage: data.errorMessage || '',
    createdAt: asIso(data.createdAt),
    metadata: data.metadata || {},
    raw: data,
  }
}

export function normalizeDelivery(docSnap) {
  const data = docSnap.data() || {}

  return {
    id: docSnap.id,
    deliveryId: data.deliveryId || docSnap.id,
    notificationId: data.notificationId || '',
    sourceEventId: data.sourceEventId || '',
    sourceType: data.sourceType || '',
    sourcePath: data.sourcePath || '',
    solicitudId: data.solicitudId || '',
    userId: data.userId || '',
    tipo: data.tipo || '',
    status: data.status || DELIVERY_STATUSES.PENDING,
    attemptCount: Number(data.attemptCount || 0),
    lastError: data.lastError || '',
    metadata: data.metadata || {},
    createdAt: asIso(data.createdAt),
    updatedAt: asIso(data.updatedAt),
    deliveredAt: asIso(data.deliveredAt),
    retriedAt: asIso(data.retriedAt),
    raw: data,
  }
}

export function buildDeliveryCsvRows(deliveries) {
  return (Array.isArray(deliveries) ? deliveries : []).map((delivery) => ({
    deliveryId: String(delivery?.deliveryId || '').trim(),
    notificationId: String(delivery?.notificationId || '').trim(),
    sourceType: String(delivery?.sourceType || '').trim(),
    solicitudId: String(delivery?.solicitudId || '').trim(),
    userId: String(delivery?.userId || '').trim(),
    tipo: String(delivery?.tipo || '').trim(),
    status: String(delivery?.status || '').trim(),
    attemptCount: Number(delivery?.attemptCount || 0),
    lastError: String(delivery?.lastError || '').trim(),
    createdAt: String(delivery?.createdAt || '').trim(),
    updatedAt: String(delivery?.updatedAt || '').trim(),
    deliveredAt: String(delivery?.deliveredAt || '').trim(),
    retriedAt: String(delivery?.retriedAt || '').trim(),
  }))
}

function buildDeliveriesQuery(filters = {}) {
  const constraints = []

  if (filters.status) {
    constraints.push(where('status', '==', String(filters.status).trim()))
  }

  if (filters.sourceType) {
    constraints.push(where('sourceType', '==', String(filters.sourceType).trim()))
  }

  if (filters.solicitudId) {
    constraints.push(where('solicitudId', '==', String(filters.solicitudId).trim()))
  }

  if (filters.deliveryId) {
    constraints.push(where('deliveryId', '==', String(filters.deliveryId).trim()))
  }

  if (filters.userId) {
    constraints.push(where('userId', '==', String(filters.userId).trim()))
  }

  constraints.push(orderBy('updatedAt', 'desc'))

  const requestedLimit = Number(filters.limitCount)
  const safeLimit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(requestedLimit, 200))
    : 50
  constraints.push(limit(safeLimit))

  return query(collection(firebaseDb, 'notificationDeliveries'), ...constraints)
}

export function subscribeNotificationDeliveries(filters, callback) {
  assertFirestoreReady()

  const deliveriesQuery = buildDeliveriesQuery(filters)

  return onSnapshot(
    deliveriesQuery,
    (snapshot) => {
      callback({
        items: snapshot.docs.map(normalizeDelivery),
        error: null,
      })
    },
    (error) => {
      const isIndexError =
        error?.code === 'failed-precondition' && String(error?.message || '').toLowerCase().includes('index')

      callback({
        items: [],
        error: isIndexError
          ? new Error(
              'La consulta requiere un indice compuesto en Firestore. Revisa firestore.indexes.json y despliega indices.'
            )
          : error,
      })
    }
  )
}

export async function getNotificationDelivery(deliveryId) {
  assertFirestoreReady()

  const normalizedId = String(deliveryId ?? '').trim()
  if (!normalizedId) {
    const error = new Error('deliveryId invalido.')
    error.code = 'deliveries/invalid-id'
    throw error
  }

  const deliveryRef = doc(firebaseDb, 'notificationDeliveries', normalizedId)
  const snapshot = await getDoc(deliveryRef)

  if (!snapshot.exists()) {
    const error = new Error('No existe registro de entrega con ese ID.')
    error.code = 'deliveries/not-found'
    throw error
  }

  return normalizeDelivery(snapshot)
}

export function subscribeDeliveryAttempts(deliveryId, callback) {
  assertFirestoreReady()

  const normalizedId = String(deliveryId ?? '').trim()
  if (!normalizedId) {
    callback({
      items: [],
      error: new Error('deliveryId invalido para consultar attempts.'),
    })
    return () => {}
  }

  const attemptsQuery = query(
    collection(firebaseDb, 'notificationDeliveries', normalizedId, 'attempts'),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(
    attemptsQuery,
    (snapshot) => {
      callback({
        items: snapshot.docs.map(normalizeDeliveryAttempt),
        error: null,
      })
    },
    (error) => {
      const isPermissionError = error?.code === 'permission-denied'
      callback({
        items: [],
        error: isPermissionError
          ? new Error('No tienes permisos para leer attempts de esta entrega. Solo soporte puede consultarlos.')
          : error,
      })
    }
  )
}

export async function retryNotificationDelivery(deliveryId) {
  assertFunctionsReady()

  const normalizedId = String(deliveryId ?? '').trim()
  if (!normalizedId) {
    const error = new Error('deliveryId invalido para retry.')
    error.code = 'deliveries/invalid-id'
    throw error
  }

  const callable = httpsCallable(firebaseFunctions, 'retryNotificationDelivery')
  const response = await callable({ deliveryId: normalizedId })

  return response?.data ?? null
}
