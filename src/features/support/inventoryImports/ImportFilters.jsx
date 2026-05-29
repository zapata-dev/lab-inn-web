const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'completado', label: 'Completado' },
  { value: 'completado_con_errores', label: 'Con errores' },
  { value: 'fallido', label: 'Fallido' },
  { value: 'procesando', label: 'Procesando' },
]

const LIMIT_OPTIONS = [
  { value: 25, label: '25 imports' },
  { value: 50, label: '50 imports' },
  { value: 100, label: '100 imports' },
]

function ImportFilters({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1 text-xs font-semibold text-lab-muted">
        Estado
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="block w-36 rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-xs font-semibold text-lab-muted">
        Mostrar
        <select
          value={filters.limitCount}
          onChange={(e) => onChange('limitCount', Number(e.target.value))}
          className="block w-36 rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
        >
          {LIMIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-lab-border px-3 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export default ImportFilters
