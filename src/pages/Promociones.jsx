import { ArrowLeft, RefreshCw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InventoryDetailModal from '../features/inventory/InventoryDetailModal'
import InventoryFilters from '../features/inventory/InventoryFilters'
import PromotionCard from '../features/promotions/PromotionCard'
import { fetchInventoryFromCsv, getInventoryCache, saveInventoryCache } from '../services/inventoryService'
import { hasPromotion } from '../utils/promotionUtils'

const PROMOTION_FILTER_FIELDS = [
  { key: 'marca', label: 'Marca', type: 'select' },
  { key: 'anio', label: 'Ano', type: 'select' },
  { key: 'ubicacion', label: 'Ubicacion', type: 'select' },
  { key: 'precio', label: 'Precio', type: 'numberRange' },
]

const SEARCHABLE_KEYS = ['marca', 'modelo', 'anio', 'vin', 'vinCompleto', 'motor', 'ubicacion', 'promocion']
const FILTER_LABELS = PROMOTION_FILTER_FIELDS.reduce((accumulator, field) => {
  accumulator[field.key] = field.label
  return accumulator
}, {})

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

        if (minValue && (!Number.isFinite(unit.precio) || unit.precio < Number(minValue))) return false
        if (maxValue && (!Number.isFinite(unit.precio) || unit.precio > Number(maxValue))) return false
        continue
      }

      const selectedValue = String(filters[definition.key] ?? '').trim()
      if (!selectedValue) continue
      if (String(unit[definition.key] ?? '').trim() !== selectedValue) return false
    }

    return true
  })
}

function hasFieldValue(unit, definition) {
  if (definition.type === 'numberRange') {
    return Number.isFinite(unit.precio)
  }

  return String(unit[definition.key] ?? '').trim().length > 0
}

function detectAvailableFilters(units) {
  return PROMOTION_FILTER_FIELDS.filter((definition) => units.some((unit) => hasFieldValue(unit, definition)))
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
      const value = String(unit[definition.key] ?? '').trim()
      if (!value) return
      counter.set(value, (counter.get(value) ?? 0) + 1)
    })

    const options = uniqueSorted([...counter.keys()]).map((value) => ({
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
    `Promocion: ${unit.promocion || 'No especificado'}`,
  ].join('\n')
}

function PromotionSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-lab-border bg-white p-4 shadow-sm">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-20 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </section>
  )
}

function Promociones() {
  const [inventory, setInventory] = useState([])
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const promotionUnits = useMemo(() => inventory.filter(hasPromotion), [inventory])
  const availableFilterDefinitions = useMemo(() => detectAvailableFilters(promotionUnits), [promotionUnits])
  const optionsByKey = useMemo(
    () => buildDependentSelectOptions(promotionUnits, filters, search, availableFilterDefinitions),
    [promotionUnits, filters, search, availableFilterDefinitions]
  )
  const filteredPromotions = useMemo(
    () => applyFilters(promotionUnits, filters, search, availableFilterDefinitions),
    [promotionUnits, filters, search, availableFilterDefinitions]
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

  useEffect(() => {
    setFilters((previous) => {
      const next = { ...previous }
      let changed = false

      availableFilterDefinitions.forEach((definition) => {
        if (definition.type !== 'select') return

        const selected = String(previous[definition.key] ?? '').trim()
        if (!selected) return

        const availableOptions = optionsByKey[definition.key]?.options ?? []
        const exists = availableOptions.some((option) => option.value === selected)

        if (!exists) {
          next[definition.key] = ''
          changed = true
        }
      })

      return changed ? next : previous
    })
  }, [availableFilterDefinitions, optionsByKey])

  const refreshPromotions = async (showSuccessMessage = false) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const items = await fetchInventoryFromCsv()
      saveInventoryCache(items)
      const cache = getInventoryCache()

      setInventory(items)
      setLastUpdated(cache.lastUpdated)

      if (showSuccessMessage) {
        setMessage({ type: 'success', text: 'Promociones actualizadas correctamente.' })
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
          text: 'No fue posible cargar promociones. Verifica la URL CSV publica e intenta de nuevo.',
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

    refreshPromotions(false)
  }, [])

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

  const handleCopy = async (unit) => {
    try {
      await navigator.clipboard.writeText(buildCopyText(unit))
      setMessage({ type: 'success', text: 'Informacion copiada al portapapeles.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo copiar la informacion.' })
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
        <header className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver a Mi Oficina Virtual
              </Link>
              <h1 className="text-3xl font-bold text-lab-text">Catalogo de Promociones</h1>
              <p className="text-sm text-lab-muted">Ultima actualizacion: {formatLastUpdated(lastUpdated)}</p>
            </div>

            <button
              type="button"
              onClick={() => refreshPromotions(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-lab-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? 'Actualizando promociones...' : 'Actualizar promociones'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-lab-muted">
            <span className="inline-flex items-center gap-2 rounded-full bg-lab-bg px-3 py-1">
              <Search className="size-4" aria-hidden="true" />
              {filteredPromotions.length} promociones vigentes
            </span>
            <span className="rounded-full bg-lab-bg px-3 py-1">Total con promocion: {promotionUnits.length}</span>
          </div>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>{message.text}</p>
        ) : null}

        <section className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <InventoryFilters
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            filterDefinitions={availableFilterDefinitions}
            optionsByKey={optionsByKey}
            onFilterChange={handleFilterChange}
            onReset={() => {
              setSearch('')
              setFilters({})
            }}
            activeChips={activeChips}
            onRemoveChip={handleRemoveChip}
            resultCount={filteredPromotions.length}
          />

          <div>
            {loading && promotionUnits.length === 0 ? (
              <PromotionSkeleton />
            ) : promotionUnits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-lab-border bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-semibold text-lab-text">No hay promociones vigentes por ahora.</h3>
                <p className="mt-2 text-sm text-lab-muted">
                  Cuando el inventario tenga una promocion valida en el CSV, aparecera automaticamente aqui.
                </p>
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-lab-border bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-semibold text-lab-text">No encontramos promociones con esos filtros.</h3>
                <p className="mt-2 text-sm text-lab-muted">Prueba limpiando filtros para ver mas opciones.</p>
              </div>
            ) : (
              <section className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPromotions.map((unit) => (
                  <PromotionCard key={unit.id} unit={unit} onViewDetail={setSelectedUnit} />
                ))}
              </section>
            )}
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

export default Promociones
