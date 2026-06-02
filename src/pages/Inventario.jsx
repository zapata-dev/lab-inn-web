import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ExportInventoryCatalogPdfButton from '../features/inventory/ExportInventoryCatalogPdfButton'
import InventoryDetailModal from '../features/inventory/InventoryDetailModal'
import InventoryFilters from '../features/inventory/InventoryFilters'
import InventoryGrid from '../features/inventory/InventoryGrid'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  INVENTORY_FILTER_FIELDS,
  saveInventoryCache,
} from '../services/inventoryService'
import { getUnitFieldValue } from '../utils/inventoryUnitUtils'
import { mixInventoryForDisplay } from '../utils/inventoryMixUtils'

const SEARCHABLE_KEYS = ['marca', 'modelo', 'vin', 'vinCompleto', 'motor', 'tipoUnidad', 'descripcion', 'placas']
const FILTER_LABELS = INVENTORY_FILTER_FIELDS.reduce((accumulator, field) => {
  accumulator[field.key] = field.label
  return accumulator
}, {})
const DESKTOP_PAGE_SIZE = 12
const MOBILE_PAGE_SIZE = 6

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((first, second) => first.localeCompare(second, 'es'))
}

function parseNumber(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.,-]/g, '')
  if (!cleaned) return null

  let normalized = cleaned

  if (cleaned.includes('.') && cleaned.includes(',')) {
    normalized = cleaned.replace(/,/g, '')
  } else if (cleaned.includes(',')) {
    const commaCount = (cleaned.match(/,/g) || []).length
    const [left = '', right = ''] = cleaned.split(',')
    const isThousandsSeparator = commaCount > 1 || (right.length === 3 && left.length >= 1)
    normalized = isThousandsSeparator ? cleaned.replace(/,/g, '') : cleaned.replace(',', '.')
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

function getNumericFieldValue(unit, key) {
  if (key === 'precio') return unit.precio
  if (key === 'kilometros') return unit.kilometros

  return parseNumber(getUnitFieldValue(unit, key))
}

function hasValue(unit, key, type) {
  if (type === 'numberRange') {
    const numericValue = getNumericFieldValue(unit, key)
    return Number.isFinite(numericValue)
  }

  return String(getUnitFieldValue(unit, key) ?? '').trim().length > 0
}

function detectAvailableFilters(units) {
  const detected = INVENTORY_FILTER_FIELDS.filter((field) =>
    units.some((unit) => hasValue(unit, field.key, field.type))
  )
  if (!detected.some((field) => field.key === 'subempresa')) {
    const subempresaDefinition = INVENTORY_FILTER_FIELDS.find((field) => field.key === 'subempresa')
    if (subempresaDefinition) detected.push(subempresaDefinition)
  }
  return detected
}

function matchesSearch(unit, searchTerm) {
  if (!searchTerm) return true
  const normalizedSearch = normalizeText(searchTerm)

  return SEARCHABLE_KEYS.some((key) => normalizeText(getUnitFieldValue(unit, key)).includes(normalizedSearch))
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

        if (!normalizeText(getUnitFieldValue(unit, definition.key)).includes(filterValue)) return false
        continue
      }

      const selectedValue = filters[definition.key]
      if (!selectedValue) continue
      if (String(getUnitFieldValue(unit, definition.key)).trim() !== String(selectedValue).trim()) return false
    }

    return true
  })
}

function removeDefinitionFromFilters(filters, definition) {
  const nextFilters = { ...filters }

  if (definition.type === 'numberRange') {
    delete nextFilters[`${definition.key}Min`]
    delete nextFilters[`${definition.key}Max`]
    return nextFilters
  }

  delete nextFilters[definition.key]
  return nextFilters
}

function buildDependentSelectOptions(units, filters, search, definitions) {
  const optionsByKey = {}

  definitions.forEach((definition) => {
    if (definition.type !== 'select') return

    const scopedFilters = removeDefinitionFromFilters(filters, definition)
    const scopedUnits = applyFilters(units, scopedFilters, search, definitions)
    const counter = new Map()

    scopedUnits.forEach((unit) => {
      const value = String(getUnitFieldValue(unit, definition.key) ?? '').trim()
      if (!value) return
      counter.set(value, (counter.get(value) ?? 0) + 1)
    })

    const baseValues =
      definition.key === 'subempresa' ? ['Selectrucks', 'GoOn'] : uniqueSorted([...counter.keys()])
    const options = baseValues.map((value) => ({
      value,
      count: counter.get(value) ?? 0,
      label: `${value} (${counter.get(value) ?? 0})`,
    }))

    optionsByKey[definition.key] = {
      totalCount: scopedUnits.length,
      options,
    }
  })

  return optionsByKey
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
  return [
    `Marca: ${unit.marca || 'No especificado'}`,
    `Modelo: ${unit.modelo || 'No especificado'}`,
    `Ano: ${unit.anio || 'No especificado'}`,
    `Precio: ${unit.precio ?? 'No especificado'}`,
    `Kilometros: ${unit.kilometros ?? 'No especificado'}`,
    `Motor: ${unit.motor || 'No especificado'}`,
    `Transmision: ${unit.transmision || 'No especificado'}`,
    `Ubicacion: ${unit.ubicacion || 'No especificado'}`,
    `VIN completo: ${unit.vinCompleto || 'No especificado'}`,
    `VIN: ${unit.vin || 'No especificado'}`,
  ].join('\n')
}

function buildVisiblePageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1])
  const bounded = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)

  if (bounded[1] > 2) bounded.splice(1, 0, -1)
  if (bounded[bounded.length - 2] < totalPages - 1) bounded.splice(bounded.length - 1, 0, -1)

  return bounded
}

function Pagination({ currentPage, totalPages, onChange }) {
  const visiblePages = buildVisiblePageNumbers(currentPage, totalPages)

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lab-border bg-white px-4 py-3 shadow-sm"
      aria-label="Paginacion del inventario"
    >
      <p className="text-sm font-medium text-lab-muted">
        Pagina {currentPage} de {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 rounded-lg border border-lab-border px-3 py-1.5 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </button>

        {visiblePages.map((pageNumber, index) =>
          pageNumber === -1 ? (
            <span key={`ellipsis-${index}`} className="px-1 text-lab-muted">
              ...
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onChange(pageNumber)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                pageNumber === currentPage
                  ? 'bg-lab-primary text-white'
                  : 'border border-lab-border text-lab-text hover:border-lab-primary/40 hover:text-lab-primary'
              }`}
            >
              {pageNumber}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-lab-border px-3 py-1.5 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

function Inventario() {
  const [inventory, setInventory] = useState([])
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [displayOrderMode, setDisplayOrderMode] = useState('mixed')
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const hasPaginatedOnce = useRef(false)

  const availableFilterDefinitions = useMemo(() => detectAvailableFilters(inventory), [inventory])
  const dependentFilterOptions = useMemo(
    () => buildDependentSelectOptions(inventory, filters, search, availableFilterDefinitions),
    [inventory, filters, search, availableFilterDefinitions]
  )
  const filteredUnits = useMemo(
    () => applyFilters(inventory, filters, search, availableFilterDefinitions),
    [inventory, filters, search, availableFilterDefinitions]
  )
  const displayUnits = useMemo(
    () => (displayOrderMode === 'mixed' ? mixInventoryForDisplay(filteredUnits) : filteredUnits),
    [displayOrderMode, filteredUnits]
  )
  const activeChips = useMemo(() => getActiveChips(search, filters), [search, filters])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(displayUnits.length / pageSize)),
    [displayUnits.length, pageSize]
  )
  const pageUnits = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return displayUnits.slice(start, start + pageSize)
  }, [displayUnits, currentPage, pageSize])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const syncPageSize = () => setPageSize(media.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE)
    syncPageSize()

    media.addEventListener('change', syncPageSize)
    return () => media.removeEventListener('change', syncPageSize)
  }, [])

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

  useEffect(() => {
    setFilters((previous) => {
      const next = { ...previous }
      let changed = false

      availableFilterDefinitions.forEach((definition) => {
        if (definition.type !== 'select') return
        const selected = String(previous[definition.key] ?? '').trim()
        if (!selected) return

        const availableOptions = dependentFilterOptions[definition.key]?.options ?? []
        const exists = availableOptions.some((option) => option.value === selected)

        if (!exists) {
          next[definition.key] = ''
          changed = true
        }
      })

      return changed ? next : previous
    })
  }, [availableFilterDefinitions, dependentFilterOptions])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters, displayOrderMode])

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages))
  }, [totalPages])

  useEffect(() => {
    if (!hasPaginatedOnce.current) {
      hasPaginatedOnce.current = true
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

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
      setMessage({ type: 'success', text: 'Información copiada al portapapeles.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo copiar la información.' })
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
            <div className="space-y-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver a Mi Oficina
              </Link>
              <h1 className="text-3xl font-bold text-lab-text">Marketplace de inventario nacional</h1>
              <p className="text-sm text-lab-muted">
                Ultima actualizacion: {formatLastUpdated(lastUpdated)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => refreshInventory(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-lab-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                {loading ? 'Actualizando inventario...' : 'Actualizar inventario'}
              </button>
              <ExportInventoryCatalogPdfButton
                units={displayUnits}
                activeChips={activeChips}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-lab-muted">
            <span className="inline-flex items-center gap-2 rounded-full bg-lab-bg px-3 py-1">
              <Search className="size-4" aria-hidden="true" />
              {displayUnits.length} resultados
            </span>
            <span className="rounded-full bg-lab-bg px-3 py-1">Total cargadas: {inventory.length}</span>
            <span className="rounded-full bg-lab-bg px-3 py-1">
              Mostrando {pageUnits.length} de {displayUnits.length} en esta pagina
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lab-border bg-lab-bg/70 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                Orden de visualizacion
              </p>
              <p className="text-sm text-lab-muted">
                El orden mixto distribuye mejor modelos, años, sucursales e imágenes.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-lab-border bg-white p-1">
              <button
                type="button"
                onClick={() => setDisplayOrderMode('mixed')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  displayOrderMode === 'mixed'
                    ? 'bg-lab-primary text-white'
                    : 'text-lab-muted hover:text-lab-text'
                }`}
              >
                Mixto recomendado
              </button>
              <button
                type="button"
                onClick={() => setDisplayOrderMode('original')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  displayOrderMode === 'original'
                    ? 'bg-lab-primary text-white'
                    : 'text-lab-muted hover:text-lab-text'
                }`}
              >
                CSV original
              </button>
            </div>
          </div>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>
            {message.text}
          </p>
        ) : null}

        <section className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <InventoryFilters
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            filterDefinitions={availableFilterDefinitions}
            optionsByKey={dependentFilterOptions}
            onFilterChange={handleFilterChange}
            onReset={() => {
              setSearch('')
              setFilters({})
              setCurrentPage(1)
            }}
            activeChips={activeChips}
            onRemoveChip={handleRemoveChip}
            resultCount={filteredUnits.length}
          />

          <div className="space-y-4">
            <InventoryGrid
              units={pageUnits}
              onViewDetail={setSelectedUnit}
              loading={loading && inventory.length === 0}
            />

            {filteredUnits.length > 0 ? (
              <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            ) : null}
          </div>
        </section>
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
