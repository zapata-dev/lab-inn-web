import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { firebaseDb } from './firebase'
import { getProductionRoleLabel, getProductionRoleScope, isValidProductionRole } from '../utils/productionRoles'

function createAuthorizationError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function normalizeProfile(uid, rawProfile) {
  const rol = String(rawProfile?.rol ?? '').trim().toLowerCase()

  if (!isValidProductionRole(rol)) {
    throw createAuthorizationError(
      'auth/invalid-role',
      'Tu usuario no tiene un rol valido configurado.'
    )
  }

  return {
    uid,
    email: String(rawProfile?.email ?? '').trim().toLowerCase(),
    nombre: String(rawProfile?.nombre ?? '').trim(),
    rol,
    role: rol,
    roleLabel: getProductionRoleLabel(rol),
    scope: getProductionRoleScope(rol),
    sucursalId: String(rawProfile?.sucursalId ?? '').trim(),
    sucursalNombre: String(rawProfile?.sucursalNombre ?? '').trim(),
    activo: Boolean(rawProfile?.activo),
    telefono: String(rawProfile?.telefono ?? '').trim(),
  }
}

export async function getUserProfile(uid) {
  if (!firebaseDb) {
    throw createAuthorizationError(
      'auth/firestore-not-configured',
      'Firestore no esta configurado para validar autorizacion.'
    )
  }

  const normalizedUid = String(uid ?? '').trim()
  if (!normalizedUid) {
    throw createAuthorizationError('auth/invalid-uid', 'No se recibio UID valido para autorizacion.')
  }

  const profileRef = doc(firebaseDb, 'usuarios', normalizedUid)
  const snapshot = await getDoc(profileRef)

  if (!snapshot.exists()) {
    throw createAuthorizationError(
      'auth/user-not-allowed',
      'Tu cuenta todavia no esta autorizada para usar LAB.'
    )
  }

  const rawProfile = snapshot.data() ?? {}

  if (rawProfile.activo !== true) {
    throw createAuthorizationError(
      'auth/user-inactive',
      'Tu cuenta esta desactivada. Contacta a soporte.'
    )
  }

  return normalizeProfile(normalizedUid, rawProfile)
}

export async function updateLastLogin(uid) {
  if (!firebaseDb) return

  const normalizedUid = String(uid ?? '').trim()
  if (!normalizedUid) return

  const profileRef = doc(firebaseDb, 'usuarios', normalizedUid)
  await updateDoc(profileRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getAuthorizedUser(firebaseUser) {
  if (!firebaseUser?.uid) {
    throw createAuthorizationError('auth/invalid-auth-user', 'No se recibio usuario autenticado valido.')
  }

  const profile = await getUserProfile(firebaseUser.uid)

  updateLastLogin(firebaseUser.uid).catch((error) => {
    console.warn('[AUTH] No se pudo actualizar lastLoginAt:', error)
  })

  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: profile.email || String(firebaseUser.email ?? '').trim().toLowerCase(),
    nombre: profile.nombre || firebaseUser.displayName || firebaseUser.email || 'Usuario LAB',
    name: profile.nombre || firebaseUser.displayName || firebaseUser.email || 'Usuario LAB',
    photoURL: firebaseUser.photoURL ?? '',
    provider: 'google',
    authMode: 'firebase',
    rol: profile.rol,
    role: profile.role,
    roleLabel: profile.roleLabel,
    sucursalId: profile.sucursalId,
    sucursalNombre: profile.sucursalNombre,
    activo: profile.activo,
    telefono: profile.telefono,
    scope: profile.scope,
    avatar: (profile.nombre || firebaseUser.displayName || firebaseUser.email || 'UZ')
      .slice(0, 2)
      .toUpperCase(),
  }
}
