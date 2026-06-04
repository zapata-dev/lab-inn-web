import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import promotionsHeroImage from '../assets/promociones-hero.jpeg'
import InventoryDetailModal from '../features/inventory/InventoryDetailModal'
import InventoryFilters from '../features/inventory/InventoryFilters'
import ExportPromotionsPdfButton from '../features/promotions/ExportPromotionsPdfButton'
import PromotionGroupCard from '../features/promotions/PromotionGroupCard'
import {
  buildPromotionSummaryPdfFileName,
  buildPromotionSummaryPdfHtml,
} from '../features/promotions/promotionsPdfTemplate'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  INVENTORY_FILTER_FIELDS,
  saveInventoryCache,
} from '../services/inventoryService'
import { groupPromotionUnits, hasPromotion } from '../utils/promotionUtils'
import { getUnitAgency, getUnitFieldValue } from '../utils/inventoryUnitUtils'

const SEARCHABLE_KEYS = ['marca', 'modelo', 'vin', 'vinCompleto', 'motor', 'tipoUnidad', 'descripcion', 'placas']
const FILTER_LABELS = INVENTORY_FILTER_FIELDS.reduce((accumulator, field) => {
  accumulator[field.key] = field.label
  return accumulator
}, {})
const DESKTOP_PAGE_SIZE = 12
const MOBILE_PAGE_SIZE = 6
const ALL_AGENCIES_LABEL = 'TODAS LAS AGENCIAS'

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

      const selectedValue = String(filters[definition.key] ?? '').trim()
      if (!selectedValue) continue
      if (String(getUnitFieldValue(unit, definition.key) ?? '').trim() !== selectedValue) return false
    }

    return true
  })
}

function hasFieldValue(unit, definition) {
  if (definition.type === 'numberRange') {
    const numericValue = getNumericFieldValue(unit, definition.key)
    return Number.isFinite(numericValue)
  }

  return String(getUnitFieldValue(unit, definition.key) ?? '').trim().length > 0
}

function detectAvailableFilters(units) {
  const detected = INVENTORY_FILTER_FIELDS.filter(
    (definition) => definition.key !== 'promocion' && units.some((unit) => hasFieldValue(unit, definition))
  )
  if (!detected.some((definition) => definition.key === 'subempresa')) {
    const subempresaDefinition = INVENTORY_FILTER_FIELDS.find((definition) => definition.key === 'subempresa')
    if (subempresaDefinition) detected.push(subempresaDefinition)
  }
  return detected
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

function buildAgencyOptions(units) {
  const byKey = new Map()

  units.forEach((unit) => {
    const agency = String(getUnitAgency(unit) ?? '').trim()
    if (!agency) return

    const normalized = normalizeText(agency)
    if (!byKey.has(normalized)) byKey.set(normalized, agency)
  })

  const dynamicAgencies = [...byKey.values()]
    .map((agency) => agency.toLocaleUpperCase('es-MX'))
    .sort((first, second) => first.localeCompare(second, 'es'))
  return [...dynamicAgencies, ALL_AGENCIES_LABEL]
}

function applyAgencySelection(units, selectedAgency) {
  if (!selectedAgency) return []
  if (selectedAgency === ALL_AGENCIES_LABEL) return units

  const normalizedSelectedAgency = normalizeText(selectedAgency)
  return units.filter((unit) => normalizeText(getUnitAgency(unit)) === normalizedSelectedAgency)
}

function formatLastUpdated(dateString) {
  if (!dateString) return 'Sin registro de actualización'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Sin registro de actualización'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function buildCopyText(unit) {
  return [
    `Marca: ${unit.marca || 'No especificado'}`,
    `Modelo: ${unit.modelo || 'No especificado'}`,
    `Año: ${unit.anio || 'No especificado'}`,
    `Precio: ${unit.precio ?? 'No especificado'}`,
    `Kilómetros: ${unit.kilometros ?? 'No especificado'}`,
    `Motor: ${unit.motor || 'No especificado'}`,
    `Transmisión: ${unit.transmision || 'No especificado'}`,
    `Ubicación: ${unit.ubicacion || 'No especificado'}`,
    `VIN completo: ${unit.vinCompleto || 'No especificado'}`,
    `VIN: ${unit.vin || 'No especificado'}`,
    `Promoción: ${unit.promocion || 'No especificado'}`,
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
      className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lab-border bg-white px-4 py-3 shadow-sm"
      aria-label="Paginación de promociones"
    >
      <p className="text-sm font-medium text-lab-muted">
        Página {currentPage} de {totalPages}
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

function waitForImages(printWindow) {
  const images = Array.from(printWindow.document.images || [])
  const waiting = images.map((image) => {
    if (image.complete) return Promise.resolve()

    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true })
      image.addEventListener('error', resolve, { once: true })
    })
  })

  return Promise.all(waiting)
}

function printHtmlDocument({ html, fileBase, fileName, printPath }) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  try {
    printWindow.history.replaceState({}, '', printPath)
  } catch (error) {
    // Ignore history API failures in restrictive contexts.
  }

  printWindow.document.title = fileBase

  printWindow.addEventListener('load', () => {
    printWindow.document.title = fileBase
    waitForImages(printWindow)
      .catch(() => null)
      .finally(() => {
        const closeAfterPrint = () => {
          setTimeout(() => {
            if (!printWindow.closed) printWindow.close()
          }, 300)
        }

        printWindow.addEventListener('afterprint', closeAfterPrint, { once: true })
        printWindow.focus()
        printWindow.print()
      })
  })

  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.document.title = fileName.replace('.pdf', '')
    }
  }, 150)

  return true
}

function Promociones() {
  const [inventory, setInventory] = useState([])
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedAgency, setSelectedAgency] = useState('')
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const hasPaginatedOnce = useRef(false)

  const promotionUnits = useMemo(() => inventory.filter(hasPromotion), [inventory])
  const agencyOptions = useMemo(() => buildAgencyOptions(promotionUnits), [promotionUnits])
  const agencyScopedPromotionUnits = useMemo(
    () => applyAgencySelection(promotionUnits, selectedAgency),
    [promotionUnits, selectedAgency]
  )
  const availableFilterDefinitions = useMemo(
    () => detectAvailableFilters(agencyScopedPromotionUnits),
    [agencyScopedPromotionUnits]
  )
  const optionsByKey = useMemo(
    () => buildDependentSelectOptions(agencyScopedPromotionUnits, filters, search, availableFilterDefinitions),
    [agencyScopedPromotionUnits, filters, search, availableFilterDefinitions]
  )
  const filteredPromotionUnits = useMemo(
    () =>
      selectedAgency
        ? applyFilters(agencyScopedPromotionUnits, filters, search, availableFilterDefinitions)
        : [],
    [selectedAgency, agencyScopedPromotionUnits, filters, search, availableFilterDefinitions]
  )
  const groupedPromotions = useMemo(() => groupPromotionUnits(filteredPromotionUnits), [filteredPromotionUnits])

  const activeChips = useMemo(() => getActiveChips(search, filters), [search, filters])
  const exportChips = useMemo(() => {
    const allowedKeys = new Set(['search', 'marca', 'anio', 'ubicacion', 'rodada', 'precioMin', 'precioMax'])
    const chips = activeChips.filter((chip) => allowedKeys.has(chip.key))

    if (!selectedAgency) return chips
    return [{ key: 'agencia', label: 'AGENCIA', value: selectedAgency }, ...chips]
  }, [activeChips, selectedAgency])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(groupedPromotions.length / pageSize)),
    [groupedPromotions.length, pageSize]
  )
  const pageGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return groupedPromotions.slice(start, start + pageSize)
  }, [groupedPromotions, currentPage, pageSize])

  useEffect(() => {
    if (!selectedAgency) return
    if (agencyOptions.includes(selectedAgency)) return
    setSelectedAgency('')
  }, [selectedAgency, agencyOptions])

  useEffect(() => {
    if (!import.meta.env.DEV) return

    console.info('[LAB][inventory] Promociones actualizadas en desarrollo')
  }, [inventory.length, promotionUnits.length, agencyOptions])

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

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters, selectedAgency])

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
          text: 'No se pudo actualizar. Mostrando última versión guardada.',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'No fue posible cargar promociones. Verifica la URL CSV pública e intenta de nuevo.',
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
    }

    refreshPromotions(false)
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }

  const handleSelectAgency = (agency) => {
    setSelectedAgency(agency ? agency.toLocaleUpperCase('es-MX') : '')
    setSearch('')
    setFilters({})
    setCurrentPage(1)
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
      setMessage({ type: 'success', text: 'Información copiada al portapapeles.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo copiar la información.' })
    }
  }

  const handleExportGroupSummary = (group) => {
    const now = new Date()
    const fileName = buildPromotionSummaryPdfFileName(group, now)
    const html = buildPromotionSummaryPdfHtml(group, now)
    const fileBase = fileName.replace('.pdf', '')

    printHtmlDocument({
      html,
      fileBase,
      fileName,
      printPath: `/print/promociones/resumen/${encodeURIComponent(group.code || 'codigo')}`,
    })
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
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <img
            src={promotionsHeroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />

          <div className="relative z-10 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Volver a Mi Oficina
                  </Link>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
                    Catálogo comercial
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/70">
                    Catálogo de Promociones
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Promociones listas para activar ventas
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                    Revisa, agrupa y exporta promociones con una vista más limpia, ejecutiva y enfocada en conversiones
                    comerciales.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                    Promociones vigentes
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                    AGRUPACIÓN POR AGENCIA
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                    Exportación PDF
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">Panel rápido</p>
                      <p className="mt-1 text-lg font-semibold text-white">Material comercial listo para exportar</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => refreshPromotions(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                      {loading ? 'Actualizando promociones...' : 'Actualizar promociones'}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/60">Última actualización</p>
                    <p className="mt-1 text-sm font-semibold text-white">{formatLastUpdated(lastUpdated)}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/60">Exportación</p>
                    <div className="mt-2">
                      <ExportPromotionsPdfButton
                        units={filteredPromotionUnits}
                        activeChips={exportChips}
                        disabled={loading || !selectedAgency}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              {selectedAgency ? (
                <button
                  type="button"
                  onClick={() => handleSelectAgency('')}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  CAMBIAR AGENCIA
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>{message.text}</p>
        ) : null}

        {!selectedAgency ? (
          <section className="rounded-2xl border border-lab-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-lab-text">SELECCIONA UNA AGENCIA</h2>
            <p className="mt-1 text-sm text-lab-muted">
              EL CATÁLOGO MOSTRARÁ SOLO PROMOCIONES CON CÓDIGO VÁLIDO AGRUPADAS POR AGENCIA Y CÓDIGO.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {agencyOptions.map((agency) => (
                <button
                  key={agency}
                  type="button"
                  onClick={() => handleSelectAgency(agency)}
                  className="rounded-xl border border-lab-border bg-white px-4 py-3 text-sm font-semibold uppercase text-lab-text transition-all hover:-translate-y-0.5 hover:border-lab-primary/40 hover:text-lab-primary"
                >
                  {agency}
                </button>
              ))}
            </div>
          </section>
        ) : (
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
                setCurrentPage(1)
              }}
              activeChips={activeChips}
              onRemoveChip={handleRemoveChip}
              resultCount={filteredPromotionUnits.length}
            />

            <div className="space-y-4">
              {loading && agencyScopedPromotionUnits.length === 0 ? (
                <PromotionSkeleton />
              ) : agencyScopedPromotionUnits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-lab-border bg-white p-10 text-center shadow-sm">
                  <h3 className="text-xl font-semibold text-lab-text">NO HAY PROMOCIONES PARA ESTA AGENCIA.</h3>
                  <p className="mt-2 text-sm text-lab-muted">
                    PRUEBA CON OTRA AGENCIA O REVISA QUE LAS UNIDADES TENGAN CÓDIGO LLENO.
                  </p>
                </div>
              ) : groupedPromotions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-lab-border bg-white p-10 text-center shadow-sm">
                  <h3 className="text-xl font-semibold text-lab-text">No encontramos promociones con esos filtros.</h3>
                  <p className="mt-2 text-sm text-lab-muted">Prueba limpiando filtros para ver mas opciones.</p>
                </div>
              ) : (
                <section className="grid items-stretch gap-4 sm:grid-cols-1 xl:grid-cols-2">
                  {pageGroups.map((group) => (
                    <PromotionGroupCard
                      key={group.id}
                      group={group}
                      onViewUnit={setSelectedUnit}
                      onExportSummary={handleExportGroupSummary}
                    />
                  ))}
                </section>
              )}

              {groupedPromotions.length > 0 ? (
                <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
              ) : null}
            </div>
          </section>
        )}
      </div>

      <InventoryDetailModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} onCopy={handleCopy} />
    </main>
  )
}

export default Promociones
