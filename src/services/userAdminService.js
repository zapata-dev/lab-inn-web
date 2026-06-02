import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { firebaseDb, isFirebaseConfigured } from './firebase'

const ROLE_OPTIONS = ['vendedor', 'coordinador', 'soporte']

const BRANCH_OPTIONS = [
  { id: 'suc-qro', nombre: 'Queretaro' },
  { id: 'suc-leon', nombre: 'Leon' },
  { id: 'suc-gdl', nombre: 'Guadalajara' },
  { id: 'suc-cdmx', nombre: 'Ciudad de Mexico' },
  { id: 'suc-mty', nombre: 'Monterrey' },
  { id: 'suc-default', nombre: 'Sin asignar' },
]

const ACCESS_REQUEST_STATUS = ['pendiente', 'aprobado', 'rechazado', 'cancelado']

function ensureFirebaseReady() {
  if (!isFirebaseConfigured || !firebaseDb) {
    const error = new Error('Firebase no esta configurado para administrar usuarios.')
    error.code = 'firebase-not-configured'
    throw error
  }
}

function normalizeString(value) {
  return String(value ?? '').trim()
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase()
}

function toDate(value) {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  return null
}

function toMillis(value) {
  const date = toDate(value)
  return date ? date.getTime() : 0
}

function sortByUpdatedAtDesc(items) {
  return [...items].sort((left, right) => {
    const rightValue = toMillis(right.updatedAt) || toMillis(right.createdAt)
    const leftValue = toMillis(left.updatedAt) || toMillis(left.createdAt)
    return rightValue - leftValue
  })
}

function normalizeAccessRequest(snapshotDoc) {
  const data = snapshotDoc.data() ?? {}
  const normalizedStatus = normalizeString(data.status).toLowerCase()

  return {
    id: snapshotDoc.id,
    uid: normalizeString(data.uid || snapshotDoc.id),
    email: normalizeEmail(data.email),
    nombre: normalizeString(data.nombre),
    displayName: normalizeString(data.displayName),
    photoURL: normalizeString(data.photoURL) || null,
    domain: normalizeString(data.domain).toLowerCase(),
    status: ACCESS_REQUEST_STATUS.includes(normalizedStatus) ? normalizedStatus : 'pendiente',
    requestedRole: normalizeString(data.requestedRole).toLowerCase(),
    requestedSucursalId: normalizeString(data.requestedSucursalId),
    requestedSucursalNombre: normalizeString(data.requestedSucursalNombre),
    message: normalizeString(data.message),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    reviewedAt: toDate(data.reviewedAt),
    reviewedBy: normalizeString(data.reviewedBy),
    decisionReason: normalizeString(data.decisionReason),
  }
}

function normalizeAuditLog(snapshotDoc) {
  const data = snapshotDoc.data() ?? {}

  return {
    id: snapshotDoc.id,
    action: normalizeString(data.action),
    targetUid: normalizeString(data.targetUid),
    targetEmail: normalizeEmail(data.targetEmail),
    targetName: normalizeString(data.targetName),
    performedByUid: normalizeString(data.performedByUid),
    performedByEmail: normalizeEmail(data.performedByEmail),
    performedByName: normalizeString(data.performedByName),
    assignedRole: normalizeString(data.assignedRole).toLowerCase(),
    assignedBranch: normalizeString(data.assignedBranch),
    requestId: normalizeString(data.requestId),
    decisionNote: normalizeString(data.decisionNote),
    createdAt: toDate(data.createdAt),
    source: normalizeString(data.source),
    emailStatus: normalizeString(data.emailStatus).toLowerCase(),
    emailProvider: normalizeString(data.emailProvider).toLowerCase(),
    emailSentAt: toDate(data.emailSentAt),
    emailMessageId: normalizeString(data.emailMessageId),
    emailError: normalizeString(data.emailError),
  }
}

function normalizeUser(snapshotDoc) {
  const data = snapshotDoc.data() ?? {}
  const role = normalizeString(data.rol || data.role).toLowerCase()

  return {
    id: snapshotDoc.id,
    uid: snapshotDoc.id,
    email: normalizeEmail(data.email),
    nombre: normalizeString(data.nombre),
    rol: role,
    role,
    sucursalId: normalizeString(data.sucursalId),
    sucursalNombre: normalizeString(data.sucursalNombre),
    activo: data.activo === true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    notas: normalizeString(data.notas),
  }
}

function ensureValidRole(role) {
  const normalizedRole = normalizeString(role).toLowerCase()
  if (!ROLE_OPTIONS.includes(normalizedRole)) {
    const error = new Error('Rol invalido. Usa vendedor, coordinador o soporte.')
    error.code = 'invalid-role'
    throw error
  }

  return normalizedRole
}

function ensureValidBranch(branchId, branchName) {
  const normalizedId = normalizeString(branchId)
  const normalizedName = normalizeString(branchName)

  if (!normalizedId || !normalizedName) {
    const error = new Error('Sucursal invalida. Debes indicar sucursalId y sucursalNombre.')
    error.code = 'invalid-branch'
    throw error
  }

  return {
    sucursalId: normalizedId,
    sucursalNombre: normalizedName,
  }
}

function getReviewerValue(reviewer) {
  const uid = normalizeString(reviewer?.uid)
  if (uid) return uid

  const email = normalizeEmail(reviewer?.email)
  if (email) return email

  return 'soporte'
}

function getReviewerDetails(reviewer) {
  const uid = normalizeString(reviewer?.uid)
  const email = normalizeEmail(reviewer?.email)
  const name = normalizeString(reviewer?.nombre || reviewer?.displayName || reviewer?.name)

  return {
    uid,
    email,
    name,
  }
}

function buildAccessDecisionAuditEvent({
  action,
  request,
  assignedRole,
  assignedBranch,
  decisionNote,
  reviewer,
}) {
  const reviewerDetails = getReviewerDetails(reviewer)
  const targetUid = normalizeString(request?.uid || request?.id)
  const targetEmail = normalizeEmail(request?.email)
  const targetName = normalizeString(
    request?.nombre || request?.displayName || request?.name || request?.email
  )
  const normalizedRole = ensureValidRole(assignedRole || request?.requestedRole)

  return {
    action,
    targetUid,
    targetEmail,
    targetName,
    performedByUid: reviewerDetails.uid,
    performedByEmail: reviewerDetails.email,
    performedByName: reviewerDetails.name || reviewerDetails.email || reviewerDetails.uid || 'Soporte',
    assignedRole: normalizedRole,
    assignedBranch: normalizeString(assignedBranch || request?.requestedSucursalNombre),
    requestId: targetUid,
    decisionNote: normalizeString(decisionNote || ''),
    createdAt: serverTimestamp(),
    source: 'support_panel',
  }
}

async function createAuditLog(event) {
  ensureFirebaseReady()

  const logRef = doc(collection(firebaseDb, 'auditLogs'))
  await setDoc(logRef, {
    action: normalizeString(event?.action),
    targetUid: normalizeString(event?.targetUid),
    targetEmail: normalizeEmail(event?.targetEmail),
    targetName: normalizeString(event?.targetName),
    performedByUid: normalizeString(event?.performedByUid),
    performedByEmail: normalizeEmail(event?.performedByEmail),
    performedByName: normalizeString(event?.performedByName),
    assignedRole: ensureValidRole(event?.assignedRole),
    assignedBranch: normalizeString(event?.assignedBranch),
    requestId: normalizeString(event?.requestId),
    decisionNote: normalizeString(event?.decisionNote),
    createdAt: event?.createdAt || serverTimestamp(),
    source: 'support_panel',
  })

  return logRef.id
}

async function getMyAccessRequest(uid) {
  ensureFirebaseReady()
  const normalizedUid = normalizeString(uid)
  if (!normalizedUid) {
    const error = new Error('UID invalido para consultar solicitud.')
    error.code = 'invalid-uid'
    throw error
  }

  const snapshot = await getDoc(doc(firebaseDb, 'accessRequests', normalizedUid))
  if (!snapshot.exists()) return null
  return normalizeAccessRequest(snapshot)
}

function getDomainFromEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  const atIndex = normalizedEmail.indexOf('@')
  if (atIndex <= 0) return ''
  return normalizedEmail.slice(atIndex + 1)
}

async function createAccessRequest(firebaseUser, payload = {}) {
  ensureFirebaseReady()

  const uid = normalizeString(firebaseUser?.uid)
  const email = normalizeEmail(firebaseUser?.email)
  if (!uid) {
    const error = new Error('No existe UID de Firebase para crear la solicitud.')
    error.code = 'invalid-uid'
    throw error
  }

  if (!email) {
    const error = new Error('No existe email valido para crear la solicitud.')
    error.code = 'invalid-email'
    throw error
  }

  const requestedRole = ensureValidRole(payload?.requestedRole)
  const branch = ensureValidBranch(payload?.requestedSucursalId, payload?.requestedSucursalNombre)
  const accessRequestRef = doc(firebaseDb, 'accessRequests', uid)
  const currentSnapshot = await getDoc(accessRequestRef)

  if (currentSnapshot.exists()) {
    const currentRequest = normalizeAccessRequest(currentSnapshot)
    if (currentRequest.status === 'pendiente') {
      const error = new Error('Ya existe una solicitud pendiente para este usuario.')
      error.code = 'request-already-pending'
      throw error
    }

    if (currentRequest.status === 'aprobado') {
      const error = new Error('Tu solicitud ya fue aprobada. Inicia sesion de nuevo para continuar.')
      error.code = 'request-already-approved'
      throw error
    }

    if (currentRequest.status === 'rechazado' || currentRequest.status === 'cancelado') {
      const error = new Error(
        'No se puede reenviar la solicitud actual por restricciones de seguridad en reglas de Firestore.'
      )
      error.code = 'request-resubmit-not-allowed'
      throw error
    }
  }

  const displayName = normalizeString(firebaseUser?.displayName)
  const message = normalizeString(payload?.message)
  const domain = getDomainFromEmail(email)
  const now = serverTimestamp()
  const allowedPayload = {
    uid,
    email,
    nombre: normalizeString(payload?.nombre || displayName || email),
    displayName,
    photoURL: normalizeString(firebaseUser?.photoURL),
    domain,
    status: 'pendiente',
    requestedRole,
    requestedSucursalId: branch.sucursalId,
    requestedSucursalNombre: branch.sucursalNombre,
    message,
    updatedAt: now,
  }

  if (!currentSnapshot.exists()) {
    allowedPayload.createdAt = now
  }

  await setDoc(accessRequestRef, allowedPayload, { merge: true })
  const nextSnapshot = await getDoc(accessRequestRef)
  return nextSnapshot.exists() ? normalizeAccessRequest(nextSnapshot) : null
}

function subscribeAccessRequests({ status = 'todos' } = {}, callback, onError) {
  ensureFirebaseReady()
  const normalizedStatus = normalizeString(status).toLowerCase()
  const requestsRef = collection(firebaseDb, 'accessRequests')

  return onSnapshot(
    requestsRef,
    (snapshot) => {
      const normalizedRequests = snapshot.docs.map(normalizeAccessRequest)
      const filteredRequests =
        normalizedStatus === 'todos'
          ? normalizedRequests
          : normalizedRequests.filter((request) => request.status === normalizedStatus)

      callback(sortByUpdatedAtDesc(filteredRequests))
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

function subscribeUsers(callback, onError) {
  ensureFirebaseReady()
  const usersRef = collection(firebaseDb, 'usuarios')

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const normalizedUsers = snapshot.docs.map(normalizeUser)
      const sortedUsers = [...normalizedUsers].sort((left, right) =>
        left.nombre.localeCompare(right.nombre, 'es')
      )
      callback(sortedUsers)
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

function listAuditLogs({ limitCount = 50 } = {}, callback, onError) {
  ensureFirebaseReady()
  const normalizedLimitCount = Number.isFinite(Number(limitCount)) ? Number(limitCount) : 50
  const auditLogsQuery = query(
    collection(firebaseDb, 'auditLogs'),
    orderBy('createdAt', 'desc'),
    limit(Math.max(1, normalizedLimitCount))
  )

  return onSnapshot(
    auditLogsQuery,
    (snapshot) => {
      const normalizedAuditLogs = snapshot.docs.map(normalizeAuditLog)
      callback(normalizedAuditLogs)
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

async function approveAccessRequest(request, payload, reviewer) {
  ensureFirebaseReady()
  const uid = normalizeString(request?.uid || request?.id)
  if (!uid) {
    const error = new Error('Solicitud invalida: falta UID.')
    error.code = 'invalid-request'
    throw error
  }

  const role = ensureValidRole(payload?.rol || request?.requestedRole)
  const branch = ensureValidBranch(
    payload?.sucursalId || request?.requestedSucursalId,
    payload?.sucursalNombre || request?.requestedSucursalNombre
  )
  const reviewerValue = getReviewerValue(reviewer)
  const reason = normalizeString(payload?.decisionReason || payload?.notas || 'Solicitud aprobada')

  const userRef = doc(firebaseDb, 'usuarios', uid)
  const requestRef = doc(firebaseDb, 'accessRequests', uid)
  const now = serverTimestamp()
  const batch = writeBatch(firebaseDb)

  batch.set(userRef, {
    email: normalizeEmail(request?.email),
    nombre: normalizeString(payload?.nombre || request?.nombre || request?.displayName || request?.email),
    rol: role,
    role,
    sucursalId: branch.sucursalId,
    sucursalNombre: branch.sucursalNombre,
    activo: payload?.activo !== false,
    createdAt: now,
    updatedAt: now,
    notas: normalizeString(payload?.notas || reason),
  })

  batch.set(
    requestRef,
    {
      status: 'aprobado',
      updatedAt: now,
      reviewedAt: now,
      reviewedBy: reviewerValue,
      decisionReason: reason || 'Solicitud aprobada',
      requestedRole: role,
      requestedSucursalId: branch.sucursalId,
      requestedSucursalNombre: branch.sucursalNombre,
    },
    { merge: true }
  )

  await batch.commit()

  let auditLogWarning = ''
  try {
    await createAuditLog(
      buildAccessDecisionAuditEvent({
        action: 'access_approved',
        request,
        assignedRole: role,
        assignedBranch: branch.sucursalNombre,
        decisionNote: reason || 'Solicitud aprobada',
        reviewer,
      })
    )
  } catch (auditError) {
    console.warn('No se pudo registrar auditLogs para la aprobación de acceso.', auditError)
    auditLogWarning = 'La solicitud se aprobó, pero no se pudo registrar la auditoría.'
  }

  return { auditLogWarning }
}

async function rejectAccessRequest(request, reason, reviewer) {
  ensureFirebaseReady()
  const uid = normalizeString(request?.uid || request?.id)
  if (!uid) {
    const error = new Error('Solicitud invalida: falta UID.')
    error.code = 'invalid-request'
    throw error
  }

  const reviewerValue = getReviewerValue(reviewer)
  const decisionReason = normalizeString(reason || 'Solicitud rechazada')
  const requestRef = doc(firebaseDb, 'accessRequests', uid)

  await setDoc(
    requestRef,
    {
      status: 'rechazado',
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerValue,
      decisionReason,
    },
    { merge: true }
  )

  let auditLogWarning = ''
  try {
    await createAuditLog(
      buildAccessDecisionAuditEvent({
        action: 'access_rejected',
        request,
        assignedRole: request?.requestedRole,
        assignedBranch: request?.requestedSucursalNombre,
        decisionNote: decisionReason || 'Solicitud rechazada',
        reviewer,
      })
    )
  } catch (auditError) {
    console.warn('No se pudo registrar auditLogs para el rechazo de acceso.', auditError)
    auditLogWarning = 'La solicitud se rechazó, pero no se pudo registrar la auditoría.'
  }

  return { auditLogWarning }
}

async function updateUser(uid, payload) {
  ensureFirebaseReady()
  const normalizedUid = normalizeString(uid)
  if (!normalizedUid) {
    const error = new Error('UID invalido para actualizar usuario.')
    error.code = 'invalid-uid'
    throw error
  }

  const role = ensureValidRole(payload?.rol || payload?.role)
  const branch = ensureValidBranch(payload?.sucursalId, payload?.sucursalNombre)
  const email = normalizeEmail(payload?.email)
  const nombre = normalizeString(payload?.nombre)

  if (!email || !nombre) {
    const error = new Error('Usuario invalido: email y nombre son obligatorios.')
    error.code = 'invalid-user-data'
    throw error
  }

  await setDoc(doc(firebaseDb, 'usuarios', normalizedUid), {
    email,
    nombre,
    rol: role,
    role,
    sucursalId: branch.sucursalId,
    sucursalNombre: branch.sucursalNombre,
    activo: payload?.activo === true,
    createdAt: payload?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    notas: normalizeString(payload?.notas),
  })
}

async function deactivateUser(uid) {
  ensureFirebaseReady()
  const normalizedUid = normalizeString(uid)
  if (!normalizedUid) {
    const error = new Error('UID invalido para desactivar usuario.')
    error.code = 'invalid-uid'
    throw error
  }

  const userRef = doc(firebaseDb, 'usuarios', normalizedUid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const error = new Error('No se encontro el usuario para desactivar.')
    error.code = 'user-not-found'
    throw error
  }

  const currentUser = normalizeUser(snapshot)
  await updateUser(normalizedUid, {
    ...currentUser,
    activo: false,
  })
}

export {
  ACCESS_REQUEST_STATUS,
  BRANCH_OPTIONS,
  ROLE_OPTIONS,
  approveAccessRequest,
  createAccessRequest,
  createAuditLog,
  deactivateUser,
  getMyAccessRequest,
  listAuditLogs,
  normalizeAccessRequest,
  normalizeAuditLog,
  normalizeUser,
  rejectAccessRequest,
  subscribeAccessRequests,
  subscribeUsers,
  updateUser,
}
