import { doc, getDoc } from 'firebase/firestore'
import { firebaseDb, isFirebaseConfigured } from './firebase'
import { getProductionRoleLabel, isValidProductionRole } from '../utils/productionRoles'

const AUTHORIZATION_ERROR_CODES = Object.freeze({
  FIREBASE_NOT_CONFIGURED: 'firebase-not-configured',
  USER_NOT_FOUND: 'authorization/user-not-found',
  USER_INACTIVE: 'authorization/user-inactive',
  ROLE_INVALID: 'authorization/role-invalid',
})

function createAuthorizationError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

async function getAuthorizedUser(firebaseUser) {
  if (!isFirebaseConfigured || !firebaseDb) {
    throw createAuthorizationError(
      AUTHORIZATION_ERROR_CODES.FIREBASE_NOT_CONFIGURED,
      'Firebase no esta configurado. Revisa las variables del entorno.'
    )
  }

  const uid = String(firebaseUser?.uid ?? '').trim()
  if (!uid) {
    throw createAuthorizationError(
      AUTHORIZATION_ERROR_CODES.USER_NOT_FOUND,
      'No se encontro un usuario autenticado valido.'
    )
  }

  const snapshot = await getDoc(doc(firebaseDb, 'usuarios', uid))
  if (!snapshot.exists()) {
    throw createAuthorizationError(
      AUTHORIZATION_ERROR_CODES.USER_NOT_FOUND,
      'La cuenta no tiene perfil en usuarios/{uid}.'
    )
  }

  const profile = snapshot.data() ?? {}

  if (profile.activo !== true) {
    throw createAuthorizationError(
      AUTHORIZATION_ERROR_CODES.USER_INACTIVE,
      'Tu usuario esta inactivo en Firestore.'
    )
  }

  const normalizedRole = String(profile.rol ?? profile.role ?? '')
    .trim()
    .toLowerCase()

  if (!isValidProductionRole(normalizedRole)) {
    throw createAuthorizationError(
      AUTHORIZATION_ERROR_CODES.ROLE_INVALID,
      'Tu usuario tiene un rol no permitido para LAB.'
    )
  }

  const normalizedUser = {
    uid,
    email: String(firebaseUser.email ?? profile.email ?? '').trim().toLowerCase(),
    nombre: String(profile.nombre ?? firebaseUser.displayName ?? '').trim(),
    photoURL: firebaseUser.photoURL ?? profile.photoURL ?? null,
    rol: normalizedRole,
    role: normalizedRole,
    roleLabel: getProductionRoleLabel(normalizedRole),
    sucursalId: profile.sucursalId ?? null,
    sucursalNombre: profile.sucursalNombre ?? null,
    activo: true,
    authMode: 'firebase',
  }

  return normalizedUser
}

export { AUTHORIZATION_ERROR_CODES, getAuthorizedUser }