import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const requiredFirebaseKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingFirebaseKeys = requiredFirebaseKeys.filter((key) => !String(import.meta.env[key] ?? '').trim())

let firebaseApp = null
let firebaseAuth = null
let firebaseDb = null
let firebaseFunctions = null
let firebaseConfigError = ''

if (missingFirebaseKeys.length === 0) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)

    const functionsRegion = String(import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1').trim() || 'us-central1'
    firebaseFunctions = getFunctions(firebaseApp, functionsRegion)
  } catch (error) {
    firebaseConfigError =
      error instanceof Error ? error.message : 'No se pudo inicializar Firebase. Revisa la configuracion.'
  }
} else {
  firebaseConfigError = `Faltan variables de Firebase: ${missingFirebaseKeys.join(', ')}`
}

const isFirebaseConfigured = Boolean(firebaseApp && firebaseAuth)
const isFirestoreAvailable = Boolean(firebaseDb)

export {
  firebaseApp,
  firebaseAuth,
  firebaseDb,
  firebaseFunctions,
  firebaseConfig,
  firebaseConfigError,
  isFirebaseConfigured,
  isFirestoreAvailable,
  missingFirebaseKeys,
}
