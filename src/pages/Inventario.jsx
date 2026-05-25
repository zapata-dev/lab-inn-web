import { RefreshCw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InventoryDetailModal from '../features/inventory/InventoryDetailModal'
import InventoryFilters from '../features/inventory/InventoryFilters'
import InventoryGrid from '../features/inventory/InventoryGrid'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  INVENTORY_FILTER_FIELDS,
  saveInventoryCache,
} from '../services/inventoryService'

const SEARCHABLE_KEYS = ['brand', 'model', 'vin', 'plates', 'motor', 'unitType', 'description']
const FILTER_LABELS = INVENTORY_FILTER_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.label
  return acc
}, {})

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
}

function parseNumber(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.,-]/g, '')
  if (!cleaned) return null

  const normalized = cleaned.includes(',') && cleaned.includes('.')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(/,/g, '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

function getNumericFieldValue(unit, key) {
  if (key === 'price') return unit.price
  if (key === 'mileage') return unit.mileageValue ?? parseNumber(unit.mileage)

  return parseNumber(unit[key])
}

function hasValue(unit, key, type) {
  if (type === 'numberRange') {
    const numeric = getNumericFieldValue(unit, key)
    return Number.isFinite(numeric)
  }

  return String(unit[key] ?? '').trim().length > 0
}

function detectAvailableFilters(units) {
  return INVENTORY_FILTER_FIELDS.filter((field) => units.some((unit) => hasValue(unit, field.key, field.type)))
}

function buildFilterOptions(units, definitions) {
  const optionsByKey = {}

  definitions.forEach((definition) => {
    if (definition.type !== 'select') return
    optionsByKey[definition.key] = uniqueSorted(units.map((unit) => String(unit[definition.key] ?? '').trim()))
  })

  return optionsByKey
}

function matchesSearch(unit, searchTerm) {
  if (!searchTerm) return true
  const normalizedSearch = normalizeText(searchTerm)

  return SEARCHABLE_KEYS.some((key) => normalizeText(unit[key]).includes(normalizedSearch))
}

function applyFilters(units, filters, search, definitions) {
  return units.filter((unit) => {
    if (!matchesSearch(unit, search)) return false

    for (const definition of definitions) {
      if (definition.type === 'numberRange') {
        const minValue = filters[`${definition.key}Min`]
        const maxValue = filters[`${definition.key}Max`]
        if (!minValue && !maxValue) continue

        const unitValue = getNumericFieldValue(unit, definition.key)
        if (!Number.isFinite(unitValue)) return false

        if (minValue && unitValue < Number(minValue)) return false
        if (maxValue && unitValue > Number(maxValue)) return false
        continue
      }

      if (definition.type === 'text') {
        const filterValue = normalizeText(filters[definition.key])
        if (!filterValue) continue

        if (!normalizeText(unit[definition.key]).includes(filterValue)) return false
        continue
      }

      const selectedValue = filters[definition.key]
      if (!selectedValue) continue
      if (unit[definition.key] !== selectedValue) return false
    }

    return true
  })
}

function getActiveChips(search, filters) {
  const chips = []

  if (search) {
    chips.push({ key: 'search', label: 'Busqueda', value: search })
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (!String(value ?? '').trim()) return

    if (key.endsWith('Min')) {
      const fieldKey = key.replace('Min', '')
      chips.push({ key, label: `${FILTER_LABELS[fieldKey] || fieldKey} min`, value })
      return
    }

    if (key.endsWith('Max')) {
      const fieldKey = key.replace('Max', '')
      chips.push({ key, label: `${FILTER_LABELS[fieldKey] || fieldKey} max`, value })
      return
    }

    chips.push({ key, label: FILTER_LABELS[key] || key, value })
  })

  return chips
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
  const details = [
    `Marca: ${unit.brand}`,
    `Modelo: ${unit.model}`,
    `Ano: ${unit.year || 'No especificado'}`,
    `Precio: ${unit.price || 0}`,
    `Ubicacion: ${unit.location}`,
    `Status: ${unit.status}`,
    `Motor: ${unit.motor || 'No especificado'}`,
    `Transmision: ${unit.transmission || 'No especificada'}`,
    `VIN: ${unit.vin || 'No especificado'}`,
    `Placas: ${unit.plates || 'No especificado'}`,
  ]

  const specs = Object.entries(unit.specs || {}).map(([key, value]) => `${key}: ${value}`)
  return [...details, ...specs].join('\n')
}

function Inventario() {
  const [inventory, setInventory] = useState([])
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const availableFilterDefinitions = useMemo(
    () => detectAvailableFilters(inventory),
    [inventory]
  )
  const filterOptions = useMemo(
    () => buildFilterOptions(inventory, availableFilterDefinitions),
    [inventory, availableFilterDefinitions]
  )
  const filteredUnits = useMemo(
    () => applyFilters(inventory, filters, search, availableFilterDefinitions),
    [inventory, filters, search, availableFilterDefinitions]
  )
  const activeChips = useMemo(() => getActiveChips(search, filters), [search, filters])

  useEffect(() => {
    setFilters((previous) => {
      const validKeys = new Set(
        availableFilterDefinitions.flatMap((definition) =>
          definition.type === 'numberRange'
            ? [`${definition.key}Min`, `${definition.key}Max`]
            : [definition.key]
        )
      )

      const next = {}
      Object.entries(previous).forEach(([key, value]) => {
        if (validKeys.has(key)) next[key] = value
      })

      return next
    })
  }, [availableFilterDefinitions])

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
          text: 'No fue posible cargar inventario. Verifica la URL CSV publica e intenta de nuevo.',
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
      setMessage({ type: 'success', text: 'Informacion copiada al portapapeles.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo copiar la informacion.' })
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }

  const handleRemoveChip = (key) => {
    if (key === 'search') {
      setSearch('')
      return
    }

    setFilters((previous) => ({ ...previous, [key]: '' }))
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
        <header className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <Link to="/" className="text-sm font-medium text-lab-primary hover:underline">
                Volver al Access Hub
              </Link>
              <h1 className="text-3xl font-bold text-lab-text">Marketplace de inventario nacional</h1>
              <p className="text-sm text-lab-muted">
                Ultima actualizacion: {formatLastUpdated(lastUpdated)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshInventory(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-lab-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? 'Actualizando inventario...' : 'Actualizar inventario'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-lab-muted">
            <span className="inline-flex items-center gap-2 rounded-full bg-lab-bg px-3 py-1">
              <Search className="size-4" aria-hidden="true" />
              {filteredUnits.length} resultados
            </span>
            <span className="rounded-full bg-lab-bg px-3 py-1">Total cargadas: {inventory.length}</span>
          </div>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>
            {message.text}
          </p>
        ) : null}

        <InventoryFilters
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          filterDefinitions={availableFilterDefinitions}
          optionsByKey={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={() => {
            setSearch('')
            setFilters({})
          }}
          activeChips={activeChips}
          onRemoveChip={handleRemoveChip}
        />

        <InventoryGrid
          units={filteredUnits}
          onViewDetail={setSelectedUnit}
          loading={loading && inventory.length === 0}
        />
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
