import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle } from 'lucide-react'
import { markNotificationAsRead } from '../../services/notificationsService'
import { getNotificationTypeLabel } from '../../utils/notificationTypes'

function formatRelativeTime(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Hace un momento'
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Hace ${diffDays} d`

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function NotificationItem({ item, onVisited }) {
  const navigate = useNavigate()

  const typeLabel = useMemo(() => getNotificationTypeLabel(item?.tipo), [item?.tipo])

  const handleOpen = async () => {
    if (!item) return

    try {
      if (!item.leida) {
        await markNotificationAsRead(item.notificacionId || item.id)
      }
    } catch (_) {
      // Si falla marcar leida por reglas, aun dejamos navegar para no bloquear UX.
    }

    if (item.solicitudId) {
      navigate(`/solicitudes?solicitudId=${encodeURIComponent(item.solicitudId)}`)
    }

    onVisited?.()
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
        item?.leida
          ? 'border-lab-border bg-white hover:bg-slate-50'
          : 'border-lab-primary/30 bg-lab-primary/5 hover:bg-lab-primary/10'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="pt-0.5 text-lab-primary">
          {item?.leida ? <CheckCircle2 className="size-4" /> : <Circle className="size-4 fill-lab-primary/80" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-lab-muted">{typeLabel}</p>
          <p className="truncate text-sm font-semibold text-lab-text">{item?.titulo || 'Notificacion'}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-lab-muted">{item?.mensaje || 'Tienes una actualizacion.'}</p>
          <p className="mt-1 text-[11px] text-lab-muted">{formatRelativeTime(item?.createdAt)}</p>
        </div>
      </div>
    </button>
  )
}

export default NotificationItem
