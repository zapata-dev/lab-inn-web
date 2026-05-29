import {
  collectionGroup,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { firebaseDb } from './firebase'

export const ATTEMPT_STATUSES = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  SKIPPED_DUPLICATE: 'skipped_duplicate',
  FAILED: 'failed',
  RETRIED: 'retried',
  RETRY_NOT_REQUIRED: 'retry_not_required',
}

export const ATTEMPT_REASONS = {
  INITIAL_DELIVERY: 'initial_delivery',
  NOTIFICATION_ALREADY_EXISTS: 'notification_already_exists',
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_CREATE_FAILED: 'notification_create_failed',
  MANUAL_RETRY: 'manual_retry',
  MANUAL_RETRY_SUCCESS: 'manual_retry_success',
  MANUAL_RETRY_FAILED: 'manual_retry_failed',
  STATUS_NOT_FAILED: 'status_not_failed',
}

export const ATTEMPT_TRIGGERED_BY = {
  CLOUD_FUNCTION: 'cloud_function',
  SUPPORT_RETRY: 'support_retry',
}

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para consultar attempts de notificaciones.')
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

export function normalizeAttempt(docSnap) {
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
    status: data.status || ATTEMPT_STATUSES.PENDING,
    reason: data.reason || '',
    attemptNumber: Number(data.attemptNumber || 0),
    triggeredBy: data.triggeredBy || '',
    triggeredByUid: data.triggeredByUid || '',
    errorCode: data.errorCode || '',
    errorMessage: data.errorMessage || '',
    createdAt: asIso(data.createdAt),
    metadata: data.metadata || {},
    refPath: docSnap.ref.path,
    raw: data,
  }
}

function buildAttemptsQuery(filters = {}) {
  const constraints = []

  if (filters.status) {
    constraints.push(where('status', '==', String(filters.status).trim()))
  }

  if (filters.reason) {
    constraints.push(where('reason', '==', String(filters.reason).trim()))
  }

  if (filters.triggeredBy) {
    constraints.push(where('triggeredBy', '==', String(filters.triggeredBy).trim()))
  }

  if (filters.deliveryId) {
    constraints.push(where('deliveryId', '==', String(filters.deliveryId).trim()))
  }

  if (filters.solicitudId) {
    constraints.push(where('solicitudId', '==', String(filters.solicitudId).trim()))
  }

  if (filters.userId) {
    constraints.push(where('userId', '==', String(filters.userId).trim()))
  }

  constraints.push(orderBy('createdAt', 'desc'))

  const requestedLimit = Number(filters.limitCount)
  const safeLimit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 300)) : 100
  constraints.push(limit(safeLimit))

  return query(collectionGroup(firebaseDb, 'attempts'), ...constraints)
}

export function subscribeNotificationAttempts(filters, callback) {
  assertFirestoreReady()

  const attemptsQuery = buildAttemptsQuery(filters)

  return onSnapshot(
    attemptsQuery,
    (snapshot) => {
      callback({
        items: snapshot.docs.map(normalizeAttempt),
        error: null,
      })
    },
    (error) => {
      const message = String(error?.message || '').toLowerCase()
      const isIndexError = error?.code === 'failed-precondition' && message.includes('index')

      callback({
        items: [],
        error: isIndexError
          ? new Error(
              'Firestore requiere un indice para esta combinacion de filtros. Revisa firestore.indexes.json o crea el indice sugerido por Firebase.'
            )
          : error,
      })
    }
  )
}

export function buildAttemptCsvRows(attempts) {
  return (Array.isArray(attempts) ? attempts : []).map((attempt) => ({
    attemptId: String(attempt?.attemptId || '').trim(),
    deliveryId: String(attempt?.deliveryId || '').trim(),
    notificationId: String(attempt?.notificationId || '').trim(),
    sourceType: String(attempt?.sourceType || '').trim(),
    sourcePath: String(attempt?.sourcePath || '').trim(),
    solicitudId: String(attempt?.solicitudId || '').trim(),
    userId: String(attempt?.userId || '').trim(),
    tipo: String(attempt?.tipo || '').trim(),
    status: String(attempt?.status || '').trim(),
    reason: String(attempt?.reason || '').trim(),
    attemptNumber: Number(attempt?.attemptNumber || 0),
    triggeredBy: String(attempt?.triggeredBy || '').trim(),
    triggeredByUid: String(attempt?.triggeredByUid || '').trim(),
    errorCode: String(attempt?.errorCode || '').trim(),
    errorMessage: String(attempt?.errorMessage || '').trim(),
    createdAt: String(attempt?.createdAt || '').trim(),
    refPath: String(attempt?.refPath || '').trim(),
  }))
}
