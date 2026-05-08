import { RotateCcw } from 'lucide-react'
import { Card, SearchBar } from '../../components/common'

function InventoryFilters({
  filters,
  onChange,
  onReset,
  branches = [],
  brands = [],
  years = [],
  statuses = [],
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-lab-text">Filtros de inventario</h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-lab-border bg-white px-3 py-2 text-sm font-semibold text-lab-muted transition hover:text-lab-text"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Limpiar filtros
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Sucursal</span>
          <select
            value={filters.branchId}
            onChange={(event) => onChange('branchId', event.target.value)}
            className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
          >
            <option value="">Todas</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Marca</span>
          <select
            value={filters.brand}
            onChange={(event) => onChange('brand', event.target.value)}
            className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
          >
            <option value="">Todas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Anio</span>
          <select
            value={filters.year}
            onChange={(event) => onChange('year', event.target.value)}
            className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
          >
            <option value="">Todos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
          >
            <option value="">Todos</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Precio minimo</span>
          <input
            type="number"
            min="0"
            value={filters.priceMin}
            onChange={(event) => onChange('priceMin', event.target.value)}
            className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
            placeholder="Ej. 100000"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Precio maximo</span>
          <input
            type="number"
            min="0"
            value={filters.priceMax}
            onChange={(event) => onChange('priceMax', event.target.value)}
            className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
            placeholder="Ej. 200000"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-lab-muted">Busqueda</span>
          <SearchBar
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Buscar por marca, modelo o configuracion"
          />
        </div>
      </div>
    </Card>
  )
}

export default InventoryFilters
