import NotificationItem from './NotificationItem'

function NotificationsList({ items, loading, error, onVisited }) {
  if (loading) {
    return <p className="rounded-lg border border-lab-border bg-slate-50 px-3 py-2 text-xs text-lab-muted">Cargando notificaciones...</p>
  }

  if (error) {
    return <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
  }

  if (!items.length) {
    return (
      <p className="rounded-lg border border-lab-border bg-slate-50 px-3 py-2 text-xs text-lab-muted">
        No hay notificaciones recientes.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.notificacionId || item.id}>
          <NotificationItem item={item} onVisited={onVisited} />
        </li>
      ))}
    </ul>
  )
}

export default NotificationsList
