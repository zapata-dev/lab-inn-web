import RequestStatusBadge from './RequestStatusBadge'

function formatDate(value) {
  if (!value) return 'Sin actividad'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin actividad'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function RequestsList({ items, loading, error, onSelect }) {
  if (loading) {
    return <p className="rounded-xl border border-lab-border bg-white px-4 py-3 text-sm text-lab-muted">Cargando solicitudes...</p>
  }

  if (error) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </p>
    )
  }

  if (!items.length) {
    return (
      <p className="rounded-xl border border-lab-border bg-white px-4 py-3 text-sm text-lab-muted">
        No hay solicitudes para mostrar.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((request) => (
        <article key={request.solicitudId} className="rounded-xl border border-lab-border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-lab-text">
                {request.unitSnapshot?.marca || 'Unidad'} {request.unitSnapshot?.modelo || ''}
              </h3>
              <p className="text-xs text-lab-muted">VIN: {request.unitVin || 'N/D'}</p>
              <p className="text-xs text-lab-muted">
                Solicitante: {request.sucursalSolicitanteNombre || request.sucursalSolicitanteId || 'N/D'}
              </p>
              <p className="text-xs text-lab-muted">
                Dueña: {request.sucursalDuenaNombre || request.sucursalDuenaId || 'N/D'}
              </p>
              <p className="text-xs text-lab-muted">Vendedor: {request.vendedorNombre || request.vendedorEmail || 'N/D'}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <RequestStatusBadge status={request.estado} />
              <span className="text-xs text-lab-muted">Ultima actividad: {formatDate(request.lastActivityAt || request.updatedAt)}</span>
              <button
                type="button"
                onClick={() => onSelect?.(request)}
                className="rounded-lg border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:border-lab-primary/40 hover:text-lab-primary"
              >
                Ver detalle
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default RequestsList
