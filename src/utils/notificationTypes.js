export const NOTIFICATION_TYPES = {
  SOLICITUD_CREADA: 'solicitud_creada',
  SOLICITUD_RECIBIDA: 'solicitud_recibida',
  COMENTARIO_NUEVO: 'comentario_nuevo',
  ESTADO_ACTUALIZADO: 'estado_actualizado',
  SOLICITUD_APROBADA: 'solicitud_aprobada',
  SOLICITUD_RECHAZADA: 'solicitud_rechazada',
  SOLICITUD_CANCELADA: 'solicitud_cancelada',
  SOLICITUD_CERRADA: 'solicitud_cerrada',
}

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.SOLICITUD_CREADA]: 'Solicitud creada',
  [NOTIFICATION_TYPES.SOLICITUD_RECIBIDA]: 'Nueva solicitud de unidad',
  [NOTIFICATION_TYPES.COMENTARIO_NUEVO]: 'Nuevo comentario en solicitud',
  [NOTIFICATION_TYPES.ESTADO_ACTUALIZADO]: 'Estado actualizado',
  [NOTIFICATION_TYPES.SOLICITUD_APROBADA]: 'Solicitud aprobada',
  [NOTIFICATION_TYPES.SOLICITUD_RECHAZADA]: 'Solicitud rechazada',
  [NOTIFICATION_TYPES.SOLICITUD_CANCELADA]: 'Solicitud cancelada',
  [NOTIFICATION_TYPES.SOLICITUD_CERRADA]: 'Solicitud cerrada',
}

export function getNotificationTypeLabel(type) {
  const normalizedType = String(type ?? '').trim()
  return NOTIFICATION_TYPE_LABELS[normalizedType] || 'Notificacion'
}

function getUnitTitle(request) {
  const marca = String(request?.unitSnapshot?.marca || '').trim()
  const modelo = String(request?.unitSnapshot?.modelo || '').trim()
  const vin = String(request?.unitVin || request?.unitSnapshot?.vin || '').trim()

  const unit = [marca, modelo].filter(Boolean).join(' ')
  if (unit) return vin ? `${unit} (${vin})` : unit
  return vin ? `VIN ${vin}` : 'unidad'
}

export function buildNotificationCopy({ type, request, actor, commentText, estadoNuevo }) {
  const normalizedType = String(type ?? '').trim()
  const actorName =
    String(actor?.nombre || actor?.name || actor?.email || actor?.actorEmail || 'Alguien').trim() || 'Alguien'
  const unitTitle = getUnitTitle(request)
  const requestId = String(request?.solicitudId || request?.id || '').trim()
  const requestLabel = requestId ? `Solicitud ${requestId}` : 'Solicitud'

  const copyMap = {
    [NOTIFICATION_TYPES.SOLICITUD_CREADA]: {
      titulo: 'Solicitud creada',
      mensaje: `${requestLabel} creada para ${unitTitle}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_RECIBIDA]: {
      titulo: 'Nueva solicitud de unidad',
      mensaje: `${actorName} genero una solicitud para ${unitTitle}.`,
    },
    [NOTIFICATION_TYPES.COMENTARIO_NUEVO]: {
      titulo: 'Nuevo comentario en solicitud',
      mensaje: commentText
        ? `${actorName} comento: "${String(commentText).slice(0, 120)}"`
        : `${actorName} agrego un comentario en ${requestLabel}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_APROBADA]: {
      titulo: 'Solicitud aprobada',
      mensaje: `${requestLabel} fue aprobada por ${actorName}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_RECHAZADA]: {
      titulo: 'Solicitud rechazada',
      mensaje: `${requestLabel} fue rechazada por ${actorName}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_CANCELADA]: {
      titulo: 'Solicitud cancelada',
      mensaje: `${requestLabel} fue cancelada por ${actorName}.`,
    },
    [NOTIFICATION_TYPES.SOLICITUD_CERRADA]: {
      titulo: 'Solicitud cerrada',
      mensaje: `${requestLabel} fue cerrada por ${actorName}.`,
    },
    [NOTIFICATION_TYPES.ESTADO_ACTUALIZADO]: {
      titulo: 'Estado actualizado',
      mensaje: `${actorName} cambio el estado a ${String(estadoNuevo || 'actualizado').replace(/_/g, ' ')}.`,
    },
  }

  return (
    copyMap[normalizedType] || {
      titulo: getNotificationTypeLabel(normalizedType),
      mensaje: `${requestLabel} tiene una actualizacion reciente.`,
    }
  )
}
