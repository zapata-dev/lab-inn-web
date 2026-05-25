function SelectField({ label, value, options, onChange }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-lab-border bg-white px-3 py-2 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-lab-border bg-white px-3 py-2 text-sm text-lab-text placeholder:text-lab-muted focus:border-lab-primary focus:outline-none"
      />
    </label>
  )
}

function InventoryFilters({ filters, options, onFiltersChange, onReset }) {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <section className="space-y-4 rounded-2xl border border-lab-border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-lab-text">Filtros</h2>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-lab-border px-3 py-1.5 text-sm font-medium text-lab-muted transition-colors hover:border-lab-primary/30 hover:text-lab-primary"
        >
          Limpiar filtros
        </button>
      </div>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Busqueda</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Buscar por marca, modelo, sucursal o status..."
          className="w-full rounded-xl border border-lab-border bg-white px-3 py-2 text-sm text-lab-text placeholder:text-lab-muted focus:border-lab-primary focus:outline-none"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Marca"
          value={filters.brand}
          options={options.brand}
          onChange={(value) => updateFilter('brand', value)}
        />
        <SelectField
          label="Modelo"
          value={filters.model}
          options={options.model}
          onChange={(value) => updateFilter('model', value)}
        />
        <SelectField
          label="Ano"
          value={filters.year}
          options={options.year}
          onChange={(value) => updateFilter('year', value)}
        />
        <SelectField
          label="Sucursal"
          value={filters.location}
          options={options.location}
          onChange={(value) => updateFilter('location', value)}
        />
        <NumberField
          label="Precio minimo"
          value={filters.minPrice}
          placeholder="Ej. 350000"
          onChange={(value) => updateFilter('minPrice', value)}
        />
        <NumberField
          label="Precio maximo"
          value={filters.maxPrice}
          placeholder="Ej. 950000"
          onChange={(value) => updateFilter('maxPrice', value)}
        />
        <SelectField
          label="Status"
          value={filters.status}
          options={options.status}
          onChange={(value) => updateFilter('status', value)}
        />
      </div>
    </section>
  )
}

export default InventoryFilters
