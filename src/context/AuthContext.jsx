import { createContext, useContext, useEffect, useMemo } from 'react'
import mockUsers from '../data/mockUsers'
import useLocalStorage from '../hooks/useLocalStorage'
import { removeFromStorage } from '../services/storage'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [authState, setAuthState] = useLocalStorage('auth', null)

  const user = useMemo(() => {
    if (!authState?.userId) {
      return null
    }

    return mockUsers.find((candidate) => candidate.id === authState.userId) ?? null
  }, [authState])

  useEffect(() => {
    if (authState?.userId && !user) {
      removeFromStorage('auth')
      setAuthState(null)
    }
  }, [authState, user, setAuthState])

  const login = (userId) => {
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
  }

  const logout = () => {
    removeFromStorage('auth')
    setAuthState(null)
  }

  const switchUser = (userId) => login(userId)

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    switchUser,
    users: mockUsers,
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
