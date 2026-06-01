import { ArrowLeft, Download, ExternalLink, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  saveInventoryCache,
} from '../services/inventoryService'

const BRANCH_FILTERS = [
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

function formatLastUpdated(dateString) {
  if (!dateString) return 'Sin registro de actualizacion'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Sin registro de actualizacion'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getCoverFromPortadaColumn(unit) {
  const rawPortadaValue = String(unit?.raw?.imagenPortadaRaw ?? unit?.imagenPortadaRaw ?? '').trim()
  if (!rawPortadaValue) return ''
  const match = rawPortadaValue.match(/https?:\/\/[^\s,"]+/i)
  return match ? match[0] : ''
}

function getUnitYear(unit) {
  const value = String(unit?.anio || unit?.year || unit?.Ano || unit?.Año || '').trim()
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

function getRawBranchValue(unit) {
  const candidates = [
    unit?.Centro,
    unit?.centro,
    unit?.Sucursal,
    unit?.sucursalNombre,
    unit?.['Ubicación Física'],
    unit?.ubicacionFisica,
    unit?.ubicacion,
  ]
  return String(candidates.find((value) => String(value ?? '').trim()) ?? '').trim()
}

function mapBranchFilter(rawBranch) {
  const normalized = normalizeText(rawBranch)
  if (!normalized || normalized.includes('sin asignar')) return { id: 'none', label: 'Sin asignar' }
  if (normalized.includes('queretaro') || normalized.includes('qro')) {
    return { id: 'qro', label: 'Queretaro' }
  }
  if (normalized.includes('leon')) return { id: 'leon', label: 'Leon' }
  if (normalized.includes('guadalajara')) return { id: 'gdl', label: 'Guadalajara' }
  if (normalized.includes('monterrey') || normalized.includes('mty')) {
    return { id: 'mty', label: 'Monterrey' }
  }
  if (
    normalized.includes('ciudad de mexico') ||
    normalized.includes('cdmx') ||
    normalized.includes('mexico') ||
    normalized.includes('tlanepantla') ||
    normalized.includes('aeropuerto')
  ) {
    return { id: 'cdmx', label: 'Ciudad de Mexico' }
  }
  return { id: 'none', label: 'Sin asignar' }
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
  const [message, setMessage] = useState({ type: '', text: '' })

  const normalizedCoverUnits = useMemo(
    () =>
      units
        .map((unit, index) => {
          const coverImage = getCoverFromPortadaColumn(unit)
          if (!coverImage) return null

          const branch = mapBranchFilter(getRawBranchValue(unit))
          return {
            id: unit.id || `${getUnitVin(unit)}-${index}`,
            coverImage,
            year: getUnitYear(unit),
            model: getUnitModel(unit),
            vin: getUnitVin(unit),
            branchId: branch.id,
            branchLabel: branch.label,
          }
        })
        .filter(Boolean),
    [units]
  )

  const branchCounts = useMemo(() => {
    const counters = {
      all: normalizedCoverUnits.length,
      qro: 0,
      leon: 0,
      gdl: 0,
      cdmx: 0,
      mty: 0,
      none: 0,
    }

    normalizedCoverUnits.forEach((unit) => {
      counters[unit.branchId] = (counters[unit.branchId] ?? 0) + 1
    })
    return counters
  }, [normalizedCoverUnits])

  const filteredUnits = useMemo(() => {
    if (activeBranch === 'all') return normalizedCoverUnits
    return normalizedCoverUnits.filter((unit) => unit.branchId === activeBranch)
  }, [activeBranch, normalizedCoverUnits])

  const refreshCatalog = async (showSuccessMessage = false) => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const items = await fetchInventoryFromCsv()
      saveInventoryCache(items)
      const cache = getInventoryCache()
      setUnits(items)
      setLastUpdated(cache.lastUpdated)
      if (showSuccessMessage) {
        setMessage({ type: 'success', text: 'Catalogo de publicidad actualizado correctamente.' })
      }
    } catch (error) {
      const cache = getInventoryCache()
      if (cache.items.length > 0) {
        setUnits(cache.items)
        setLastUpdated(cache.lastUpdated)
        setMessage({
          type: 'warning',
          text: 'No se pudo actualizar. Mostrando ultima version guardada.',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'No fue posible cargar el catalogo de publicidad. Verifica el CSV e intenta de nuevo.',
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

    try {
      await tryDownloadCoverImage(unit.coverImage, fileName)
      setMessage({ type: 'success', text: `Imagen exportada: ${fileName}` })
    } catch (error) {
      window.open(unit.coverImage, '_blank', 'noopener,noreferrer')
      setMessage({
        type: 'warning',
        text: 'No fue posible descargar por CORS. Se abrio la imagen en una nueva pestana.',
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
              <h1 className="text-3xl font-bold text-lab-text">Catalogo de Publicidad</h1>
              <p className="text-sm text-lab-muted">
                Consulta y exporta material publicitario por sucursal.
              </p>
              <p className="text-sm text-lab-muted">
                Ultima actualizacion: {formatLastUpdated(lastUpdated)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshCatalog(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-lab-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? 'Actualizando...' : 'Actualizar catalogo'}
            </button>
          </div>
        </header>

        {message.text ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${messageClass}`}>{message.text}</p>
        ) : null}

        <section className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {BRANCH_FILTERS.map((branch) => {
              const isActive = activeBranch === branch.id
              const count = branchCounts[branch.id] ?? 0
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setActiveBranch(branch.id)}
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

        {filteredUnits.length === 0 ? (
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
            {filteredUnits.map((unit) => (
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
                      <span className="font-semibold text-lab-text">Ano:</span> {unit.year}
                    </p>
                    <p>
                      <span className="font-semibold text-lab-text">Modelo:</span> {unit.model}
                    </p>
                    <p>
                      <span className="font-semibold text-lab-text">Sucursal:</span> {unit.branchLabel}
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
      </div>
    </main>
  )
}

export default CatalogoPortadas
