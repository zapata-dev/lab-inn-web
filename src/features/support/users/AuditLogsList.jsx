import { Badge, Card } from '../../../components/common'

const actionConfig = {
  access_approved: {
    label: 'Aprobado',
    variant: 'success',
  },
  access_rejected: {
    label: 'Rechazado',
    variant: 'danger',
  },
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function getActionMeta(action) {
  return actionConfig[action] || { label: action || 'Desconocido', variant: 'info' }
}

function AuditLogsList({ logs, loading, error }) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-lab-text">Historial</h2>
          <p className="text-sm text-lab-muted">
            Trazabilidad de aprobaciones y rechazos realizados por soporte.
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      {loading ? <p className="text-sm text-lab-muted">Cargando historial...</p> : null}

      {!loading && logs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-lab-border bg-slate-50 px-4 py-5 text-sm text-lab-muted">
          Aún no hay eventos de auditoría.
        </p>
      ) : null}

      {!loading && logs.length > 0 ? (
        <div className="space-y-3">
          <div className="grid gap-3 lg:hidden">
            {logs.map((log) => {
              const meta = getActionMeta(log.action)

              return (
                <article key={log.id} className="rounded-xl border border-lab-border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-lab-muted">Fecha</p>
                      <p className="text-sm font-semibold text-lab-text">{formatDate(log.createdAt)}</p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-lab-muted">Usuario afectado</dt>
                      <dd className="font-medium text-lab-text">{log.targetName || 'Sin nombre'}</dd>
                      <dd className="text-xs text-lab-muted">{log.targetEmail || 'Sin correo'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-lab-muted">Rol</dt>
                      <dd className="font-medium text-lab-text">{log.assignedRole || 'Sin rol'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-lab-muted">Sucursal</dt>
                      <dd className="font-medium text-lab-text">{log.assignedBranch || 'Sin sucursal'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-lab-muted">Realizado por</dt>
                      <dd className="font-medium text-lab-text">{log.performedByName || 'Sin dato'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-lab-muted">Notas</dt>
                      <dd className="font-medium text-lab-text">{log.decisionNote || 'Sin notas'}</dd>
                    </div>
                  </dl>
                </article>
              )
            })}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-lab-border text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-lab-muted">
                  <th className="px-3 py-2 font-semibold">Fecha</th>
                  <th className="px-3 py-2 font-semibold">Acción</th>
                  <th className="px-3 py-2 font-semibold">Usuario afectado</th>
                  <th className="px-3 py-2 font-semibold">Correo afectado</th>
                  <th className="px-3 py-2 font-semibold">Rol asignado</th>
                  <th className="px-3 py-2 font-semibold">Sucursal</th>
                  <th className="px-3 py-2 font-semibold">Realizado por</th>
                  <th className="px-3 py-2 font-semibold">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const meta = getActionMeta(log.action)

                  return (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap p-3 text-xs text-lab-muted">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-3">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="p-3 text-lab-text">{log.targetName || 'Sin nombre'}</td>
                      <td className="p-3 text-lab-text">{log.targetEmail || 'Sin correo'}</td>
                      <td className="p-3 text-lab-text">{log.assignedRole || 'Sin rol'}</td>
                      <td className="p-3 text-lab-text">{log.assignedBranch || 'Sin sucursal'}</td>
                      <td className="p-3 text-lab-text">{log.performedByName || 'Sin dato'}</td>
                      <td className="p-3 text-lab-text">
                        <span className="line-clamp-2">{log.decisionNote || 'Sin notas'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Card>
  )
}

export default AuditLogsList
