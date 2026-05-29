import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from './firebase'
import { isAllowedEmailDomain } from '../utils/authDomain'

const AUTH_ERROR_CODES = Object.freeze({
  FIREBASE_NOT_CONFIGURED: 'firebase-not-configured',
  DOMAIN_NOT_ALLOWED: 'authorization/domain-not-allowed',
})

function createAuthError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

async function loginWithGoogle() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw createAuthError(
      AUTH_ERROR_CODES.FIREBASE_NOT_CONFIGURED,
      'Firebase no esta configurado. Revisa las variables del entorno.'
    )
  }

  const allowedDomain = (import.meta.env.VITE_FIREBASE_ALLOWED_DOMAIN || 'zapata.com.mx')
    .trim()
    .toLowerCase()

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const result = await signInWithPopup(firebaseAuth, provider)
  const email = result.user?.email || ''

  if (!isAllowedEmailDomain(email, allowedDomain)) {
    await signOut(firebaseAuth)
    throw createAuthError(
      AUTH_ERROR_CODES.DOMAIN_NOT_ALLOWED,
      `Solo se permite acceso con correos @${allowedDomain}.`
    )
  }

  return result.user
}

async function logoutFirebase() {
  if (!isFirebaseConfigured || !firebaseAuth) return
  await signOut(firebaseAuth)
}

function subscribeToAuthChanges(callback) {
  if (!isFirebaseConfigured || !firebaseAuth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(firebaseAuth, callback)
}

export { AUTH_ERROR_CODES, loginWithGoogle, logoutFirebase, subscribeToAuthChanges }