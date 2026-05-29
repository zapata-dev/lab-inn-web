import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { firebaseAuth, firebaseConfigError, isFirebaseConfigured } from './firebase'
import { getAllowedDomain, isAllowedEmailDomain } from '../utils/authDomain'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ hd: getAllowedDomain() })

function createAuthError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function mapFirebaseUser(user) {
  if (!user) return null

  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email ?? 'Usuario Zapata',
    photoURL: user.photoURL ?? '',
  }
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw createAuthError(
      'auth/firebase-not-configured',
      firebaseConfigError || 'Firebase no esta configurado. Revisa variables VITE_FIREBASE_*.'
    )
  }

  const result = await signInWithPopup(firebaseAuth, provider)
  const { user } = result

  if (!isAllowedEmailDomain(user?.email)) {
    await signOut(firebaseAuth)
    throw createAuthError(
      'access-denied-domain',
      `Acceso denegado. Solo cuentas @${getAllowedDomain()} autorizadas.`
    )
  }

  return mapFirebaseUser(user)
}

export async function logoutFirebase() {
  if (!firebaseAuth) return
  await signOut(firebaseAuth)
}

export function subscribeToAuthChanges(callback) {
  if (!isFirebaseConfigured || !firebaseAuth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(firebaseAuth, async (user) => {
    if (!user) {
      callback(null)
      return
    }

    if (!isAllowedEmailDomain(user.email)) {
      await signOut(firebaseAuth)
      callback(null)
      return
    }

    callback(mapFirebaseUser(user))
  })
}
