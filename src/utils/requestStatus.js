export const REQUEST_STATUS = {
  NUEVA: 'nueva',
  EN_NEGOCIACION: 'en_negociacion',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  CANCELADA: 'cancelada',
  CERRADA: 'cerrada',
}

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.NUEVA]: 'Nueva',
  [REQUEST_STATUS.EN_NEGOCIACION]: 'En negociacion',
  [REQUEST_STATUS.APROBADA]: 'Aprobada',
  [REQUEST_STATUS.RECHAZADA]: 'Rechazada',
  [REQUEST_STATUS.CANCELADA]: 'Cancelada',
  [REQUEST_STATUS.CERRADA]: 'Cerrada',
}

export const REQUEST_STATUS_OPTIONS = Object.values(REQUEST_STATUS).map((value) => ({
  value,
  label: REQUEST_STATUS_LABELS[value],
}))

export const TERMINAL_REQUEST_STATUSES = [
  REQUEST_STATUS.APROBADA,
  REQUEST_STATUS.RECHAZADA,
  REQUEST_STATUS.CANCELADA,
  REQUEST_STATUS.CERRADA,
]

const TRANSITIONS = {
  [REQUEST_STATUS.NUEVA]: [REQUEST_STATUS.EN_NEGOCIACION, REQUEST_STATUS.CANCELADA],
  [REQUEST_STATUS.EN_NEGOCIACION]: [
    REQUEST_STATUS.APROBADA,
    REQUEST_STATUS.RECHAZADA,
    REQUEST_STATUS.CANCELADA,
  ],
  [REQUEST_STATUS.APROBADA]: [REQUEST_STATUS.CERRADA],
  [REQUEST_STATUS.RECHAZADA]: [REQUEST_STATUS.CERRADA],
  [REQUEST_STATUS.CANCELADA]: [REQUEST_STATUS.CERRADA],
  [REQUEST_STATUS.CERRADA]: [],
}

function getRole(user) {
  return String(user?.rol || user?.role || '').trim().toLowerCase()
}

function isBranchParticipant(user, request) {
  const sucursalId = String(user?.sucursalId ?? '').trim()
  if (!sucursalId) return false

  return (
    String(request?.sucursalSolicitanteId ?? '').trim() === sucursalId ||
    String(request?.sucursalDuenaId ?? '').trim() === sucursalId
  )
}

export function isValidRequestStatus(status) {
  return Object.values(REQUEST_STATUS).includes(String(status ?? '').trim())
}

export function getRequestStatusLabel(status) {
  const normalizedStatus = String(status ?? '').trim()
  return REQUEST_STATUS_LABELS[normalizedStatus] ?? 'Sin estado'
}

export function canTransitionRequestStatus({ from, to, user, request }) {
  const currentStatus = String(from ?? '').trim()
  const nextStatus = String(to ?? '').trim()

  if (!isValidRequestStatus(currentStatus) || !isValidRequestStatus(nextStatus)) {
    return false
  }

  if (!TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    return false
  }

  const role = getRole(user)

  if (role === 'soporte') {
    return true
  }

  if (role === 'coordinador') {
    return isBranchParticipant(user, request)
  }

  if (role === 'vendedor') {
    const isOwner = String(request?.vendedorId ?? '').trim() === String(user?.uid ?? '').trim()
    const isCancelable =
      nextStatus === REQUEST_STATUS.CANCELADA &&
      (currentStatus === REQUEST_STATUS.NUEVA || currentStatus === REQUEST_STATUS.EN_NEGOCIACION)

    return isOwner && isCancelable
  }

  return false
}
