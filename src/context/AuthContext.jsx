import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import mockUsers from '../data/mockUsers'
import useLocalStorage from '../hooks/useLocalStorage'
import {
  loginWithGoogle as firebaseLoginWithGoogle,
  logoutFirebase,
  subscribeToAuthChanges,
} from '../services/authService'
import { firebaseConfigError, isFirebaseConfigured } from '../services/firebase'
import { getAuthorizedUser } from '../services/userService'
import { removeFromStorage } from '../services/storage'

const AUTHORIZATION_ERROR_CODES = new Set([
  'auth/user-not-allowed',
  'auth/user-inactive',
  'auth/invalid-role',
])

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const authMode = String(import.meta.env.VITE_AUTH_MODE ?? 'demo').toLowerCase()
  const isFirebaseMode = authMode === 'firebase'

  const [authState, setAuthState] = useLocalStorage('auth', null)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseMode)
  const [error, setError] = useState('')
  const [authErrorCode, setAuthErrorCode] = useState('')
  const [authEmail, setAuthEmail] = useState('')

  const demoUser = useMemo(() => {
    if (!authState?.userId) {
      return null
    }

    return mockUsers.find((candidate) => candidate.id === authState.userId) ?? null
  }, [authState])

  const clearError = useCallback(() => {
    setError('')
    setAuthErrorCode('')
  }, [])

  const authorizeFirebaseUser = useCallback(async (firebaseBasicUser, options = {}) => {
    const { logoutOnFailure = true } = options

    try {
      const authorizedUser = await getAuthorizedUser(firebaseBasicUser)
      setFirebaseUser(authorizedUser)
      setAuthEmail(authorizedUser?.email ?? firebaseBasicUser?.email ?? '')
      setError('')
      setAuthErrorCode('')
      setLoading(false)
      return { ok: true, user: authorizedUser }
    } catch (authError) {
      const nextCode = authError?.code || 'auth/authorization-failed'
      const nextMessage = authError?.message || 'No se pudo validar tu autorizacion en LAB.'

      setFirebaseUser(null)
      setAuthEmail(firebaseBasicUser?.email ?? '')
      setAuthErrorCode(nextCode)
      setError(nextMessage)
      setLoading(false)

      if (logoutOnFailure && AUTHORIZATION_ERROR_CODES.has(nextCode)) {
        await logoutFirebase().catch(() => {})
      }

      return { ok: false, code: nextCode }
    }
  }, [])

  useEffect(() => {
    if (isFirebaseMode) return

    if (authState?.userId && !demoUser) {
      removeFromStorage('auth')
      setAuthState(null)
    }
  }, [authState, demoUser, isFirebaseMode, setAuthState])

  useEffect(() => {
    if (!isFirebaseMode) {
      setLoading(false)
      return () => {}
    }

    if (!isFirebaseConfigured) {
      setLoading(false)
      setError(firebaseConfigError || 'Firebase no esta configurado. Revisa variables VITE_FIREBASE_*.')
      setAuthErrorCode('auth/firebase-not-configured')
      return () => {}
    }

    const unsubscribe = subscribeToAuthChanges((nextFirebaseUser) => {
      if (!nextFirebaseUser) {
        setFirebaseUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      authorizeFirebaseUser(nextFirebaseUser, { logoutOnFailure: true })
    })

    return unsubscribe
  }, [authorizeFirebaseUser, isFirebaseMode])

  const login = useCallback(
    (userId) => {
      if (isFirebaseMode) {
        return false
      }

      const selectedUser = mockUsers.find((candidate) => candidate.id === userId)
      if (!selectedUser) {
        return false
      }

      setAuthState({
        userId: selectedUser.id,
        role: selectedUser.role,
        loginAt: new Date().toISOString(),
      })
      return true
    },
    [isFirebaseMode, setAuthState]
  )

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseMode) {
      return { success: false, code: 'auth/not-firebase-mode' }
    }

    try {
      clearError()
      setLoading(true)
      const firebaseBasicUser = await firebaseLoginWithGoogle()
      setAuthEmail(firebaseBasicUser?.email ?? '')

      const result = await authorizeFirebaseUser(firebaseBasicUser, { logoutOnFailure: true })
      return { success: result.ok, code: result.code || '' }
    } catch (loginError) {
      setLoading(false)
      setFirebaseUser(null)
      const nextCode = loginError?.code || 'auth/login-failed'
      setAuthErrorCode(nextCode)
      setError(loginError?.message || 'No se pudo iniciar sesion con Google.')
      return { success: false, code: nextCode }
    }
  }, [authorizeFirebaseUser, clearError, isFirebaseMode])

  const logout = useCallback(async () => {
    if (isFirebaseMode) {
      setError('')
      setAuthErrorCode('')
      setAuthEmail('')
      setFirebaseUser(null)
      await logoutFirebase()
      return
    }

    removeFromStorage('auth')
    setAuthState(null)
  }, [isFirebaseMode, setAuthState])

  const switchUser = useCallback(
    (userId) => {
      if (isFirebaseMode) return false
      return login(userId)
    },
    [isFirebaseMode, login]
  )

  const user = isFirebaseMode ? firebaseUser : demoUser
  const isAuthorized = isFirebaseMode ? Boolean(firebaseUser) : Boolean(demoUser)

  const value = {
    user,
    loading,
    error,
    authErrorCode,
    authEmail,
    isFirebaseMode,
    isAuthorized,
    isAuthenticated: Boolean(user),
    users: isFirebaseMode ? [] : mockUsers,
    login,
    loginWithGoogle,
    logout,
    switchUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { AUTHORIZATION_ERROR_CODES, AuthContext, AuthProvider, useAuth }
