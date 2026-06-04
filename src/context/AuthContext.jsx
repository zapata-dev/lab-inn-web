import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import mockUsers from '../data/mockUsers'
import useLocalStorage from '../hooks/useLocalStorage'
import { loginWithGoogle as loginFirebaseWithGoogle, logoutFirebase, subscribeToAuthChanges } from '../services/authService'
import { isFirebaseConfigured } from '../services/firebase'
import { AUTHORIZATION_ERROR_CODES, getAuthorizedUser } from '../services/userService'
import { isAllowedEmailDomain } from '../utils/authDomain'
import {
  AUTH_CONFIG_ERROR_CODE,
  createAuthConfigError,
  getAuthRuntimeConfig,
} from '../utils/authMode'
import {
  createPublicAuthError,
  logAuthDebug,
} from '../utils/authMessages'
import { removeFromStorage } from '../services/storage'

const AuthContext = createContext(null)
const AUTHORIZATION_CHECK_TIMEOUT_MS = 12000

function normalizeAuthIdentity(firebaseUser) {
  if (!firebaseUser) return null

  const uid = String(firebaseUser?.uid ?? '').trim()
  const email = String(firebaseUser?.email ?? '').trim().toLowerCase()
  const displayName = String(firebaseUser?.displayName ?? '').trim()
  const photoURL = String(firebaseUser?.photoURL ?? '').trim()

  if (!uid) return null

  return {
    uid,
    email,
    displayName,
    photoURL: photoURL || null,
  }
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
  const [authIdentity, setAuthIdentity] = useState(null)
  const authRuntime = useMemo(
    () => getAuthRuntimeConfig(import.meta.env, { firebaseConfigured: isFirebaseConfigured }),
    []
  )
  const [loading, setLoading] = useState(() => !authRuntime.isBlocked)
  const [error, setError] = useState(() => (authRuntime.isBlocked ? createAuthConfigError() : null))
  const [authErrorCode, setAuthErrorCode] = useState(() =>
    authRuntime.isBlocked ? AUTH_CONFIG_ERROR_CODE : null
  )

  const allowedDomain = (import.meta.env.VITE_FIREBASE_ALLOWED_DOMAIN || 'zapata.com.mx')
    .trim()
    .toLowerCase()

  const demoUser = useMemo(() => {
    if (!authState?.userId) return null
    return mockUsers.find((candidate) => candidate.id === authState.userId) ?? null
  }, [authState])

  useEffect(() => {
    if (authRuntime.isBlocked) {
      logAuthDebug('auth config blocked', {
        code: AUTH_CONFIG_ERROR_CODE,
        reason: authRuntime.blockReason,
        authMode: authRuntime.authMode || 'missing',
        demoModeEnabled: authRuntime.demoModeEnabled,
        isProd: authRuntime.isProd,
        firebaseConfigured: isFirebaseConfigured,
      })

      if (authState?.userId) {
        removeFromStorage('auth')
        setAuthState(null)
      }

      setUser(null)
      setAuthIdentity(null)
      setError(createAuthConfigError())
      setAuthErrorCode(AUTH_CONFIG_ERROR_CODE)
      setLoading(false)
      return
    }

    if (authRuntime.isFirebaseMode) return

    if (authState?.userId && !demoUser) {
      removeFromStorage('auth')
      setAuthState(null)
    }

    setUser(demoUser)
    setAuthIdentity(null)
    setLoading(false)
    setError(null)
    setAuthErrorCode(null)
  }, [authRuntime, authState?.userId, demoUser, setAuthState])

  useEffect(() => {
    if (!authRuntime.isFirebaseMode) return () => {}

    logAuthDebug('firebase auth effect init')
    if (!isFirebaseConfigured) {
      const firebaseConfigError = createPublicAuthError(AUTHORIZATION_ERROR_CODES.FIREBASE_NOT_CONFIGURED)

      setUser(null)
      setAuthIdentity(null)
      setError(firebaseConfigError)
      setAuthErrorCode(firebaseConfigError.code)
      setLoading(false)
      logAuthDebug('firebase not configured', {
        code: firebaseConfigError.code,
      })
      return () => {}
    }

    let isMounted = true
    let authStateResolved = false
    let validationRequestId = 0
    setLoading(true)

    // Safety net: if Firebase listener never resolves, unblock login UI.
    const authResolveTimeout = window.setTimeout(() => {
      if (!isMounted || authStateResolved) return
      logAuthDebug('auth listener timed out before first response')
      setLoading(false)
    }, 4000)

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!isMounted) return
      const currentRequestId = ++validationRequestId
      authStateResolved = true
      window.clearTimeout(authResolveTimeout)
      logAuthDebug('onAuthStateChanged fired', {
        uid: firebaseUser?.uid ?? null,
        email: firebaseUser?.email ?? null,
      })

      if (!firebaseUser) {
        setUser(null)
        setAuthIdentity(null)
        setError(null)
        setAuthErrorCode(null)
        setLoading(false)
        logAuthDebug('no firebase session, loading false')
        return
      }

      setAuthIdentity(normalizeAuthIdentity(firebaseUser))
      setLoading(true)

      try {
        if (!isAllowedEmailDomain(firebaseUser.email, allowedDomain)) {
          logAuthDebug('domain not allowed', { email: firebaseUser.email })
          await logoutFirebase()
          const domainError = createPublicAuthError('authorization/domain-not-allowed')
          throw domainError
        }

        logAuthDebug('getAuthorizedUser start', { uid: firebaseUser.uid })
        const authorizedUser = await withTimeout(
          getAuthorizedUser(firebaseUser),
          AUTHORIZATION_CHECK_TIMEOUT_MS
        )
        if (!isMounted || currentRequestId !== validationRequestId) return
        logAuthDebug('getAuthorizedUser success', {
          uid: authorizedUser.uid,
          role: authorizedUser.role,
        })

        setUser(authorizedUser)
        setError(null)
        setAuthErrorCode(null)
      } catch (authorizationError) {
        if (!isMounted || currentRequestId !== validationRequestId) return
        const publicError = createPublicAuthError(authorizationError)
        logAuthDebug('authorization rejected', {
          code: publicError.code,
          internalCode: String(authorizationError?.code ?? '').trim() || 'authorization/unknown',
          internalMessage: authorizationError?.message,
        })

        setUser(null)
        setError(publicError)
        setAuthErrorCode(publicError.code)
      } finally {
        if (isMounted && currentRequestId === validationRequestId) {
          setLoading(false)
          logAuthDebug('loading false after authorization check')
        }
      }
    })

    return () => {
      isMounted = false
      window.clearTimeout(authResolveTimeout)
      unsubscribe()
    }
  }, [allowedDomain, authRuntime.isFirebaseMode])

  const login = useCallback(
    (userId) => {
      if (authRuntime.isBlocked || !authRuntime.isDemoMode) {
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
    [authRuntime.isBlocked, authRuntime.isDemoMode, setAuthState]
  )

  const loginWithGoogle = useCallback(async () => {
    if (authRuntime.isBlocked) {
      throw createAuthConfigError()
    }

    if (!authRuntime.isFirebaseMode) return null

    setError(null)
    setAuthErrorCode(null)
    setLoading(true)

    try {
      const firebaseUser = await loginFirebaseWithGoogle()
      setAuthIdentity(normalizeAuthIdentity(firebaseUser))
      return firebaseUser
    } catch (loginError) {
      const publicError = createPublicAuthError(loginError)
      setUser(null)
      setAuthIdentity(null)
      setError(publicError)
      setAuthErrorCode(publicError.code)
      setLoading(false)
      logAuthDebug('loginWithGoogle rejected', {
        code: publicError.code,
        internalCode: String(loginError?.code ?? '').trim() || 'authorization/unknown',
        internalMessage: loginError?.message,
      })
      throw publicError
    }
  }, [authRuntime.isBlocked, authRuntime.isFirebaseMode])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAuthErrorCode(null)

    if (authRuntime.isBlocked) {
      removeFromStorage('auth')
      setAuthState(null)
      setUser(null)
      setAuthIdentity(null)
      setLoading(false)
      return
    }

    if (authRuntime.isFirebaseMode) {
      try {
        await logoutFirebase()
        setUser(null)
        setAuthIdentity(null)
        setError(null)
        setAuthErrorCode(null)
        return
      } catch (logoutError) {
        const publicError = createPublicAuthError(logoutError)
        setError(publicError)
        setAuthErrorCode(publicError.code)
        throw publicError
      } finally {
        setLoading(false)
      }
    }

    removeFromStorage('auth')
    setAuthState(null)
    setLoading(false)
  }, [authRuntime.isBlocked, authRuntime.isFirebaseMode, setAuthState])

  const switchUser = useCallback(
    (userId) => {
      if (authRuntime.isBlocked || !authRuntime.isDemoMode) return false
      return login(userId)
    },
    [authRuntime.isBlocked, authRuntime.isDemoMode, login]
  )

  const clearError = useCallback(() => {
    setError(null)
    setAuthErrorCode(null)
  }, [])

  const value = {
    user,
    authIdentity,
    loading,
    error,
    authErrorCode,
    authConfigBlocked: authRuntime.isBlocked,
    authConfigReason: authRuntime.blockReason,
    isAuthenticated: Boolean(user),
    isAuthorized: Boolean(user),
    isFirebaseMode: authRuntime.isFirebaseMode,
    isDemoMode: authRuntime.isDemoMode,
    isFirebaseConfigured,
    login,
    loginWithGoogle,
    logout,
    switchUser,
    clearError,
    users: authRuntime.isDemoMode ? mockUsers : [],
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
