export function isRequestBranchParticipant(user, request) {
  const userBranchId = String(user?.sucursalId ?? '').trim()
  if (!userBranchId) return false

  return (
    String(request?.sucursalSolicitanteId ?? '').trim() === userBranchId ||
    String(request?.sucursalDuenaId ?? '').trim() === userBranchId
  )
}

function getRole(user) {
  return String(user?.rol || user?.role || '').trim().toLowerCase()
}

function isOwner(user, request) {
  return String(request?.vendedorId ?? '').trim() === String(user?.uid ?? '').trim()
}

export function canReadRequest(user, request) {
  const role = getRole(user)

  if (role === 'soporte') return true
  if (role === 'vendedor') return isOwner(user, request)
  if (role === 'coordinador') return isRequestBranchParticipant(user, request)

  return false
}

export function canCreateRequest(user) {
  const role = getRole(user)
  return role === 'vendedor' || role === 'coordinador' || role === 'soporte'
}

export function canCommentRequest(user, request) {
  return canReadRequest(user, request)
}

export function canUpdateRequestStatus(user, request) {
  const role = getRole(user)

  if (role === 'soporte') return true
  if (role === 'coordinador') return isRequestBranchParticipant(user, request)

  return false
}

export function canCancelRequest(user, request) {
  const role = getRole(user)
  if (role !== 'vendedor') return false

  const status = String(request?.estado ?? '').trim()
  return isOwner(user, request) && (status === 'nueva' || status === 'en_negociacion')
}
