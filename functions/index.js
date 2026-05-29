import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'

import { runInventoryImport } from './inventoryImport.js'

initializeApp()
const db = getFirestore()

setGlobalOptions({ region: 'us-central1' })

const INVENTORY_IMPORT_SCHEDULE = String(process.env.INVENTORY_IMPORT_SCHEDULE || 'every day 05:00').trim()
const INVENTORY_IMPORT_TIME_ZONE = String(process.env.INVENTORY_IMPORT_TIME_ZONE || 'America/Mexico_City').trim()

const NOTIFICATION_TYPES = {
  SOLICITUD_CREADA: 'solicitud_creada',
  SOLICITUD_RECIBIDA: 'solicitud_recibida',
  COMENTARIO_NUEVO: 'comentario_nuevo',
  ESTADO_ACTUALIZADO: 'estado_actualizado',
  SOLICITUD_APROBADA: 'solicitud_aprobada',
  SOLICITUD_RECHAZADA: 'solicitud_rechazada',
  SOLICITUD_CANCELADA: 'solicitud_cancelada',
  SOLICITUD_CERRADA: 'solicitud_cerrada',
}

const DELIVERY_STATUS = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  SKIPPED_DUPLICATE: 'skipped_duplicate',
  FAILED: 'failed',
  RETRIED: 'retried',
}

const ATTEMPT_STATUS = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  SKIPPED_DUPLICATE: 'skipped_duplicate',
  FAILED: 'failed',
  RETRIED: 'retried',
  RETRY_NOT_REQUIRED: 'retry_not_required',
}

const ATTEMPT_REASON = {
  INITIAL_DELIVERY: 'initial_delivery',
  NOTIFICATION_ALREADY_EXISTS: 'notification_already_exists',
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_CREATE_FAILED: 'notification_create_failed',
  MANUAL_RETRY: 'manual_retry',
  MANUAL_RETRY_SUCCESS: 'manual_retry_success',
  MANUAL_RETRY_FAILED: 'manual_retry_failed',
  STATUS_NOT_FAILED: 'status_not_failed',
}

const SOURCE_TYPES = {
  REQUEST_CREATED: 'request_created',
  REQUEST_COMMENT_CREATED: 'request_comment_created',
  REQUEST_STATUS_UPDATED: 'request_status_updated',
  MANUAL_RETRY: 'manual_retry',
}

function uniqueUserIds(ids) {
  return [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || '').trim()).filter(Boolean))]
}

function sanitizeKeyPart(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function buildDeliveryKey({ sourceType, solicitudId, userId, tipo, commentId = '', estadoNuevo = '' }) {
  const parts = [
    sanitizeKeyPart(sourceType),
    sanitizeKeyPart(solicitudId),
    sanitizeKeyPart(commentId),
    sanitizeKeyPart(estadoNuevo),
    sanitizeKeyPart(tipo),
    sanitizeKeyPart(userId),
  ].filter(Boolean)

  return parts.join('_')
}

function buildNotificationId(deliveryId) {
  return `notif_${deliveryId}`
}

function getRequestParticipantUserIds(requestData, options = {}) {
  const { excludeUserId = '' } = options

  const recipients = uniqueUserIds([
    requestData?.vendedorId,
    ...(Array.isArray(requestData?.coordinadorSolicitanteIds) ? requestData.coordinadorSolicitanteIds : []),
    ...(Array.isArray(requestData?.coordinadorDuenoIds) ? requestData.coordinadorDuenoIds : []),
  ])

  if (!excludeUserId) return recipients
  return recipients.filter((userId) => userId !== String(excludeUserId).trim())
}

function getUnitLabel(requestData) {
  const marca = String(requestData?.unitSnapshot?.marca || '').trim()
  const modelo = String(requestData?.unitSnapshot?.modelo || '').trim()
  const vin = String(requestData?.unitVin || requestData?.unitSnapshot?.vin || '').trim()

  const modelLabel = [marca, modelo].filter(Boolean).join(' ')
  if (modelLabel) return vin ? `${modelLabel} (${vin})` : modelLabel
  return vin ? `VIN ${vin}` : 'unidad'
}

function getNotificationCopy({ tipo, requestData, estadoNuevo, commentText }) {
  const solicitudId = String(requestData?.solicitudId || '').trim()
  const label = solicitudId ? `Solicitud ${solicitudId}` : 'Solicitud'
  const unitLabel = getUnitLabel(requestData)

  const map = {
    [NOTIFICATION_TYPES.SOLICITUD_CREADA]: {
      titulo: 'Solicitud creada',
      mensaje: `${label} creada para ${unitLabel}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_RECIBIDA]: {
      titulo: 'Nueva solicitud de unidad',
      mensaje: `Nueva solicitud registrada para ${unitLabel}.`,
    },
    [NOTIFICATION_TYPES.COMENTARIO_NUEVO]: {
      titulo: 'Nuevo comentario en solicitud',
      mensaje: commentText
        ? `Nuevo comentario: "${String(commentText).slice(0, 120)}"`
        : `Hay un nuevo comentario en ${label}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_APROBADA]: {
      titulo: 'Solicitud aprobada',
      mensaje: `${label} fue aprobada.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_RECHAZADA]: {
      titulo: 'Solicitud rechazada',
      mensaje: `${label} fue rechazada.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_CANCELADA]: {
      titulo: 'Solicitud cancelada',
      mensaje: `${label} fue cancelada.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_CERRADA]: {
      titulo: 'Solicitud cerrada',
      mensaje: `${label} fue cerrada.`,
    },
    [NOTIFICATION_TYPES.ESTADO_ACTUALIZADO]: {
      titulo: 'Estado actualizado',
      mensaje: `${label} cambio a ${String(estadoNuevo || '').replace(/_/g, ' ') || 'nuevo estado'}.`,
    },
  }

  return map[tipo] || map[NOTIFICATION_TYPES.ESTADO_ACTUALIZADO]
}

function normalizeError(error) {
  if (!error) {
    return {
      code: null,
      message: 'Error desconocido',
      serialized: 'Error desconocido',
    }
  }

  if (typeof error === 'string') {
    return {
      code: null,
      message: error,
      serialized: error.slice(0, 500),
    }
  }

  const code = error?.code ? String(error.code) : null
  const message = error?.message ? String(error.message) : 'Error sin mensaje'

  return {
    code,
    message: message.slice(0, 500),
    serialized: `${code ? `[${code}] ` : ''}${message}`.slice(0, 500),
  }
}

function buildNotification({ userId, solicitudId, tipo, titulo, mensaje, metadata }) {
  return {
    userId,
    solicitudId,
    tipo,
    canal: 'in_app',
    titulo,
    mensaje,
    leida: false,
    enviada: true,
    error: null,
    createdAt: FieldValue.serverTimestamp(),
    readAt: null,
    sentAt: FieldValue.serverTimestamp(),
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  }
}

async function createDeliveryRecord({ deliveryId, patch }) {
  const deliveryRef = db.collection('notificationDeliveries').doc(deliveryId)
  await deliveryRef.set(
    {
      deliveryId,
      updatedAt: FieldValue.serverTimestamp(),
      ...patch,
    },
    { merge: true }
  )
}

async function getNextAttemptNumber(deliveryRef) {
  const deliverySnap = await deliveryRef.get()
  if (!deliverySnap.exists) return 1

  const deliveryData = deliverySnap.data() || {}
  const baseCount = Number(deliveryData.attemptCount || 0)
  if (!Number.isFinite(baseCount) || baseCount < 0) return 1

  return baseCount + 1
}

async function writeDeliveryAttempt({
  transaction = null,
  deliveryRef,
  deliveryId,
  attemptNumber,
  status,
  reason,
  payload = {},
}) {
  const safeAttempt = Number.isFinite(attemptNumber) && attemptNumber > 0 ? Math.floor(attemptNumber) : 1
  const attemptId = `attempt_${safeAttempt}`
  const attemptRef = deliveryRef.collection('attempts').doc(attemptId)

  const attemptDoc = {
    attemptId,
    deliveryId,
    notificationId: String(payload.notificationId || '').trim(),
    sourceType: String(payload.sourceType || '').trim(),
    sourcePath: String(payload.sourcePath || '').trim(),
    solicitudId: String(payload.solicitudId || '').trim(),
    userId: String(payload.userId || '').trim(),
    tipo: String(payload.tipo || '').trim(),
    status,
    reason,
    attemptNumber: safeAttempt,
    triggeredBy: String(payload.triggeredBy || 'cloud_function').trim(),
    triggeredByUid: String(payload.triggeredByUid || '').trim() || null,
    errorCode: payload.errorCode ? String(payload.errorCode).trim() : null,
    errorMessage: payload.errorMessage ? String(payload.errorMessage).slice(0, 500) : null,
    createdAt: FieldValue.serverTimestamp(),
    metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {},
  }

  if (transaction) {
    transaction.set(attemptRef, attemptDoc, { merge: true })
  } else {
    await attemptRef.set(attemptDoc, { merge: true })
  }

  return attemptId
}

async function createNotificationIfMissing({
  deliveryId,
  notificationId,
  notificationData,
  deliveryData,
  successStatus = DELIVERY_STATUS.DELIVERED,
  reasonOnSuccess = ATTEMPT_REASON.NOTIFICATION_CREATED,
  reasonOnDuplicate = ATTEMPT_REASON.NOTIFICATION_ALREADY_EXISTS,
  reasonOnError = ATTEMPT_REASON.NOTIFICATION_CREATE_FAILED,
  triggeredBy = 'cloud_function',
  triggeredByUid = '',
}) {
  const notificationRef = db.collection('notificaciones').doc(notificationId)
  const deliveryRef = db.collection('notificationDeliveries').doc(deliveryId)

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [notificationSnap, deliverySnap] = await Promise.all([
        transaction.get(notificationRef),
        transaction.get(deliveryRef),
      ])

      const previous = deliverySnap.exists ? deliverySnap.data() || {} : {}
      const nextAttemptCount = Number(previous.attemptCount || 0) + 1
      const baseDelivery = {
        ...deliveryData,
        deliveryId,
        notificationId,
        attemptCount: nextAttemptCount,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (!deliverySnap.exists) {
        baseDelivery.createdAt = FieldValue.serverTimestamp()
      }

      if (notificationSnap.exists) {
        transaction.set(
          deliveryRef,
          {
            ...baseDelivery,
            status: DELIVERY_STATUS.SKIPPED_DUPLICATE,
            lastError: null,
          },
          { merge: true }
        )

        await writeDeliveryAttempt({
          transaction,
          deliveryRef,
          deliveryId,
          attemptNumber: nextAttemptCount,
          status: ATTEMPT_STATUS.SKIPPED_DUPLICATE,
          reason: reasonOnDuplicate,
          payload: {
            ...deliveryData,
            notificationId,
            triggeredBy,
            triggeredByUid,
          },
        })

        return {
          status: DELIVERY_STATUS.SKIPPED_DUPLICATE,
          attemptNumber: nextAttemptCount,
          attemptStatus: ATTEMPT_STATUS.SKIPPED_DUPLICATE,
        }
      }

      transaction.set(notificationRef, {
        notificacionId: notificationId,
        ...notificationData,
      })

      transaction.set(
        deliveryRef,
        {
          ...baseDelivery,
          status: successStatus,
          lastError: null,
          deliveredAt: FieldValue.serverTimestamp(),
          retriedAt:
            successStatus === DELIVERY_STATUS.RETRIED ? FieldValue.serverTimestamp() : previous.retriedAt || null,
        },
        { merge: true }
      )

      const attemptStatus =
        successStatus === DELIVERY_STATUS.RETRIED ? ATTEMPT_STATUS.RETRIED : ATTEMPT_STATUS.DELIVERED

      await writeDeliveryAttempt({
        transaction,
        deliveryRef,
        deliveryId,
        attemptNumber: nextAttemptCount,
        status: attemptStatus,
        reason: reasonOnSuccess,
        payload: {
          ...deliveryData,
          notificationId,
          triggeredBy,
          triggeredByUid,
        },
      })

      return {
        status: successStatus,
        attemptNumber: nextAttemptCount,
        attemptStatus,
      }
    })

    return result
  } catch (error) {
    const errorData = normalizeError(error)

    try {
      const attemptNumber = await getNextAttemptNumber(deliveryRef)

      await createDeliveryRecord({
        deliveryId,
        patch: {
          ...deliveryData,
          notificationId,
          status: DELIVERY_STATUS.FAILED,
          attemptCount: attemptNumber,
          lastError: errorData.serialized,
        },
      })

      await writeDeliveryAttempt({
        deliveryRef,
        deliveryId,
        attemptNumber,
        status: ATTEMPT_STATUS.FAILED,
        reason: reasonOnError,
        payload: {
          ...deliveryData,
          notificationId,
          triggeredBy,
          triggeredByUid,
          errorCode: errorData.code,
          errorMessage: errorData.message,
        },
      })

      return {
        status: DELIVERY_STATUS.FAILED,
        attemptNumber,
        attemptStatus: ATTEMPT_STATUS.FAILED,
        error,
      }
    } catch (persistError) {
      console.error('[LAB FUNCTIONS] Error al persistir intento fallido', {
        deliveryId,
        notificationId,
        error: normalizeError(persistError).serialized,
      })

      return {
        status: DELIVERY_STATUS.FAILED,
        error,
      }
    }
  }
}

async function createNotificationsForUsersServer({
  userIds,
  solicitudId,
  tipo,
  requestData,
  sourceType,
  sourceEventId,
  sourcePath,
  metadata,
  excludeUserId = '',
  commentText = '',
  estadoNuevo = '',
  successStatus = DELIVERY_STATUS.DELIVERED,
}) {
  const recipients = uniqueUserIds(userIds).filter((userId) => !excludeUserId || userId !== excludeUserId)
  const summary = {
    totalTargets: recipients.length,
    delivered: 0,
    skippedDuplicates: 0,
    failed: 0,
  }

  if (!recipients.length) {
    return summary
  }

  const copy = getNotificationCopy({ tipo, requestData, estadoNuevo, commentText })

  for (const userId of recipients) {
    const deliveryId = buildDeliveryKey({
      sourceType,
      solicitudId,
      userId,
      tipo,
      commentId: metadata?.commentId || '',
      estadoNuevo,
    })

    if (!deliveryId) {
      summary.failed += 1
      continue
    }

    const notificationId = buildNotificationId(deliveryId)
    const deliveryData = {
      sourceEventId: String(sourceEventId || '').trim(),
      sourceType,
      sourcePath,
      solicitudId,
      userId,
      tipo,
      metadata: {
        ...(metadata && typeof metadata === 'object' ? metadata : {}),
        deliveryHint: `${sourceType}:${solicitudId}:${tipo}`,
      },
      notificationPayload: {
        titulo: copy.titulo,
        mensaje: copy.mensaje,
      },
    }

    await createDeliveryRecord({
      deliveryId,
      patch: {
        notificationId,
        sourceEventId: deliveryData.sourceEventId,
        sourceType,
        sourcePath,
        solicitudId,
        userId,
        tipo,
        metadata: deliveryData.metadata,
        notificationPayload: deliveryData.notificationPayload,
        status: DELIVERY_STATUS.PENDING,
        lastError: null,
      },
    })

    const result = await createNotificationIfMissing({
      deliveryId,
      notificationId,
      notificationData: buildNotification({
        userId,
        solicitudId,
        tipo,
        titulo: copy.titulo,
        mensaje: copy.mensaje,
        metadata,
      }),
      deliveryData,
      successStatus,
      reasonOnSuccess: ATTEMPT_REASON.NOTIFICATION_CREATED,
      reasonOnDuplicate: ATTEMPT_REASON.NOTIFICATION_ALREADY_EXISTS,
      reasonOnError: ATTEMPT_REASON.NOTIFICATION_CREATE_FAILED,
      triggeredBy: 'cloud_function',
      triggeredByUid: '',
    })

    if (result.status === DELIVERY_STATUS.DELIVERED || result.status === DELIVERY_STATUS.RETRIED) {
      summary.delivered += 1
    } else if (result.status === DELIVERY_STATUS.SKIPPED_DUPLICATE) {
      summary.skippedDuplicates += 1
    } else {
      summary.failed += 1
      console.error('[LAB FUNCTIONS] Delivery fallido', {
        deliveryId,
        notificationId,
        solicitudId,
        tipo,
        userId,
        error: normalizeError(result.error).serialized,
      })
    }
  }

  return summary
}

function resolveStatusNotificationType(estado) {
  if (estado === 'aprobada') return NOTIFICATION_TYPES.SOLICITUD_APROBADA
  if (estado === 'rechazada') return NOTIFICATION_TYPES.SOLICITUD_RECHAZADA
  if (estado === 'cancelada') return NOTIFICATION_TYPES.SOLICITUD_CANCELADA
  if (estado === 'cerrada') return NOTIFICATION_TYPES.SOLICITUD_CERRADA
  return NOTIFICATION_TYPES.ESTADO_ACTUALIZADO
}

async function isSupportUser(uid) {
  const normalizedUid = String(uid || '').trim()
  if (!normalizedUid) return false

  const userSnap = await db.collection('usuarios').doc(normalizedUid).get()
  if (!userSnap.exists) return false

  const userData = userSnap.data() || {}
  return userData.activo === true && userData.rol === 'soporte'
}

async function writeRetryNotRequiredAttempt({ deliveryRef, deliveryId, deliveryData, actorUid }) {
  const attemptNumber = await getNextAttemptNumber(deliveryRef)

  await createDeliveryRecord({
    deliveryId,
    patch: {
      attemptCount: attemptNumber,
      updatedAt: FieldValue.serverTimestamp(),
    },
  })

  await writeDeliveryAttempt({
    deliveryRef,
    deliveryId,
    attemptNumber,
    status: ATTEMPT_STATUS.RETRY_NOT_REQUIRED,
    reason: ATTEMPT_REASON.STATUS_NOT_FAILED,
    payload: {
      notificationId: String(deliveryData.notificationId || '').trim(),
      sourceType: SOURCE_TYPES.MANUAL_RETRY,
      sourcePath: String(deliveryData.sourcePath || '').trim(),
      solicitudId: String(deliveryData.solicitudId || '').trim(),
      userId: String(deliveryData.userId || '').trim(),
      tipo: String(deliveryData.tipo || '').trim(),
      triggeredBy: 'support_retry',
      triggeredByUid: actorUid,
      metadata: {
        ...(deliveryData.metadata && typeof deliveryData.metadata === 'object' ? deliveryData.metadata : {}),
        previousStatus: String(deliveryData.status || '').trim() || null,
      },
    },
  })

  return attemptNumber
}

async function retryDeliveryById(deliveryId, actorUid) {
  const normalizedDeliveryId = String(deliveryId || '').trim()
  if (!normalizedDeliveryId) {
    return { ok: false, message: 'deliveryId invalido.' }
  }

  const deliveryRef = db.collection('notificationDeliveries').doc(normalizedDeliveryId)
  const deliverySnap = await deliveryRef.get()

  if (!deliverySnap.exists) {
    return { ok: false, code: 'not-found', message: 'No existe delivery con ese ID.' }
  }

  const deliveryData = deliverySnap.data() || {}
  if (deliveryData.status !== DELIVERY_STATUS.FAILED) {
    await writeRetryNotRequiredAttempt({
      deliveryRef,
      deliveryId: normalizedDeliveryId,
      deliveryData,
      actorUid,
    })

    return {
      ok: false,
      code: 'not-required',
      message: `El delivery esta en estado ${deliveryData.status || 'desconocido'} y no requiere retry manual.`,
      status: ATTEMPT_STATUS.RETRY_NOT_REQUIRED,
      deliveryId: normalizedDeliveryId,
      notificationId: String(deliveryData.notificationId || '').trim() || null,
    }
  }

  const notificationId = String(deliveryData.notificationId || buildNotificationId(normalizedDeliveryId)).trim()
  const notificationPayload = deliveryData.notificationPayload || {}

  const retryResult = await createNotificationIfMissing({
    deliveryId: normalizedDeliveryId,
    notificationId,
    notificationData: buildNotification({
      userId: String(deliveryData.userId || '').trim(),
      solicitudId: String(deliveryData.solicitudId || '').trim(),
      tipo: String(deliveryData.tipo || '').trim(),
      titulo: String(notificationPayload.titulo || 'Notificacion').trim(),
      mensaje: String(notificationPayload.mensaje || 'Actualizacion de solicitud').trim(),
      metadata: {
        ...(deliveryData.metadata || {}),
        retriedBy: actorUid,
        retrySourceType: SOURCE_TYPES.MANUAL_RETRY,
      },
    }),
    deliveryData: {
      ...deliveryData,
      sourceType: SOURCE_TYPES.MANUAL_RETRY,
      sourceEventId: String(deliveryData.sourceEventId || '').trim() || `manual_retry_${normalizedDeliveryId}`,
      sourcePath: String(deliveryData.sourcePath || '').trim(),
      metadata: {
        ...(deliveryData.metadata || {}),
        retriedBy: actorUid,
      },
    },
    successStatus: DELIVERY_STATUS.RETRIED,
    reasonOnSuccess: ATTEMPT_REASON.MANUAL_RETRY_SUCCESS,
    reasonOnDuplicate: ATTEMPT_REASON.NOTIFICATION_ALREADY_EXISTS,
    reasonOnError: ATTEMPT_REASON.MANUAL_RETRY_FAILED,
    triggeredBy: 'support_retry',
    triggeredByUid: actorUid,
  })

  return {
    ok: retryResult.status === DELIVERY_STATUS.RETRIED || retryResult.status === DELIVERY_STATUS.SKIPPED_DUPLICATE,
    status: retryResult.status,
    deliveryId: normalizedDeliveryId,
    notificationId,
    attemptNumber: retryResult.attemptNumber || null,
  }
}

export const onRequestCreated = onDocumentCreated('solicitudes/{solicitudId}', async (event) => {
  const requestData = event.data?.data()
  const solicitudId = String(event.params?.solicitudId || requestData?.solicitudId || '').trim()

  if (!requestData || !solicitudId) {
    console.warn('[LAB FUNCTIONS] onRequestCreated sin datos suficientes', { solicitudId })
    return
  }

  const vendedorId = String(requestData.vendedorId || '').trim()
  const coordinatorIds = uniqueUserIds([
    ...(Array.isArray(requestData.coordinadorSolicitanteIds) ? requestData.coordinadorSolicitanteIds : []),
    ...(Array.isArray(requestData.coordinadorDuenoIds) ? requestData.coordinadorDuenoIds : []),
  ]).filter((id) => id !== vendedorId)

  const baseMetadata = {
    unitVin: String(requestData.unitVin || '').trim(),
    estado: String(requestData.estado || 'nueva').trim(),
    sucursalSolicitanteId: String(requestData.sucursalSolicitanteId || '').trim(),
    sucursalDuenaId: String(requestData.sucursalDuenaId || '').trim(),
    deliveryReason: ATTEMPT_REASON.INITIAL_DELIVERY,
  }

  try {
    const vendorSummary = vendedorId
      ? await createNotificationsForUsersServer({
          userIds: [vendedorId],
          solicitudId,
          tipo: NOTIFICATION_TYPES.SOLICITUD_CREADA,
          requestData,
          sourceType: SOURCE_TYPES.REQUEST_CREATED,
          sourceEventId: String(event.id || '').trim() || `request_created_${solicitudId}`,
          sourcePath: `solicitudes/${solicitudId}`,
          metadata: baseMetadata,
        })
      : { totalTargets: 0, delivered: 0, skippedDuplicates: 0, failed: 0 }

    const coordinatorSummary = coordinatorIds.length
      ? await createNotificationsForUsersServer({
          userIds: coordinatorIds,
          solicitudId,
          tipo: NOTIFICATION_TYPES.SOLICITUD_RECIBIDA,
          requestData,
          sourceType: SOURCE_TYPES.REQUEST_CREATED,
          sourceEventId: String(event.id || '').trim() || `request_created_${solicitudId}`,
          sourcePath: `solicitudes/${solicitudId}`,
          metadata: baseMetadata,
        })
      : { totalTargets: 0, delivered: 0, skippedDuplicates: 0, failed: 0 }

    console.info('[LAB FUNCTIONS] onRequestCreated summary', {
      solicitudId,
      vendorSummary,
      coordinatorSummary,
    })
  } catch (error) {
    console.error('[LAB FUNCTIONS] Error en onRequestCreated', {
      solicitudId,
      error: normalizeError(error).serialized,
    })
    throw error
  }
})

export const onRequestCommentCreated = onDocumentCreated(
  'solicitudes/{solicitudId}/comentarios/{comentarioId}',
  async (event) => {
    const commentData = event.data?.data()
    const solicitudId = String(event.params?.solicitudId || '').trim()
    const comentarioId = String(event.params?.comentarioId || '').trim()

    if (!commentData || !solicitudId) {
      console.warn('[LAB FUNCTIONS] onRequestCommentCreated sin datos suficientes', { solicitudId, comentarioId })
      return
    }

    const requestRef = db.collection('solicitudes').doc(solicitudId)
    const requestSnap = await requestRef.get()

    if (!requestSnap.exists) {
      console.warn('[LAB FUNCTIONS] Solicitud padre no existe para comentario', { solicitudId, comentarioId })
      return
    }

    const requestData = requestSnap.data() || {}
    const actorId = String(commentData.autorId || '').trim()
    const recipients = getRequestParticipantUserIds(requestData, { excludeUserId: actorId })

    if (!recipients.length) {
      return
    }

    try {
      const summary = await createNotificationsForUsersServer({
        userIds: recipients,
        solicitudId,
        tipo: NOTIFICATION_TYPES.COMENTARIO_NUEVO,
        requestData,
        sourceType: SOURCE_TYPES.REQUEST_COMMENT_CREATED,
        sourceEventId: String(event.id || '').trim() || `comment_created_${solicitudId}_${comentarioId}`,
        sourcePath: `solicitudes/${solicitudId}/comentarios/${comentarioId}`,
        commentText: String(commentData.texto || '').trim(),
        metadata: {
          actorId,
          commentId: comentarioId,
          unitVin: String(requestData.unitVin || '').trim(),
          estado: String(requestData.estado || '').trim(),
          deliveryReason: ATTEMPT_REASON.INITIAL_DELIVERY,
        },
      })

      console.info('[LAB FUNCTIONS] onRequestCommentCreated summary', { solicitudId, comentarioId, summary })
    } catch (error) {
      console.error('[LAB FUNCTIONS] Error en onRequestCommentCreated', {
        solicitudId,
        comentarioId,
        error: normalizeError(error).serialized,
      })
      throw error
    }
  }
)

export const onRequestStatusUpdated = onDocumentUpdated('solicitudes/{solicitudId}', async (event) => {
  const beforeData = event.data?.before?.data() || null
  const afterData = event.data?.after?.data() || null
  const solicitudId = String(event.params?.solicitudId || '').trim()

  if (!beforeData || !afterData || !solicitudId) {
    console.warn('[LAB FUNCTIONS] onRequestStatusUpdated sin datos suficientes', { solicitudId })
    return
  }

  const estadoAnterior = String(beforeData.estado || '').trim()
  const estadoNuevo = String(afterData.estado || '').trim()

  if (!estadoNuevo || estadoAnterior === estadoNuevo) {
    return
  }

  const actorId = String(afterData.lastStatusChangedBy || '').trim()
  const recipients = getRequestParticipantUserIds(afterData, {
    excludeUserId: actorId || '',
  })

  if (!recipients.length) {
    return
  }

  const tipo = resolveStatusNotificationType(estadoNuevo)

  try {
    const summary = await createNotificationsForUsersServer({
      userIds: recipients,
      solicitudId,
      tipo,
      requestData: afterData,
      sourceType: SOURCE_TYPES.REQUEST_STATUS_UPDATED,
      sourceEventId: String(event.id || '').trim() || `status_updated_${solicitudId}_${estadoNuevo}`,
      sourcePath: `solicitudes/${solicitudId}`,
      estadoNuevo,
      metadata: {
        actorId: actorId || null,
        actorName: String(afterData.lastStatusChangedByName || '').trim() || null,
        unitVin: String(afterData.unitVin || '').trim(),
        estadoAnterior,
        estadoNuevo,
        deliveryReason: ATTEMPT_REASON.INITIAL_DELIVERY,
      },
    })

    console.info('[LAB FUNCTIONS] onRequestStatusUpdated summary', {
      solicitudId,
      estadoAnterior,
      estadoNuevo,
      summary,
    })
  } catch (error) {
    console.error('[LAB FUNCTIONS] Error en onRequestStatusUpdated', {
      solicitudId,
      error: normalizeError(error).serialized,
    })
    throw error
  }
})

export const retryNotificationDelivery = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesion para ejecutar esta accion.')
  }

  const isSupport = await isSupportUser(request.auth.uid)
  if (!isSupport) {
    throw new HttpsError('permission-denied', 'Solo soporte puede reintentar entregas de notificaciones.')
  }

  const deliveryId = String(request.data?.deliveryId || '').trim()
  if (!deliveryId) {
    throw new HttpsError('invalid-argument', 'Debes enviar deliveryId para reintentar entrega.')
  }

  const result = await retryDeliveryById(deliveryId, request.auth.uid)

  if (!result.ok && result.code === 'not-found') {
    throw new HttpsError('not-found', result.message)
  }

  return result
})

export const scheduledInventoryImport = onSchedule(
  {
    schedule: INVENTORY_IMPORT_SCHEDULE || 'every day 05:00',
    timeZone: INVENTORY_IMPORT_TIME_ZONE || 'America/Mexico_City',
  },
  async () => {
    const sourceUrl = String(process.env.INVENTORY_CSV_URL || '').trim()

    if (!sourceUrl) {
      console.error('[LAB FUNCTIONS] INVENTORY_CSV_URL no configurada para scheduledInventoryImport.')
      throw new Error('INVENTORY_CSV_URL_NOT_CONFIGURED')
    }

    const summary = await runInventoryImport({
      triggeredBy: 'scheduler',
      sourceUrl,
      sourceName: String(process.env.INVENTORY_IMPORT_SOURCE || 'csv').trim() || 'csv',
    })

    console.info('[LAB FUNCTIONS] scheduledInventoryImport completado', {
      importId: summary.importId,
      totalRegistros: summary.totalRegistros,
      registrosUpserted: summary.registrosUpserted,
      registrosConError: summary.registrosConError,
      status: summary.status,
    })
  }
)

export const runInventoryImportNow = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesion para ejecutar esta accion.')
  }

  const isSupport = await isSupportUser(request.auth.uid)
  if (!isSupport) {
    throw new HttpsError('permission-denied', 'Solo soporte puede ejecutar importaciones manuales de inventario.')
  }

  const sourceUrl = String(request.data?.sourceUrl || process.env.INVENTORY_CSV_URL || '').trim()
  if (!sourceUrl) {
    throw new HttpsError(
      'failed-precondition',
      'No hay URL de inventario configurada. Configura INVENTORY_CSV_URL o envia sourceUrl.'
    )
  }

  try {
    const summary = await runInventoryImport({
      triggeredBy: `support:${request.auth.uid}`,
      sourceUrl,
      sourceName: String(process.env.INVENTORY_IMPORT_SOURCE || 'csv').trim() || 'csv',
    })

    return {
      ok: true,
      importId: summary.importId,
      status: summary.status,
      totalRegistros: summary.totalRegistros,
      registrosCreados: summary.registrosCreados,
      registrosActualizados: summary.registrosActualizados,
      registrosUpserted: summary.registrosUpserted,
      registrosConError: summary.registrosConError,
      errorResumen: summary.errorResumen,
    }
  } catch (error) {
    const message = String(error?.message || error || 'inventory_import_failed')
    throw new HttpsError('internal', `Fallo la importacion manual: ${message.slice(0, 300)}`)
  }
})
