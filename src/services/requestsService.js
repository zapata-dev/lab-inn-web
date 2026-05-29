import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { firebaseDb } from './firebase'
import {
  canTransitionRequestStatus,
  isValidRequestStatus,
  TERMINAL_REQUEST_STATUSES,
} from '../utils/requestStatus'
import { canCreateRequest, canReadRequest } from '../utils/requestPermissions'

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para solicitudes.')
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
  const date = asDate(value)
  return date ? date.toISOString() : null
}

function getSortTime(value) {
  return asDate(value)?.getTime() ?? 0
}

function normalizePriority(prioridad) {
  return String(prioridad ?? '').trim().toLowerCase() === 'alta' ? 'alta' : 'normal'
}

function resolveUnitVin(unit) {
  return String(unit?.vin || unit?.VIN || unit?.vinCompleto || unit?.id || '').trim()
}

function resolveOwnerBranch(unit) {
  return String(unit?.sucursalId || unit?.branchId || unit?.sucursal || unit?.centro || '').trim()
}

function resolveOwnerBranchName(unit) {
  return String(unit?.sucursalNombre || unit?.branchName || unit?.ubicacion || unit?.sucursal || '').trim()
}

function getCurrentRole(user) {
  return String(user?.rol || user?.role || '').trim().toLowerCase()
}

function normalizeUserIds(values) {
  return [
    ...new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean)),
  ]
}

export function buildUnitSnapshot(unit) {
  return {
    vin: resolveUnitVin(unit),
    marca: String(unit?.marca || unit?.brand || '').trim(),
    modelo: String(unit?.modelo || unit?.model || '').trim(),
    anio: String(unit?.anio || unit?.year || '').trim(),
    sucursalId: resolveOwnerBranch(unit),
    sucursalNombre: resolveOwnerBranchName(unit),
    precio: Number.isFinite(unit?.precio) ? unit.precio : Number(unit?.priceUsd || unit?.price || 0) || null,
    status: String(unit?.status || 'Disponible').trim(),
    promocion: String(unit?.promocion || '').trim(),
  }
}

export function normalizeRequest(docSnap) {
  const data = docSnap.data() || {}

  return {
    id: docSnap.id,
    solicitudId: data.solicitudId || docSnap.id,
    unitVin: data.unitVin || '',
    unitSnapshot: data.unitSnapshot || {},
    vendedorId: data.vendedorId || '',
    vendedorNombre: data.vendedorNombre || '',
    vendedorEmail: data.vendedorEmail || '',
    sucursalSolicitanteId: data.sucursalSolicitanteId || '',
    sucursalSolicitanteNombre: data.sucursalSolicitanteNombre || '',
    sucursalDuenaId: data.sucursalDuenaId || '',
    sucursalDuenaNombre: data.sucursalDuenaNombre || '',
    coordinadorSolicitanteIds: Array.isArray(data.coordinadorSolicitanteIds)
      ? data.coordinadorSolicitanteIds
      : [],
    coordinadorDuenoIds: Array.isArray(data.coordinadorDuenoIds) ? data.coordinadorDuenoIds : [],
    estado: data.estado || 'nueva',
    comentarioInicial: data.comentarioInicial || '',
    prioridad: data.prioridad || 'normal',
    createdAt: asIso(data.createdAt),
    updatedAt: asIso(data.updatedAt),
    closedAt: asIso(data.closedAt),
    lastActivityAt: asIso(data.lastActivityAt),
    lastStatusChangedBy: data.lastStatusChangedBy || '',
    lastStatusChangedByName: data.lastStatusChangedByName || '',
    raw: data,
  }
}

export function normalizeComment(docSnap) {
  const data = docSnap.data() || {}

  return {
    id: docSnap.id,
    comentarioId: data.comentarioId || docSnap.id,
    autorId: data.autorId || '',
    autorNombre: data.autorNombre || '',
    autorEmail: data.autorEmail || '',
    autorRol: data.autorRol || '',
    texto: data.texto || '',
    createdAt: asIso(data.createdAt),
    raw: data,
  }
}

export function normalizeHistoryEvent(docSnap) {
  const data = docSnap.data() || {}

  return {
    id: docSnap.id,
    eventoId: data.eventoId || docSnap.id,
    actorId: data.actorId || '',
    actorEmail: data.actorEmail || '',
    tipoEvento: data.tipoEvento || '',
    estadoAnterior: data.estadoAnterior || null,
    estadoNuevo: data.estadoNuevo || null,
    detalle: data.detalle || '',
    createdAt: asIso(data.createdAt),
    raw: data,
  }
}

export async function createBranchRequest({ unit, user, comentarioInicial, prioridad }) {
  assertFirestoreReady()

  if (!canCreateRequest(user)) {
    const error = new Error('Tu perfil no tiene permisos para crear solicitudes.')
    error.code = 'requests/not-allowed-create'
    throw error
  }

  const unitVin = resolveUnitVin(unit)
  if (!unitVin) {
    const error = new Error('No fue posible crear la solicitud: la unidad no tiene VIN.')
    error.code = 'requests/missing-vin'
    throw error
  }

  const sucursalDuenaId = resolveOwnerBranch(unit)
  if (!sucursalDuenaId) {
    const error = new Error('No fue posible crear la solicitud: la unidad no tiene sucursal dueña.')
    error.code = 'requests/missing-owner-branch'
    throw error
  }

  const sucursalSolicitanteId = String(user?.sucursalId ?? '').trim()
  if (!sucursalSolicitanteId) {
    const error = new Error('Tu usuario no tiene sucursal asignada para crear solicitudes.')
    error.code = 'requests/missing-user-branch'
    throw error
  }

  const coordinadorSolicitanteIds = normalizeUserIds(user?.coordinadorIds)
  const coordinadorDuenoIds = normalizeUserIds(unit?.coordinadorDuenoIds || unit?.coordinadorIds)

  const solicitudesRef = collection(firebaseDb, 'solicitudes')
  const solicitudRef = doc(solicitudesRef)
  const historialRef = doc(collection(firebaseDb, 'solicitudes', solicitudRef.id, 'historial'))

  const snapshot = buildUnitSnapshot(unit)
  const normalizedPriority = normalizePriority(prioridad)
  const initialComment = String(comentarioInicial ?? '').trim()

  const requestPayload = {
    solicitudId: solicitudRef.id,
    unitVin,
    unitSnapshot: snapshot,
    vendedorId: user.uid,
    vendedorNombre: user.nombre || user.name || user.email || 'Usuario LAB',
    vendedorEmail: user.email || '',
    sucursalSolicitanteId,
    sucursalSolicitanteNombre: String(user?.sucursalNombre || '').trim(),
    sucursalDuenaId,
    sucursalDuenaNombre: resolveOwnerBranchName(unit),
    coordinadorSolicitanteIds,
    coordinadorDuenoIds,
    estado: 'nueva',
    comentarioInicial: initialComment,
    prioridad: normalizedPriority,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    closedAt: null,
    lastActivityAt: serverTimestamp(),
  }

  const historyPayload = {
    eventoId: historialRef.id,
    actorId: user.uid,
    actorEmail: user.email || '',
    tipoEvento: 'solicitud_creada',
    estadoAnterior: null,
    estadoNuevo: 'nueva',
    detalle: initialComment || 'Solicitud creada',
    createdAt: serverTimestamp(),
  }

  const batch = writeBatch(firebaseDb)
  batch.set(solicitudRef, requestPayload)
  batch.set(historialRef, historyPayload)
  await batch.commit()

  return { solicitudId: solicitudRef.id }
}

export async function getRequestById(solicitudId) {
  assertFirestoreReady()

  const normalizedId = String(solicitudId ?? '').trim()
  if (!normalizedId) {
    const error = new Error('Solicitud invalida.')
    error.code = 'requests/invalid-id'
    throw error
  }

  const solicitudRef = doc(firebaseDb, 'solicitudes', normalizedId)
  const solicitudSnapshot = await getDoc(solicitudRef)

  if (!solicitudSnapshot.exists()) {
    const error = new Error('La solicitud no existe o ya no esta disponible.')
    error.code = 'requests/not-found'
    throw error
  }

  const [commentsSnapshot, historySnapshot] = await Promise.all([
    getDocs(
      query(
        collection(firebaseDb, 'solicitudes', normalizedId, 'comentarios'),
        orderBy('createdAt', 'asc'),
        limit(200)
      )
    ),
    getDocs(
      query(
        collection(firebaseDb, 'solicitudes', normalizedId, 'historial'),
        orderBy('createdAt', 'desc'),
        limit(200)
      )
    ),
  ])

  return {
    request: normalizeRequest(solicitudSnapshot),
    comments: commentsSnapshot.docs.map(normalizeComment),
    history: historySnapshot.docs.map(normalizeHistoryEvent),
  }
}

function sortRequests(items) {
  return [...items].sort((first, second) => {
    const secondTime = getSortTime(second.lastActivityAt || second.updatedAt || second.createdAt)
    const firstTime = getSortTime(first.lastActivityAt || first.updatedAt || first.createdAt)
    return secondTime - firstTime
  })
}

function dedupeRequests(items) {
  const byId = new Map()
  items.forEach((item) => {
    const key = item.solicitudId || item.id
    byId.set(key, item)
  })

  return [...byId.values()]
}

export function subscribeRequestsForUser(user, callback) {
  assertFirestoreReady()

  if (!user?.uid) {
    callback({ items: [], error: null })
    return () => {}
  }

  const role = getCurrentRole(user)
  const solicitudesCollection = collection(firebaseDb, 'solicitudes')

  if (role === 'soporte') {
    const soporteQuery = query(solicitudesCollection, orderBy('updatedAt', 'desc'), limit(100))
    return onSnapshot(
      soporteQuery,
      (snapshot) => callback({ items: snapshot.docs.map(normalizeRequest), error: null }),
      (error) => callback({ items: [], error })
    )
  }

  if (role === 'vendedor') {
    const vendedorQuery = query(
      solicitudesCollection,
      where('vendedorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    return onSnapshot(
      vendedorQuery,
      (snapshot) => callback({ items: snapshot.docs.map(normalizeRequest), error: null }),
      (error) => callback({ items: [], error })
    )
  }

  if (role === 'coordinador') {
    const branchId = String(user?.sucursalId ?? '').trim()
    if (!branchId) {
      callback({ items: [], error: new Error('Tu usuario no tiene sucursal para consultar solicitudes.') })
      return () => {}
    }

    const solicitanteQuery = query(solicitudesCollection, where('sucursalSolicitanteId', '==', branchId), limit(100))
    const duenaQuery = query(solicitudesCollection, where('sucursalDuenaId', '==', branchId), limit(100))

    let solicitanteItems = []
    let duenaItems = []
    let doneA = false
    let doneB = false

    const emit = () => {
      if (!doneA && !doneB) return
      const merged = sortRequests(dedupeRequests([...solicitanteItems, ...duenaItems]))
      callback({ items: merged, error: null })
    }

    const unsubA = onSnapshot(
      solicitanteQuery,
      (snapshot) => {
        doneA = true
        solicitanteItems = snapshot.docs.map(normalizeRequest)
        emit()
      },
      (error) => callback({ items: [], error })
    )

    const unsubB = onSnapshot(
      duenaQuery,
      (snapshot) => {
        doneB = true
        duenaItems = snapshot.docs.map(normalizeRequest)
        emit()
      },
      (error) => callback({ items: [], error })
    )

    return () => {
      unsubA()
      unsubB()
    }
  }

  callback({ items: [], error: null })
  return () => {}
}

export async function addRequestComment({ solicitudId, user, texto }) {
  assertFirestoreReady()

  const normalizedId = String(solicitudId ?? '').trim()
  const normalizedText = String(texto ?? '').trim()

  if (!normalizedId || !normalizedText) {
    const error = new Error('El comentario requiere solicitud y texto.')
    error.code = 'requests/invalid-comment'
    throw error
  }

  const requestRef = doc(firebaseDb, 'solicitudes', normalizedId)
  const requestSnapshot = await getDoc(requestRef)

  if (!requestSnapshot.exists()) {
    const error = new Error('La solicitud no existe para agregar comentario.')
    error.code = 'requests/not-found'
    throw error
  }

  const requestData = normalizeRequest(requestSnapshot)
  if (!canReadRequest(user, requestData)) {
    const error = new Error('No tienes permisos para comentar esta solicitud.')
    error.code = 'requests/not-allowed-comment'
    throw error
  }

  const commentRef = doc(collection(firebaseDb, 'solicitudes', normalizedId, 'comentarios'))
  const historyRef = doc(collection(firebaseDb, 'solicitudes', normalizedId, 'historial'))

  const batch = writeBatch(firebaseDb)
  batch.set(commentRef, {
    comentarioId: commentRef.id,
    autorId: user.uid,
    autorNombre: user.nombre || user.name || user.email || 'Usuario LAB',
    autorEmail: user.email || '',
    autorRol: getCurrentRole(user),
    texto: normalizedText,
    createdAt: serverTimestamp(),
  })
  batch.set(historyRef, {
    eventoId: historyRef.id,
    actorId: user.uid,
    actorEmail: user.email || '',
    tipoEvento: 'comentario_agregado',
    estadoAnterior: requestData.estado || null,
    estadoNuevo: requestData.estado || null,
    detalle: normalizedText,
    createdAt: serverTimestamp(),
  })
  batch.update(requestRef, {
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  })

  await batch.commit()

  return { comentarioId: commentRef.id }
}

export async function updateRequestStatus({ solicitudId, user, estadoNuevo, detalle }) {
  assertFirestoreReady()

  const normalizedId = String(solicitudId ?? '').trim()
  const nextStatus = String(estadoNuevo ?? '').trim()

  if (!normalizedId || !isValidRequestStatus(nextStatus)) {
    const error = new Error('Estado de solicitud invalido.')
    error.code = 'requests/invalid-status'
    throw error
  }

  const requestRef = doc(firebaseDb, 'solicitudes', normalizedId)
  const requestSnapshot = await getDoc(requestRef)

  if (!requestSnapshot.exists()) {
    const error = new Error('La solicitud no existe para actualizar estado.')
    error.code = 'requests/not-found'
    throw error
  }

  const requestData = normalizeRequest(requestSnapshot)
  const isAllowed = canTransitionRequestStatus({
    from: requestData.estado,
    to: nextStatus,
    user,
    request: requestData,
  })

  if (!isAllowed) {
    const error = new Error('No tienes permisos para realizar esta transicion de estado.')
    error.code = 'requests/not-allowed-transition'
    throw error
  }

  const historyRef = doc(collection(firebaseDb, 'solicitudes', normalizedId, 'historial'))
  const detailText = String(detalle ?? '').trim() || `Cambio de estado a ${nextStatus}`

  const payload = {
    estado: nextStatus,
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
    closedAt: TERMINAL_REQUEST_STATUSES.includes(nextStatus) ? serverTimestamp() : null,
    lastStatusChangedBy: String(user?.uid || '').trim(),
    lastStatusChangedByName: String(user?.nombre || user?.name || user?.email || '').trim(),
  }

  const batch = writeBatch(firebaseDb)
  batch.update(requestRef, payload)
  batch.set(historyRef, {
    eventoId: historyRef.id,
    actorId: user.uid,
    actorEmail: user.email || '',
    tipoEvento: 'estado_actualizado',
    estadoAnterior: requestData.estado,
    estadoNuevo: nextStatus,
    detalle: detailText,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
  return { solicitudId: normalizedId, estado: nextStatus }
}
