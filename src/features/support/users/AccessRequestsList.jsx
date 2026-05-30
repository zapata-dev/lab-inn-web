import { Card } from '../../../components/common'
import UserStatusBadge from './UserStatusBadge'

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

function AccessRequestsList({
  requests,
  loading,
  error,
  statusFilter,
  onStatusChange,
  onSelectRequest,
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-lab-text">Solicitudes de acceso</h2>
          <p className="text-sm text-lab-muted">Revisa y resuelve solicitudes de usuarios no autorizados.</p>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-lab-muted">
          Estado
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            className="rounded-md border border-lab-border bg-white px-2 py-1 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      {loading ? <p className="text-sm text-lab-muted">Cargando solicitudes...</p> : null}

      {!loading && requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-lab-border bg-slate-50 px-4 py-5 text-sm text-lab-muted">
          No hay solicitudes para el filtro seleccionado.
        </p>
      ) : null}

      {!loading && requests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lab-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-lab-muted">
                <th className="px-2 py-2 font-semibold">Usuario</th>
                <th className="px-2 py-2 font-semibold">Estado</th>
                <th className="px-2 py-2 font-semibold">Rol solicitado</th>
                <th className="px-2 py-2 font-semibold">Sucursal</th>
                <th className="px-2 py-2 font-semibold">Actualizado</th>
                <th className="px-2 py-2 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-2 py-3">
                    <p className="font-medium text-lab-text">{request.nombre || request.displayName || 'Sin nombre'}</p>
                    <p className="text-xs text-lab-muted">{request.email || 'Sin correo'}</p>
                  </td>
                  <td className="px-2 py-3">
                    <UserStatusBadge status={request.status} />
                  </td>
                  <td className="px-2 py-3 text-lab-text">{request.requestedRole || 'Sin rol'}</td>
                  <td className="px-2 py-3 text-lab-text">
                    {request.requestedSucursalNombre || request.requestedSucursalId || 'Sin sucursal'}
                  </td>
                  <td className="px-2 py-3 text-xs text-lab-muted">
                    {formatDate(request.updatedAt || request.createdAt)}
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => onSelectRequest(request)}
                      className="rounded-md border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:border-lab-primary hover:text-lab-primary"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  )
}

export default AccessRequestsList
