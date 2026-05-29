import { EmptyState } from '../../../components/common'
import ImportStatusBadge from './ImportStatusBadge'

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

function ImportRow({ imp, onSelect }) {
  const qualityScore = imp.calidadResumen?.promedioScore

  return (
    <tr className="border-b border-lab-border last:border-b-0 hover:bg-slate-50">
      <td className="px-4 py-3">
        <p className="max-w-[180px] truncate font-mono text-xs text-lab-muted" title={imp.importId}>
          {imp.importId}
        </p>
      </td>
      <td className="px-4 py-3">
        <ImportStatusBadge status={imp.status} />
      </td>
      <td className="px-4 py-3 text-xs text-lab-text">{formatDate(imp.startedAt)}</td>
      <td className="px-4 py-3 text-center text-sm font-semibold text-lab-text">
        {imp.registrosUpserted}
      </td>
      <td
        className={`px-4 py-3 text-center text-sm font-semibold ${
          imp.registrosConError > 0 ? 'text-amber-700' : 'text-lab-muted'
        }`}
      >
        {imp.registrosConError}
      </td>
      <td
        className={`px-4 py-3 text-center text-sm font-semibold ${
          imp.registrosAusentes > 0 ? 'text-amber-700' : 'text-lab-muted'
        }`}
      >
        {imp.registrosAusentes}
      </td>
      <td className="px-4 py-3 text-center text-sm text-lab-muted">
        {qualityScore != null ? `${qualityScore}%` : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onSelect(imp)}
          className="rounded-lg border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:bg-slate-50"
        >
          Detalle
        </button>
      </td>
    </tr>
  )
}

function ImportList({ imports, loading, error, onSelectImport }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-lab-border bg-white px-4 py-8 text-center text-sm text-lab-muted shadow-sm">
        Cargando historial de imports...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        No fue posible cargar imports: {error}
      </div>
    )
  }

  if (!imports.length) {
    return (
      <EmptyState
        title="Sin imports registrados"
        description="No se encontraron corridas de import con los filtros actuales."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-lab-border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-lab-border bg-slate-50 text-xs font-semibold uppercase tracking-wide text-lab-muted">
          <tr>
            <th className="px-4 py-3">Import ID</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Inicio</th>
            <th className="px-4 py-3 text-center">Upsert</th>
            <th className="px-4 py-3 text-center">Errores</th>
            <th className="px-4 py-3 text-center">Ausentes</th>
            <th className="px-4 py-3 text-center">Calidad</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {imports.map((imp) => (
            <ImportRow key={imp.importId} imp={imp} onSelect={onSelectImport} />
          ))}
        </tbody>
      </table>
      <p className="border-t border-lab-border px-4 py-2 text-xs text-lab-muted">
        {imports.length} corrida{imports.length === 1 ? '' : 's'} mostrada{imports.length === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export default ImportList
