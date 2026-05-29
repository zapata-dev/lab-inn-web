import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { firebaseDb } from './firebase'

function assertFirestoreReady() {
  if (!firebaseDb) {
    const error = new Error('Firestore no esta configurado para notificaciones.')
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

export function normalizeNotification(docSnap) {
  const data = docSnap.data() || {}

  return {
    id: docSnap.id,
    notificacionId: data.notificacionId || docSnap.id,
    userId: data.userId || '',
    solicitudId: data.solicitudId || '',
    tipo: data.tipo || '',
    canal: data.canal || 'in_app',
    titulo: data.titulo || 'Notificacion',
    mensaje: data.mensaje || '',
    leida: Boolean(data.leida),
    enviada: data.enviada !== false,
    error: data.error || null,
    metadata: data.metadata || {},
    createdAt: asIso(data.createdAt),
    readAt: asIso(data.readAt),
    sentAt: asIso(data.sentAt),
    raw: data,
  }
}

export function subscribeNotificationsForUser(userId, callback, options = {}) {
  assertFirestoreReady()

  const normalizedUserId = String(userId ?? '').trim()
  if (!normalizedUserId) {
    callback({ items: [], error: null })
    return () => {}
  }

  const take = Number.isFinite(options?.limit) ? Number(options.limit) : 30
  const safeLimit = Math.max(1, Math.min(take, 50))
  const notificationsQuery = query(
    collection(firebaseDb, 'notificaciones'),
    where('userId', '==', normalizedUserId),
    orderBy('createdAt', 'desc'),
    limit(safeLimit)
  )

  return onSnapshot(
    notificationsQuery,
    (snapshot) => callback({ items: snapshot.docs.map(normalizeNotification), error: null }),
    (error) => callback({ items: [], error })
  )
}

export function subscribeUnreadNotificationsCount(userId, callback) {
  assertFirestoreReady()

  const normalizedUserId = String(userId ?? '').trim()
  if (!normalizedUserId) {
    callback(0)
    return () => {}
  }

  const unreadQuery = query(
    collection(firebaseDb, 'notificaciones'),
    where('userId', '==', normalizedUserId),
    where('leida', '==', false),
    orderBy('createdAt', 'desc'),
    limit(100)
  )

  return onSnapshot(
    unreadQuery,
    (snapshot) => callback(snapshot.size),
    () => callback(0)
  )
}

export async function markNotificationAsRead(notificationId) {
  assertFirestoreReady()

  const normalizedId = String(notificationId ?? '').trim()
  if (!normalizedId) return

  const notificationRef = doc(firebaseDb, 'notificaciones', normalizedId)
  await updateDoc(notificationRef, {
    leida: true,
    readAt: serverTimestamp(),
  })
}

export async function markAllNotificationsAsRead(userId) {
  assertFirestoreReady()

  const normalizedUserId = String(userId ?? '').trim()
  if (!normalizedUserId) return { updatedCount: 0 }

  const unreadQuery = query(
    collection(firebaseDb, 'notificaciones'),
    where('userId', '==', normalizedUserId),
    where('leida', '==', false),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snapshot = await getDocs(unreadQuery)

  if (!snapshot.size) {
    return { updatedCount: 0 }
  }

  const batch = writeBatch(firebaseDb)
  snapshot.docs.forEach((item) => {
    batch.update(item.ref, {
      leida: true,
      readAt: serverTimestamp(),
    })
  })

  await batch.commit()
  return { updatedCount: snapshot.size }
}
