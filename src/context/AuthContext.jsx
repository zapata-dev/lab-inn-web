import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import mockUsers from '../data/mockUsers'
import useLocalStorage from '../hooks/useLocalStorage'
import { loginWithGoogle as loginFirebaseWithGoogle, logoutFirebase, subscribeToAuthChanges } from '../services/authService'
import { isFirebaseConfigured } from '../services/firebase'
import { AUTHORIZATION_ERROR_CODES, getAuthorizedUser } from '../services/userService'
import { isAllowedEmailDomain } from '../utils/authDomain'
import { removeFromStorage } from '../services/storage'

const AuthContext = createContext(null)

function normalizeErrorCode(error) {
  return String(error?.code ?? '').trim() || 'authorization/unknown'
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
    if (!isFirebaseMode) {
      if (authState?.userId && !demoUser) {
        removeFromStorage('auth')
        setAuthState(null)
      }

      setUser(demoUser)
      setLoading(false)
      setError(null)
      setAuthErrorCode(null)
      return () => {}
    }

    if (!isFirebaseConfigured) {
      const firebaseConfigError = new Error('Firebase no esta configurado. Revisa las variables del entorno.')
      firebaseConfigError.code = AUTHORIZATION_ERROR_CODES.FIREBASE_NOT_CONFIGURED

      setUser(null)
      setError(firebaseConfigError)
      setAuthErrorCode(firebaseConfigError.code)
      setLoading(false)
      return () => {}
    }

    let isMounted = true
    let authStateResolved = false
    setLoading(true)

    // Safety net: if Firebase listener never resolves, unblock login UI.
    const authResolveTimeout = window.setTimeout(() => {
      if (!isMounted || authStateResolved) return
      setLoading(false)
    }, 4000)

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!isMounted) return
      authStateResolved = true
      window.clearTimeout(authResolveTimeout)

      if (!firebaseUser) {
        setUser(null)
        setError(null)
        setAuthErrorCode(null)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        if (!isAllowedEmailDomain(firebaseUser.email, allowedDomain)) {
          await logoutFirebase()
          const domainError = new Error(`Solo se permite acceso con correos @${allowedDomain}.`)
          domainError.code = 'authorization/domain-not-allowed'
          throw domainError
        }

        const authorizedUser = await getAuthorizedUser(firebaseUser)
        if (!isMounted) return

        setUser(authorizedUser)
        setError(null)
        setAuthErrorCode(null)
      } catch (authorizationError) {
        if (!isMounted) return

        setUser(null)
        setError(authorizationError)
        setAuthErrorCode(normalizeErrorCode(authorizationError))
      } finally {
        if (isMounted) setLoading(false)
      }
    })

    return () => {
      isMounted = false
      window.clearTimeout(authResolveTimeout)
      unsubscribe()
    }
  }, [allowedDomain, authState?.userId, demoUser, isFirebaseMode, setAuthState])

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
    if (isFirebaseMode) {
      await logoutFirebase()
      setUser(null)
      setError(null)
      setAuthErrorCode(null)
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
