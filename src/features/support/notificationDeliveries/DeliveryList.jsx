import DeliveryStatusBadge from './DeliveryStatusBadge'

function shortenId(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return 'N/D'
  if (normalized.length <= 18) return normalized
  return `${normalized.slice(0, 8)}...${normalized.slice(-8)}`
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

function summarizeError(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return ''
  return normalized.length > 70 ? `${normalized.slice(0, 70)}...` : normalized
}

function DeliveryList({ items, loading, error, onSelect, selectedDeliveryId }) {
  if (loading) {
    return (
      <p className="rounded-xl border border-lab-border bg-slate-50 px-4 py-3 text-sm text-lab-muted">
        Cargando entregas...
      </p>
    )
  }

  if (error) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
  }

  if (!items.length) {
    return (
      <p className="rounded-xl border border-lab-border bg-slate-50 px-4 py-3 text-sm text-lab-muted">
        No hay entregas para los filtros actuales.
      </p>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-lab-border text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-lab-muted">
            <tr>
              <th className="px-3 py-2 text-left">Delivery</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Solicitud</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Intentos</th>
              <th className="px-3 py-2 text-left">Error</th>
              <th className="px-3 py-2 text-left">Actualizado</th>
              <th className="px-3 py-2 text-right">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lab-border">
            {items.map((item) => {
              const isActive = selectedDeliveryId && selectedDeliveryId === item.deliveryId

              return (
                <tr key={item.deliveryId} className={isActive ? 'bg-lab-primary/5' : ''}>
                  <td className="px-3 py-2 font-mono text-xs text-lab-text">{shortenId(item.deliveryId)}</td>
                  <td className="px-3 py-2"><DeliveryStatusBadge status={item.status} /></td>
                  <td className="px-3 py-2 text-xs text-lab-text">{item.sourceType || 'N/D'}</td>
                  <td className="px-3 py-2 text-xs text-lab-text">{item.tipo || 'N/D'}</td>
                  <td className="px-3 py-2 text-xs text-lab-text">{shortenId(item.solicitudId)}</td>
                  <td className="px-3 py-2 text-xs text-lab-text">{shortenId(item.userId)}</td>
                  <td className="px-3 py-2 text-xs text-lab-text">{item.attemptCount ?? 0}</td>
                  <td className="px-3 py-2 text-xs text-rose-700">{item.status === 'failed' ? summarizeError(item.lastError) || 'Sin detalle' : '-'}</td>
                  <td className="px-3 py-2 text-xs text-lab-muted">{formatDate(item.updatedAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect?.(item)}
                      className="rounded-md border border-lab-border px-2 py-1 text-xs font-semibold text-lab-text hover:bg-slate-50"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DeliveryList
