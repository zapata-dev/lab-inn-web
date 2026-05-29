import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import mockUsers from '../data/mockUsers'
import useLocalStorage from '../hooks/useLocalStorage'
import { loginWithGoogle as loginFirebaseWithGoogle, logoutFirebase, subscribeToAuthChanges } from '../services/authService'
import { isFirebaseConfigured } from '../services/firebase'
import { AUTHORIZATION_ERROR_CODES, getAuthorizedUser } from '../services/userService'
import { isAllowedEmailDomain } from '../utils/authDomain'
import { removeFromStorage } from '../services/storage'

const AuthContext = createContext(null)
const DEBUG_AUTH = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true'
const AUTHORIZATION_CHECK_TIMEOUT_MS = 12000

function debugAuthLog(...args) {
  if (!DEBUG_AUTH) return
  console.info('[auth-debug]', ...args)
}

function normalizeErrorCode(error) {
  return String(error?.code ?? '').trim() || 'authorization/unknown'
}

function createAuthTimeoutError() {
  const timeoutError = new Error('La validacion de acceso tardo demasiado. Intenta de nuevo.')
  timeoutError.code = 'authorization/validation-timeout'
  return timeoutError
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(createAuthTimeoutError()), timeoutMs)
    }),
  ])
}

function AuthProvider({ children }) {
  const [authState, setAuthState] = useLocalStorage('auth', null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authErrorCode, setAuthErrorCode] = useState(null)

  const authMode = (import.meta.env.VITE_AUTH_MODE || 'demo').trim().toLowerCase()
  const allowedDomain = (import.meta.env.VITE_FIREBASE_ALLOWED_DOMAIN || 'zapata.com.mx')
    .trim()
    .toLowerCase()
  const isFirebaseMode = authMode === 'firebase'

  const demoUser = useMemo(() => {
    if (!authState?.userId) return null
    return mockUsers.find((candidate) => candidate.id === authState.userId) ?? null
  }, [authState])

  useEffect(() => {
    if (isFirebaseMode) return

    if (authState?.userId && !demoUser) {
      removeFromStorage('auth')
      setAuthState(null)
    }

    setUser(demoUser)
    setLoading(false)
    setError(null)
    setAuthErrorCode(null)
  }, [authState?.userId, demoUser, isFirebaseMode, setAuthState])

  useEffect(() => {
    if (!isFirebaseMode) return () => {}

    debugAuthLog('firebase auth effect init')
    if (!isFirebaseConfigured) {
      const firebaseConfigError = new Error('Firebase no esta configurado. Revisa las variables del entorno.')
      firebaseConfigError.code = AUTHORIZATION_ERROR_CODES.FIREBASE_NOT_CONFIGURED

      setUser(null)
      setError(firebaseConfigError)
      setAuthErrorCode(firebaseConfigError.code)
      setLoading(false)
      debugAuthLog('firebase not configured')
      return () => {}
    }

    let isMounted = true
    let authStateResolved = false
    let validationRequestId = 0
    setLoading(true)

    // Safety net: if Firebase listener never resolves, unblock login UI.
    const authResolveTimeout = window.setTimeout(() => {
      if (!isMounted || authStateResolved) return
      debugAuthLog('auth listener timed out before first response')
      setLoading(false)
    }, 4000)

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!isMounted) return
      const currentRequestId = ++validationRequestId
      authStateResolved = true
      window.clearTimeout(authResolveTimeout)
      debugAuthLog('onAuthStateChanged fired', {
        uid: firebaseUser?.uid ?? null,
        email: firebaseUser?.email ?? null,
      })

      if (!firebaseUser) {
        setUser(null)
        setError(null)
        setAuthErrorCode(null)
        setLoading(false)
        debugAuthLog('no firebase session, loading false')
        return
      }

      setLoading(true)

      try {
        if (!isAllowedEmailDomain(firebaseUser.email, allowedDomain)) {
          debugAuthLog('domain not allowed', firebaseUser.email)
          await logoutFirebase()
          const domainError = new Error(`Solo se permite acceso con correos @${allowedDomain}.`)
          domainError.code = 'authorization/domain-not-allowed'
          throw domainError
        }

        debugAuthLog('getAuthorizedUser start', firebaseUser.uid)
        const authorizedUser = await withTimeout(
          getAuthorizedUser(firebaseUser),
          AUTHORIZATION_CHECK_TIMEOUT_MS
        )
        if (!isMounted || currentRequestId !== validationRequestId) return
        debugAuthLog('getAuthorizedUser success', {
          uid: authorizedUser.uid,
          role: authorizedUser.role,
        })

        setUser(authorizedUser)
        setError(null)
        setAuthErrorCode(null)
      } catch (authorizationError) {
        if (!isMounted || currentRequestId !== validationRequestId) return
        debugAuthLog('authorization rejected', {
          code: normalizeErrorCode(authorizationError),
          message: authorizationError?.message,
        })

        setUser(null)
        setError(authorizationError)
        setAuthErrorCode(normalizeErrorCode(authorizationError))
      } finally {
        if (isMounted && currentRequestId === validationRequestId) {
          setLoading(false)
          debugAuthLog('loading false after authorization check')
        }
      }
    })

    return () => {
      isMounted = false
      window.clearTimeout(authResolveTimeout)
      unsubscribe()
    }
  }, [allowedDomain, isFirebaseMode])

  const login = useCallback(
    (userId) => {
      if (isFirebaseMode) {
        return false
      }

      const selectedUser = mockUsers.find((candidate) => candidate.id === userId)
      if (!selectedUser) return false

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
    if (!isFirebaseMode) return null

    setError(null)
    setAuthErrorCode(null)
    setLoading(true)

    try {
      const firebaseUser = await loginFirebaseWithGoogle()
      return firebaseUser
    } catch (loginError) {
      setUser(null)
      setError(loginError)
      setAuthErrorCode(normalizeErrorCode(loginError))
      setLoading(false)
      throw loginError
    }
  }, [isFirebaseMode])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAuthErrorCode(null)

    if (isFirebaseMode) {
      try {
        await logoutFirebase()
        setUser(null)
        setError(null)
        setAuthErrorCode(null)
        return
      } catch (logoutError) {
        const normalizedCode = normalizeErrorCode(logoutError)
        setError(logoutError)
        setAuthErrorCode(normalizedCode)
        throw logoutError
      } finally {
        setLoading(false)
      }
    }

    removeFromStorage('auth')
    setAuthState(null)
    setLoading(false)
  }, [isFirebaseMode, setAuthState])

  const switchUser = useCallback(
    (userId) => {
      if (isFirebaseMode) return false
      return login(userId)
    },
    [isFirebaseMode, login]
  )

  const clearError = useCallback(() => {
    setError(null)
    setAuthErrorCode(null)
  }, [])

  const value = {
    user,
    loading,
    error,
    authErrorCode,
    isAuthenticated: Boolean(user),
    isAuthorized: Boolean(user),
    isFirebaseMode,
    isFirebaseConfigured,
    login,
    loginWithGoogle,
    logout,
    switchUser,
    clearError,
    users: isFirebaseMode ? [] : mockUsers,
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

export { AuthContext, AuthProvider, useAuth }
