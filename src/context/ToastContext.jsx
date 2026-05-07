import { nanoid } from 'nanoid'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Toast from '../components/common/Toast'

const ToastContext = createContext(null)
const MAX_VISIBLE_TOASTS = 3
const DEFAULT_DURATION = 3200

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timeoutsRef = useRef({})

  useEffect(
    () => () => {
      Object.values(timeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    },
    []
  )

  const dismissToast = (id) => {
    if (timeoutsRef.current[id]) {
      window.clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }

    setToasts((previous) => previous.filter((toastItem) => toastItem.id !== id))
  }

  const pushToast = (variant, message, options = {}) => {
    const nextToast = {
      id: nanoid(),
      message,
      variant,
      createdAt: Date.now(),
      duration: options.duration ?? DEFAULT_DURATION,
    }

    setToasts((previous) => {
      const nextList = [...previous, nextToast].slice(-MAX_VISIBLE_TOASTS)
      const nextIds = new Set(nextList.map((toastItem) => toastItem.id))

      previous.forEach((toastItem) => {
        if (!nextIds.has(toastItem.id) && timeoutsRef.current[toastItem.id]) {
          window.clearTimeout(timeoutsRef.current[toastItem.id])
          delete timeoutsRef.current[toastItem.id]
        }
      })

      return nextList
    })

    timeoutsRef.current[nextToast.id] = window.setTimeout(() => {
      dismissToast(nextToast.id)
    }, nextToast.duration)

    return nextToast.id
  }

  const toast = useMemo(
    () => ({
      success: (message, options) => pushToast('success', message, options),
      info: (message, options) => pushToast('info', message, options),
      warning: (message, options) => pushToast('warning', message, options),
      error: (message, options) => pushToast('error', message, options),
      simulated: (message, options) => pushToast('simulated', message, options),
    }),
    []
  )

  const contextValue = useMemo(
    () => ({
      toasts,
      toast,
      dismissToast,
    }),
    [toasts, toast]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

export { ToastContext, ToastProvider, useToastContext }
