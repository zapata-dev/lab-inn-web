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

const STATUS_COLORS = {
  completado: 'text-emerald-700 bg-emerald-50',
  completado_con_errores: 'text-amber-700 bg-amber-50',
  fallido: 'text-rose-700 bg-rose-50',
  procesando: 'text-blue-700 bg-blue-50',
}

function MetricCell({ label, value, highlight = false }) {
  return (
    <div className="px-4 py-2 text-center">
      <p className={`text-sm font-bold ${highlight ? 'text-amber-700' : 'text-lab-text'}`}>
        {value ?? '—'}
      </p>
      <p className="text-xs text-lab-muted">{label}</p>
    </div>
  )
}

function InventoryImportSummaryCard({ metrics, loading, error, onOpenHistory }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-lab-border bg-white px-4 py-3 text-sm text-lab-muted shadow-sm">
        Validando metricas del ultimo import...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
        No fue posible cargar metricas del ultimo import.
      </div>
    )
  }

  const displayImport = metrics?.latestSuccessfulImport || metrics?.latestImport
  if (!displayImport) return null

  const statusColorClass = STATUS_COLORS[displayImport.status] || 'text-slate-700 bg-slate-50'
  const hasMetrics = Boolean(metrics?.latestSuccessfulImport)

  return (
    <div className="rounded-2xl border border-lab-border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Ultimo import de inventario
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusColorClass}`}
            >
              {metrics?.statusLabel || displayImport.status}
            </span>
            {displayImport.finishedAt && (
              <span className="text-xs text-lab-muted">
                {formatRelativeTime(displayImport.finishedAt)}
              </span>
            )}
            {metrics?.completedWithWarnings && (
              <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                con warnings
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenHistory}
          className="shrink-0 rounded-lg border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:bg-slate-50"
        >
          Ver historial
        </button>
      </div>

      {hasMetrics && (
        <div className="grid grid-cols-4 divide-x divide-lab-border border-t border-lab-border">
          <MetricCell
            label="Unidades"
            value={metrics.latestSuccessfulImport.registrosUpserted}
          />
          <MetricCell
            label="Errores"
            value={metrics.latestSuccessfulImport.registrosConError}
            highlight={metrics.hasErrors}
          />
          <MetricCell
            label="Ausentes"
            value={metrics.missingUnitsCount}
            highlight={metrics.missingUnitsCount > 0}
          />
          <MetricCell
            label="Calidad"
            value={metrics.dataQualityScore != null ? `${metrics.dataQualityScore}%` : '—'}
          />
        </div>
      )}
    </div>
  )
}

export default InventoryImportSummaryCard
