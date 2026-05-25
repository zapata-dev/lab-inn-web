import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InventoryDetailModal from '../features/inventory/InventoryDetailModal'
import InventoryFilters from '../features/inventory/InventoryFilters'
import InventoryGrid from '../features/inventory/InventoryGrid'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  saveInventoryCache,
} from '../services/inventoryService'

const EMPTY_FILTERS = {
  search: '',
  brand: '',
  model: '',
  year: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  status: '',
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
}

function getFilterOptions(items) {
  return {
    brand: uniqueSorted(items.map((item) => item.brand)),
    model: uniqueSorted(items.map((item) => item.model)),
    year: uniqueSorted(items.map((item) => item.year)),
    location: uniqueSorted(items.map((item) => item.location)),
    status: uniqueSorted(items.map((item) => item.status)),
  }
}

function matchesSearch(item, searchTerm) {
  if (!searchTerm) return true

  const target = `${item.brand} ${item.model} ${item.year} ${item.location} ${item.status}`.toLowerCase()
  return target.includes(searchTerm.toLowerCase())
}

function applyFilters(items, filters) {
  const minPrice = filters.minPrice ? Number(filters.minPrice) : null
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null

  return items.filter((item) => {
    if (!matchesSearch(item, filters.search)) return false
    if (filters.brand && item.brand !== filters.brand) return false
    if (filters.model && item.model !== filters.model) return false
    if (filters.year && item.year !== filters.year) return false
    if (filters.location && item.location !== filters.location) return false
    if (filters.status && item.status !== filters.status) return false
    if (minPrice !== null && Number.isFinite(minPrice) && item.price < minPrice) return false
    if (maxPrice !== null && Number.isFinite(maxPrice) && item.price > maxPrice) return false

    return true
  })
}

function formatLastUpdated(dateString) {
  if (!dateString) return 'Sin registro de actualizacion'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Sin registro de actualizacion'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function buildCopyText(unit) {
  const specsText = Object.entries(unit.specs || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  return [
    `Marca: ${unit.brand}`,
    `Modelo: ${unit.model}`,
    `Ano: ${unit.year || 'No especificado'}`,
    `Precio: ${unit.price || 0}`,
    `Kilometraje: ${unit.mileage || 'No especificado'}`,
    `Ubicacion: ${unit.location}`,
    `Status: ${unit.status}`,
    specsText,
  ]
    .filter(Boolean)
    .join('\n')
}

function Inventario() {
  const [inventory, setInventory] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const filteredUnits = useMemo(() => applyFilters(inventory, filters), [inventory, filters])
  const filterOptions = useMemo(() => getFilterOptions(inventory), [inventory])

  const refreshInventory = async (showSuccessMessage = false) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const items = await fetchInventoryFromCsv()
      saveInventoryCache(items)
      const cache = getInventoryCache()

      setInventory(items)
      setLastUpdated(cache.lastUpdated)

      if (showSuccessMessage) {
        setMessage({ type: 'success', text: 'Inventario actualizado correctamente.' })
      }
    } catch (error) {
      const cache = getInventoryCache()

      if (cache.items.length > 0) {
        setInventory(cache.items)
        setLastUpdated(cache.lastUpdated)
        setMessage({
          type: 'warning',
          text: 'No se pudo actualizar. Mostrando ultima version guardada.',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'No fue posible cargar inventario. Configura INVENTORY_CSV_URL y vuelve a intentar.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cache = getInventoryCache()

    if (cache.items.length > 0) {
      setInventory(cache.items)
      setLastUpdated(cache.lastUpdated)
      return
    }

    refreshInventory(false)
  }, [])

  const handleCopy = async (unit) => {
    try {
      await navigator.clipboard.writeText(buildCopyText(unit))
      setMessage({ type: 'success', text: 'Datos copiados al portapapeles.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudieron copiar los datos.' })
    }
  }

  const messageClass =
    message.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : message.type === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-lab-bg to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Link to="/" className="text-sm font-medium text-lab-primary hover:underline">
              Volver al Access Hub
            </Link>
            <h1 className="text-3xl font-bold text-lab-text">Inventario Nacional</h1>
            <p className="text-sm text-lab-muted">
              Ultima actualizacion: {formatLastUpdated(lastUpdated)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => refreshInventory(true)}
            disabled={loading}
            className="rounded-xl bg-lab-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Actualizando...' : 'Actualizar inventario'}
          </button>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>
            {message.text}
          </p>
        ) : null}

        <InventoryFilters
          filters={filters}
          options={filterOptions}
          onFiltersChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-lab-muted">
            {filteredUnits.length} resultado{filteredUnits.length === 1 ? '' : 's'}
          </p>
        </div>

        <InventoryGrid units={filteredUnits} onViewDetail={setSelectedUnit} />
      </div>

      <InventoryDetailModal
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onCopy={handleCopy}
      />
    </main>
  )
}

export default Inventario
