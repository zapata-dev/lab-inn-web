import { ArrowLeft, Download, ExternalLink, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import catalogHeroImage from '../assets/catalogo-publicidad-hero.png'
import { Badge } from '../components/common'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  saveInventoryCache,
} from '../services/inventoryService'
import { formatLastUpdated, getCacheFreshness } from '../utils/inventoryFreshness'
import { getCodigo, getUnitAgency } from '../utils/inventoryUnitUtils'

const PAGE_SIZE = 24

const BASE_BRANCH_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'qro', label: 'Queretaro' },
  { id: 'leon', label: 'Leon' },
  { id: 'gdl', label: 'Guadalajara' },
  { id: 'cdmx', label: 'Ciudad de Mexico' },
  { id: 'mty', label: 'Monterrey' },
  { id: 'none', label: 'Sin asignar' },
]

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeUrl(value) {
  return String(value || '').trim()
}

function normalizeCoverUrlForKey(value) {
  const rawUrl = normalizeUrl(value)
  if (!rawUrl) return ''

  try {
    const parsed = new URL(rawUrl)
    parsed.search = ''
    parsed.hash = ''
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    return `${parsed.origin.toLowerCase()}${pathname}`
  } catch {
    return rawUrl.split('#')[0].split('?')[0].trim().toLowerCase()
  }
}

function toSafeIdToken(value, fallback = 'otro') {
  const token = normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return token || fallback
}

function getCoverFromPortadaColumn(unit) {
  const rawPortadaValue = normalizeUrl(unit?.raw?.imagenPortadaRaw ?? unit?.imagenPortadaRaw ?? '')
  if (!rawPortadaValue) return ''
  const match = rawPortadaValue.match(/https?:\/\/[^\s,"]+/i)
  return match ? normalizeUrl(match[0]) : ''
}

function getUnitYear(unit) {
  const value = String(unit?.anio || unit?.year || unit?.Ano || unit?.raw?.['A\u00f1o'] || '').trim()
  return value || 'N/D'
}

function getUnitModel(unit) {
  const value = String(unit?.modelo || unit?.model || unit?.Modelo || '').trim()
  return value || 'Modelo no disponible'
}

function getUnitVin(unit) {
  const value = String(unit?.vin || unit?.vinCompleto || unit?.VIN || unit?.['VIN COMPLETO'] || '').trim()
  return value || String(unit?.id || 'UNIDAD')
}

function getPromotionValue(unit) {
  const candidates = [
    unit?.promocion,
    unit?.Promocion,
    unit?.Promoción,
    unit?.promotion,
    unit?.raw?.Promoción,
    unit?.raw?.Promocion,
    unit?.raw?.promocion,
    unit?.raw?.promotion,
  ]

  const firstCandidate = candidates.find((value) => String(value ?? '').trim().length > 0)
  return String(firstCandidate ?? '').trim()
}

function isPromotionalUnit(unit) {
  const normalized = normalizeText(getPromotionValue(unit))
  return normalized === 'si' || normalized === 'sí' || normalized === 's'
}

function resolveBranchFromUnit(unit) {
  const branchLabel = String(getUnitAgency(unit) || '').trim()
  if (!branchLabel) {
    return { id: 'none', label: 'Sin asignar' }
  }

  const normalized = normalizeText(branchLabel)

  if (normalized.includes('queretaro') || normalized.includes('qro')) {
    return { id: 'qro', label: 'Queretaro' }
  }
  if (normalized.includes('leon')) {
    return { id: 'leon', label: 'Leon' }
  }
  if (normalized.includes('guadalajara') || normalized === 'gdl' || normalized.includes('otero')) {
    return { id: 'gdl', label: 'Guadalajara' }
  }
  if (normalized.includes('monterrey') || normalized === 'mty') {
    return { id: 'mty', label: 'Monterrey' }
  }
  if (
    normalized.includes('ciudad de mexico') ||
    normalized.includes('cdmx') ||
    normalized.includes('mexico') ||
    normalized.includes('tlalnepantla') ||
    normalized.includes('aeropuerto')
  ) {
    return { id: 'cdmx', label: 'Ciudad de Mexico' }
  }

  return {
    id: `custom-${toSafeIdToken(branchLabel)}`,
    label: branchLabel,
  }
}

function buildDedupeKey(coverImage) {
  const normalizedCoverUrl = normalizeCoverUrlForKey(coverImage)
  if (normalizedCoverUrl) return `cover:${normalizedCoverUrl}`
  return 'cover:sin-url'
}

function toSafeFileToken(value, fallback) {
  const sanitized = String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return sanitized || fallback
}

function isSameOriginResource(url) {
  try {
    const parsedUrl = new URL(url, window.location.href)
    return parsedUrl.origin === window.location.origin
  } catch {
    return false
  }
}

async function tryDownloadCoverImage(url, fileName) {
  const response = await fetch(url, { mode: 'cors' })
  if (!response.ok) throw new Error(`HTTP_${response.status}`)

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = fileName
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000)
}

function CatalogoPortadas() {
  const [units, setUnits] = useState([])
  const [activeBranch, setActiveBranch] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [message, setMessage] = useState({ type: '', text: '' })

  const promotionalUnits = useMemo(() => units.filter(isPromotionalUnit), [units])

  const promotionalUnitsWithCover = useMemo(
    () => promotionalUnits.filter((unit) => Boolean(getCoverFromPortadaColumn(unit))),
    [promotionalUnits]
  )

  const normalizedCoverUnits = useMemo(
    () =>
      promotionalUnitsWithCover
        .map((unit, index) => {
          const coverImage = getCoverFromPortadaColumn(unit)
          if (!coverImage) return null

          const branch = resolveBranchFromUnit(unit)
          return {
            id: unit.id || `${getUnitVin(unit)}-${index}`,
            dedupeKey: buildDedupeKey(coverImage),
            coverImage,
            year: getUnitYear(unit),
            model: getUnitModel(unit),
            vin: getUnitVin(unit),
            promotionCode: String(getCodigo(unit) || '').trim(),
            branchId: branch.id,
            branchLabel: branch.label,
            centerRaw: String(unit?.centro || unit?.raw?.centro || '').trim(),
            locationRaw: String(unit?.ubicacion || unit?.ubicacionFisica || unit?.raw?.ubicacionFisica || '').trim(),
          }
        })
        .filter(Boolean),
    [promotionalUnitsWithCover]
  )

  const dedupeSummary = useMemo(() => {
    const byImageKey = new Map()
    const duplicateSamples = []

    normalizedCoverUnits.forEach((unit) => {
      const existingUnit = byImageKey.get(unit.dedupeKey)
      if (existingUnit) {
        if (unit.promotionCode) {
          existingUnit.codeSet.add(unit.promotionCode)
        }
        if (duplicateSamples.length < 10) {
          duplicateSamples.push({
            key: unit.dedupeKey,
            code: unit.promotionCode || 'SIN_CODIGO',
            coverImage: unit.coverImage,
          })
        }
        return
      }

      byImageKey.set(unit.dedupeKey, {
        ...unit,
        codeSet: new Set(unit.promotionCode ? [unit.promotionCode] : []),
      })
    })

    const uniqueUnits = [...byImageKey.values()].map((unit) => ({
      ...unit,
      associatedCodes: [...unit.codeSet].sort((left, right) => left.localeCompare(right, 'es')),
      associatedCodeCount: unit.codeSet.size,
    }))

    return {
      uniqueUnits,
      duplicateSamples,
      duplicateCount: Math.max(0, normalizedCoverUnits.length - uniqueUnits.length),
    }
  }, [normalizedCoverUnits])

  const uniqueCoverUnits = dedupeSummary.uniqueUnits

  const branchFilters = useMemo(() => {
    const customBranchesById = new Map()

    uniqueCoverUnits.forEach((unit) => {
      if (!unit.branchId.startsWith('custom-')) return
      if (!customBranchesById.has(unit.branchId)) {
        customBranchesById.set(unit.branchId, { id: unit.branchId, label: unit.branchLabel })
      }
    })

    const customBranches = [...customBranchesById.values()].sort((left, right) =>
      left.label.localeCompare(right.label, 'es')
    )

    const baseWithoutNone = BASE_BRANCH_FILTERS.filter((branch) => branch.id !== 'none')
    const noneBranch = BASE_BRANCH_FILTERS.find((branch) => branch.id === 'none')
    return [...baseWithoutNone, ...customBranches, noneBranch].filter(Boolean)
  }, [uniqueCoverUnits])

  const branchCounts = useMemo(() => {
    const counters = {}
    branchFilters.forEach((branch) => {
      counters[branch.id] = 0
    })
    counters.all = uniqueCoverUnits.length

    uniqueCoverUnits.forEach((unit) => {
      counters[unit.branchId] = (counters[unit.branchId] ?? 0) + 1
    })

    return counters
  }, [branchFilters, uniqueCoverUnits])

  const filteredUnits = useMemo(() => {
    if (activeBranch === 'all') return uniqueCoverUnits
    return uniqueCoverUnits.filter((unit) => unit.branchId === activeBranch)
  }, [activeBranch, uniqueCoverUnits])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredUnits.length / PAGE_SIZE)),
    [filteredUnits.length]
  )

  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredUnits.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, filteredUnits])

  const diagnostics = useMemo(() => {
    return {
      totalUniqueImages: uniqueCoverUnits.length,
      lastUpdated,
    }
  }, [uniqueCoverUnits.length, lastUpdated])

  const freshness = useMemo(() => getCacheFreshness(lastUpdated), [lastUpdated])

  const rangeStart = filteredUnits.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = filteredUnits.length === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, filteredUnits.length)

  useEffect(() => {
    const branchExists = branchFilters.some((branch) => branch.id === activeBranch)
    if (!branchExists) {
      setActiveBranch('all')
    }
  }, [activeBranch, branchFilters])

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages))
  }, [totalPages])

  const refreshCatalog = async (showSuccessMessage = false) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const items = await fetchInventoryFromCsv()
      saveInventoryCache(items)
      const cache = getInventoryCache()
      setUnits(items)
      setLastUpdated(cache.lastUpdated)
      setCurrentPage(1)
      if (showSuccessMessage) {
        setMessage({ type: 'success', text: 'Catálogo de Publicidad actualizado correctamente.' })
      }
    } catch (error) {
      const cache = getInventoryCache()
      if (cache.items.length > 0) {
        setUnits(cache.items)
        setLastUpdated(cache.lastUpdated)
        setCurrentPage(1)
        setMessage({
          type: 'warning',
          text: 'No se pudo actualizar. Mostrando última versión guardada.',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'No se pudo cargar el Catálogo de Publicidad en este equipo. Intenta de nuevo en unos minutos; si el problema continúa, repórtalo a soporte técnico.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cache = getInventoryCache()
    if (cache.items.length > 0) {
      setUnits(cache.items)
      setLastUpdated(cache.lastUpdated)
    }
    refreshCatalog(false)
  }, [])

  const handleExportCover = async (unit) => {
    const yearToken = toSafeFileToken(unit.year, 'ANIO')
    const modelToken = toSafeFileToken(unit.model, 'MODELO')
    const branchToken = toSafeFileToken(unit.branchLabel, 'SUCURSAL')
    const vinToken = toSafeFileToken(unit.vin, 'VIN')
    const fileName = `PORTADA_${yearToken}_${modelToken}_${branchToken}_${vinToken}.jpg`

    if (!isSameOriginResource(unit.coverImage)) {
      window.open(unit.coverImage, '_blank', 'noopener,noreferrer')
      setMessage({
        type: 'warning',
        text: 'No fue posible descargar automáticamente por permisos del servidor. Se abrió la imagen en una nueva pestaña.',
      })
      return
    }

    try {
      await tryDownloadCoverImage(unit.coverImage, fileName)
      setMessage({ type: 'success', text: `Imagen exportada: ${fileName}` })
    } catch (error) {
      window.open(unit.coverImage, '_blank', 'noopener,noreferrer')
      setMessage({
        type: 'warning',
        text: 'No fue posible descargar automáticamente por permisos del servidor. Se abrió la imagen en una nueva pestaña.',
      })
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
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <img
            src={catalogHeroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/35" />

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
                    Catálogo de Publicidad
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Portadas comerciales listas para compartir
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                    Consulta, filtra y descarga material publicitario de unidades en promoción por sucursal con una
                    vista más clara, ejecutiva y de alto contraste.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                    Portadas activas
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                    Cobertura por sucursal
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-md">
                    Descarga rápida
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">Panel rápido</p>
                      <p className="mt-1 text-lg font-semibold text-white">Material listo para uso comercial</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => refreshCatalog(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                      {loading ? 'Actualizando...' : 'Actualizar catálogo'}
                    </button>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <dt className="text-white/60">Portadas únicas</dt>
                      <dd className="mt-1 text-lg font-semibold text-white">{diagnostics.totalUniqueImages}</dd>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <dt className="text-white/60">Última actualización</dt>
                      <dd className="mt-1 text-sm font-semibold text-white">{formatLastUpdated(lastUpdated)}</dd>
                      {freshness.isStale ? (
                        <Badge variant="danger" className="mt-2">
                          Datos de hace {freshness.ageInDays} {freshness.ageInDays === 1 ? 'día' : 'días'}
                        </Badge>
                      ) : null}
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>{message.text}</p>
        ) : null}

        <section className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {branchFilters.map((branch) => {
              const isActive = activeBranch === branch.id
              const count = branchCounts[branch.id] ?? 0
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => {
                    setActiveBranch(branch.id)
                    setCurrentPage(1)
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-lab-primary bg-lab-primary text-white'
                      : 'border-lab-border bg-white text-lab-text hover:border-lab-primary/40 hover:text-lab-primary'
                  }`}
                >
                  {branch.label} ({count})
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-lab-border bg-white px-4 py-3 text-sm text-lab-muted shadow-sm">
          Mostrando {rangeStart}-{rangeEnd} de {filteredUnits.length} publicidades
        </section>

        {paginatedUnits.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-lab-border bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-lab-text">
              No hay material publicitario para esta sucursal.
            </h2>
            <p className="mt-2 text-sm text-lab-muted">
              Prueba con otro filtro o actualiza el inventario para refrescar datos.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedUnits.map((unit) => (
              <article
                key={unit.id}
                className="overflow-hidden rounded-2xl border border-lab-border bg-white shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={unit.coverImage}
                    alt={`Portada ${unit.year} ${unit.model}`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="space-y-1 text-sm text-lab-muted">
                    <p>
                      <span className="font-semibold text-lab-text">Año:</span> {unit.year}
                    </p>
                    <p>
                      <span className="font-semibold text-lab-text">Modelo:</span> {unit.model}
                    </p>
                    <p>
                      <span className="font-semibold text-lab-text">Sucursal:</span> {unit.branchLabel}
                    </p>
                    <p>
                      <span className="font-semibold text-lab-text">Código:</span> {unit.promotionCode || 'Sin código'}
                    </p>
                    <p>
                      <span className="font-semibold text-lab-text">Códigos asociados:</span>{' '}
                      {unit.associatedCodeCount || 0}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportCover(unit)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-lab-primary px-3 py-2 text-sm font-semibold text-white hover:bg-lab-primary/90"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Descargar publicidad
                    </button>
                    <a
                      href={unit.coverImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-lab-border px-3 py-2 text-lab-text hover:bg-slate-50"
                      title="Abrir imagen"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {totalPages > 1 ? (
          <section className="flex items-center justify-between rounded-2xl border border-lab-border bg-white px-4 py-3 text-sm shadow-sm">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-lab-border px-3 py-1.5 font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <p className="font-medium text-lab-muted">
              Página {currentPage} de {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-lab-border px-3 py-1.5 font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default CatalogoPortadas

