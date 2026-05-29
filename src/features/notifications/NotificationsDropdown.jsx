import { useEffect, useState } from 'react'
import {
  markAllNotificationsAsRead,
  subscribeNotificationsForUser,
} from '../../services/notificationsService'
import NotificationsList from './NotificationsList'

function NotificationsDropdown({ userId, isOpen, onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (!isOpen || !userId) {
      setItems([])
      setLoading(false)
      setError('')
      return () => {}
    }

    setLoading(true)
    setError('')

    const unsubscribe = subscribeNotificationsForUser(
      userId,
      ({ items: nextItems, error: subscriptionError }) => {
        if (subscriptionError) {
          setError(subscriptionError?.message || 'No se pudieron cargar las notificaciones.')
          setLoading(false)
          return
        }

        setItems(nextItems)
        setLoading(false)
      },
      { limit: 30 }
    )

    return unsubscribe
  }, [isOpen, userId])

  const handleMarkAll = async () => {
    if (!userId) return

    setMarkingAll(true)
    try {
      await markAllNotificationsAsRead(userId)
    } catch (markAllError) {
      setError(markAllError?.message || 'No se pudieron marcar todas como leidas.')
    } finally {
      setMarkingAll(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[92vw] rounded-xl border border-lab-border bg-white p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-lab-text">Notificaciones</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="rounded-md border border-lab-border px-2 py-1 text-[11px] font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? 'Marcando...' : 'Marcar todas'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-lab-border px-2 py-1 text-[11px] font-semibold text-lab-muted hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1">
        <NotificationsList items={items} loading={loading} error={error} onVisited={onClose} />
      </div>
    </div>
  )
}

export default NotificationsDropdown
