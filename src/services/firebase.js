import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasRequiredFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0
)

let firebaseApp = null
let firebaseAuth = null
let firebaseDb = null

if (hasRequiredFirebaseConfig) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)
  } catch (error) {
    console.error('Firebase initialization failed', error)
    firebaseApp = null
    firebaseAuth = null
    firebaseDb = null
  }
}

const isFirebaseConfigured = Boolean(firebaseApp && firebaseAuth && firebaseDb)

export { firebaseApp, firebaseAuth, firebaseDb, isFirebaseConfigured }