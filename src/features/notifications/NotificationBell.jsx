import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { subscribeUnreadNotificationsCount } from '../../services/notificationsService'
import NotificationsDropdown from './NotificationsDropdown'

function NotificationBell({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0)
      return () => {}
    }

    return subscribeUnreadNotificationsCount(user.uid, (count) => {
      setUnreadCount(Number.isFinite(count) ? count : 0)
    })
  }, [user?.uid])

  useEffect(() => {
    if (!isOpen) return () => {}

    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!user?.uid) {
    return null
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex items-center justify-center rounded-lg border border-lab-border bg-white p-2 text-lab-text hover:bg-slate-50"
        aria-label="Abrir notificaciones"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationsDropdown userId={user.uid} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export default NotificationBell
