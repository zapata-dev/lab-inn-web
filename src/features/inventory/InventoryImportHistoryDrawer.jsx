import { X } from 'lucide-react'

function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diffMs = Date.now() - new Date(isoString).getTime()
  if (diffMs < 0) return 'ahora mismo'
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'hace menos de 1 min'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function renderEntries(obj) {
  if (!obj || typeof obj !== 'object') return '—'
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

const STATUS_LABELS = {
  completado: 'Completado',
  completado_con_errores: 'Con errores',
  fallido: 'Fallido',
  procesando: 'Procesando',
}

const STATUS_COLORS = {
  completado: 'bg-emerald-100 text-emerald-800',
  completado_con_errores: 'bg-amber-100 text-amber-800',
  fallido: 'bg-rose-100 text-rose-800',
  procesando: 'bg-blue-100 text-blue-800',
}

function ImportHistoryItem({ imp }) {
  const statusLabel = STATUS_LABELS[imp.status] || imp.status
  const statusColor = STATUS_COLORS[imp.status] || 'bg-slate-100 text-slate-800'

  const hasExpandable =
    imp.driftResumen ||
    (imp.erroresPorTipo && Object.keys(imp.erroresPorTipo).length > 0) ||
    (imp.warningsPorTipo && Object.keys(imp.warningsPorTipo).length > 0) ||
    (imp.unidadesPorSucursal && Object.keys(imp.unidadesPorSucursal).length > 0)

  return (
    <div className="space-y-2 rounded-xl border border-lab-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-lab-muted">{imp.importId}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`}
            >
              {statusLabel}
            </span>
            {imp.finishedAt && (
              <span className="text-xs text-lab-muted">{formatRelativeTime(imp.finishedAt)}</span>
            )}
          </div>
        </div>
        <p className="shrink-0 text-right text-xs text-lab-muted">{formatDate(imp.startedAt)}</p>
      </div>

      {(imp.registrosUpserted > 0 || imp.registrosConError > 0 || imp.registrosAusentes > 0) && (
        <div className="flex flex-wrap gap-3 text-xs text-lab-muted">
          {imp.registrosUpserted > 0 && <span>{imp.registrosUpserted} upsert</span>}
          {imp.registrosConError > 0 && (
            <span className="text-amber-700">{imp.registrosConError} errores</span>
          )}
          {imp.registrosAusentes > 0 && (
            <span className="text-amber-700">{imp.registrosAusentes} ausentes</span>
          )}
          {imp.calidadResumen?.promedioScore != null && (
            <span>calidad {imp.calidadResumen.promedioScore}%</span>
          )}
          {imp.promocionesActivas > 0 && <span>{imp.promocionesActivas} promos</span>}
        </div>
      )}

      {imp.errorResumen && (
        <p className="line-clamp-2 text-xs text-rose-700">{imp.errorResumen}</p>
      )}

      {hasExpandable && (
        <details className="text-xs">
          <summary className="cursor-pointer select-none text-lab-muted hover:text-lab-text">
            Ver detalles
          </summary>
          <div className="mt-2 space-y-1 border-l-2 border-lab-border pl-3">
            {imp.driftResumen && (
              <p>
                <span className="font-semibold">Drift:</span>{' '}
                {renderEntries(imp.driftResumen)}
              </p>
            )}
            {imp.erroresPorTipo && Object.keys(imp.erroresPorTipo).length > 0 && (
              <p>
                <span className="font-semibold">Errores:</span>{' '}
                {renderEntries(imp.erroresPorTipo)}
              </p>
            )}
            {imp.warningsPorTipo && Object.keys(imp.warningsPorTipo).length > 0 && (
              <p>
                <span className="font-semibold">Warnings:</span>{' '}
                {renderEntries(imp.warningsPorTipo)}
              </p>
            )}
            {imp.unidadesPorSucursal && Object.keys(imp.unidadesPorSucursal).length > 0 && (
              <p>
                <span className="font-semibold">Por sucursal:</span>{' '}
                {renderEntries(imp.unidadesPorSucursal)}
              </p>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

function InventoryImportHistoryDrawer({ isOpen, onClose, imports, loading, error }) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-lab-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-lab-text">Historial de imports</h2>
            <p className="text-xs text-lab-muted">
              {imports.length > 0
                ? `Ultimas ${imports.length} corridas registradas`
                : 'Sin corridas registradas'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-lab-muted hover:bg-slate-100 hover:text-lab-text"
            aria-label="Cerrar historial"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {loading && (
            <p className="text-sm text-lab-muted">Cargando historial...</p>
          )}
          {!loading && error && (
            <p className="text-sm text-rose-700">
              No fue posible cargar el historial de imports.
            </p>
          )}
          {!loading && !error && imports.length === 0 && (
            <p className="text-sm text-lab-muted">Sin imports registrados.</p>
          )}
          {imports.map((imp) => (
            <ImportHistoryItem key={imp.importId} imp={imp} />
          ))}
        </div>
      </aside>
    </>
  )
}

export default InventoryImportHistoryDrawer
