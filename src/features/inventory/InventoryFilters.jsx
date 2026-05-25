import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

function SelectField({ label, value, options, totalCount, onChange }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-lab-border bg-white px-3 py-2.5 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
      >
        <option value="">{`Todos (${totalCount})`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({ label, value, placeholder, onChange }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-lab-border bg-white px-3 py-2.5 text-sm text-lab-text placeholder:text-lab-muted focus:border-lab-primary focus:outline-none"
      />
    </label>
  )
}

function NumberRangeField({ label, minKey, maxKey, filters, onChange }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          value={filters[minKey] ?? ''}
          onChange={(event) => onChange(minKey, event.target.value)}
          placeholder="Min"
          className="w-full rounded-xl border border-lab-border bg-white px-3 py-2.5 text-sm text-lab-text placeholder:text-lab-muted focus:border-lab-primary focus:outline-none"
        />
        <input
          type="number"
          min="0"
          value={filters[maxKey] ?? ''}
          onChange={(event) => onChange(maxKey, event.target.value)}
          placeholder="Max"
          className="w-full rounded-xl border border-lab-border bg-white px-3 py-2.5 text-sm text-lab-text placeholder:text-lab-muted focus:border-lab-primary focus:outline-none"
        />
      </div>
    </div>
  )
}

function InventoryFilters({
  search,
  onSearchChange,
  filters,
  filterDefinitions,
  optionsByKey,
  onFilterChange,
  onReset,
  activeChips,
  onRemoveChip,
  resultCount,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <aside className="space-y-4 rounded-2xl border border-lab-border bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-lab-text">Filtros del marketplace</h2>
          <p className="text-sm text-lab-muted">{resultCount} unidades encontradas</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen((previous) => !previous)}
          className="inline-flex items-center gap-2 rounded-xl border border-lab-border bg-white px-3 py-2 text-sm font-semibold text-lab-text lg:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
          <ChevronDown
            className={`size-4 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className={`space-y-4 ${isMobileOpen ? 'block' : 'hidden'} lg:block`}>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Buscador global</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por marca, modelo, VIN, placas, motor, tipo de unidad o descripcion..."
            className="w-full rounded-xl border border-lab-border bg-white px-3 py-2.5 text-sm text-lab-text placeholder:text-lab-muted focus:border-lab-primary focus:outline-none"
          />
        </label>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-lab-border bg-slate-50 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Filtros activos</span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-lab-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Limpiar filtros
          </button>
        </div>

        {activeChips.length ? (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() => onRemoveChip(chip.key)}
                className="rounded-full border border-lab-primary/20 bg-lab-primary/5 px-3 py-1 text-xs font-medium text-lab-primary transition-colors hover:bg-lab-primary hover:text-white"
              >
                {chip.label}: {chip.value} x
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-lab-muted">Sin filtros seleccionados.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {filterDefinitions.map((definition) => {
            if (definition.type === 'numberRange') {
              return (
                <NumberRangeField
                  key={definition.key}
                  label={definition.label}
                  minKey={`${definition.key}Min`}
                  maxKey={`${definition.key}Max`}
                  filters={filters}
                  onChange={onFilterChange}
                />
              )
            }

            if (definition.type === 'text') {
              return (
                <TextField
                  key={definition.key}
                  label={definition.label}
                  value={filters[definition.key] ?? ''}
                  onChange={(value) => onFilterChange(definition.key, value)}
                  placeholder={`Filtrar por ${definition.label.toLowerCase()}`}
                />
              )
            }

            return (
              <SelectField
                key={definition.key}
                label={definition.label}
                value={filters[definition.key] ?? ''}
                options={optionsByKey[definition.key]?.options ?? []}
                totalCount={optionsByKey[definition.key]?.totalCount ?? resultCount}
                onChange={(value) => onFilterChange(definition.key, value)}
              />
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default InventoryFilters
