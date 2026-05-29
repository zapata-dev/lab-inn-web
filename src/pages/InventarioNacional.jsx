import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Table2 } from 'lucide-react'
import { Badge, Card, EmptyState } from '../components/common'
import { useAuth } from '../context/AuthContext'
import InventoryCardGrid from '../features/inventory/InventoryCardGrid'
import InventoryFreshnessBanner from '../features/inventory/InventoryFreshnessBanner'
import InventoryHeaderKpis from '../features/inventory/InventoryHeaderKpis'
import InventoryTable from '../features/inventory/InventoryTable'
import UnitDetailModal from '../features/inventory/UnitDetailModal'
import useToast from '../hooks/useToast'
import { dataService } from '../services/dataService'
import {
  createSimulatedOpportunityFromUnit,
  saveQuoteContext,
} from '../services/inventoryActionsService'
import { subscribeLiveInventory } from '../services/liveInventoryService'
import { subscribeLatestInventoryImportMetrics } from '../services/inventoryImportMetricsService'
import InventoryImportSummaryCard from '../features/inventory/InventoryImportSummaryCard'
import InventoryImportHistoryDrawer from '../features/inventory/InventoryImportHistoryDrawer'

const scopeModeByRole = {
  admin: 'global',
  direccion: 'global',
  bdcLab: 'global',
  gerente: 'branch',
  bdcSucursal: 'branch',
  ejecutivo: 'branchDefault',
  vendedor: 'branch',
  coordinador: 'branch',
  soporte: 'global',
}

function normalizeStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()
  if (!normalized) return 'available'

  if (['disponible', 'available', 'enstock'].includes(normalized)) return 'available'
  if (['reservado', 'reserved', 'apartado'].includes(normalized)) return 'reserved'
  if (['mantenimiento', 'maintenance', 'taller'].includes(normalized)) return 'maintenance'
  if (['demo', 'demostracion', 'demostracionactiva'].includes(normalized)) return 'demo'

  return normalized.replace(/\s+/g, '_')
}

function parseNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const cleaned = String(value ?? '').replace(/[^0-9.,-]/g, '')
  if (!cleaned) return 0

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
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeInventoryUnitForView(unit) {
  const source = unit || {}
  const vin = String(source.vin || source.VIN || source.id || '').trim().toUpperCase()
  const brand = String(source.brand || source.marca || '').trim()
  const model = String(source.model || source.modelo || '').trim()
  const year = Number(source.year || source.anio || 0) || null
  const branchId = String(source.branchId || source.sucursalId || source.sucursal || source.centro || '').trim()
  const branchName = String(source.branchName || source.sucursalNombre || source.ubicacion || '').trim()
  const priceUsd = parseNumber(source.priceUsd ?? source.precio)
  const mileageKm = parseNumber(source.mileageKm ?? source.kilometros)
  const status = normalizeStatus(source.status)
  const configuration = String(source.configuration || source.configuracion || '').trim()
  const engine = String(source.engine || source.motor || '').trim()
  const transmission = String(source.transmission || source.transmision || '').trim()

  return {
    ...source,
    id: vin || String(source.id || '').trim(),
    vin: vin || String(source.vin || source.id || '').trim(),
    brand,
    marca: brand,
    model,
    modelo: model,
    year,
    anio: year,
    branchId,
    sucursalId: branchId,
    branchName,
    sucursalNombre: branchName,
    priceUsd,
    precio: priceUsd,
    mileageKm,
    kilometros: mileageKm,
    status,
    configuration,
    configuracion: configuration,
    engine,
    motor: engine,
    transmission,
    transmision: transmission,
    daysInInventory: Number(source.daysInInventory || source.diasEnInventario || 0) || 0,
  }
}

function deriveBranchesFromInventory(units) {
  const byId = new Map()

  units.forEach((unit) => {
    const branchId = String(unit.branchId || '').trim()
    if (!branchId) return

    if (!byId.has(branchId)) {
      byId.set(branchId, {
        id: branchId,
        name: String(unit.branchName || unit.sucursalNombre || branchId).trim() || branchId,
      })
    }
  })

  return [...byId.values()]
}

const getInitialFilters = (user) => {
  const role = String(user?.role || user?.rol || '').trim().toLowerCase()
  const mode = scopeModeByRole[role] ?? 'global'
  const userBranchId = user?.branchId || user?.sucursalId || ''

  return {
    branchId: mode === 'branch' || mode === 'branchDefault' ? userBranchId : '',
    brand: '',
    year: '',
    status: '',
    priceMin: '',
    priceMax: '',
    search: '',
  }
}

const applyInventoryFilters = (units, filters) => {
  const minPrice = filters.priceMin === '' ? null : Number(filters.priceMin)
  const maxPrice = filters.priceMax === '' ? null : Number(filters.priceMax)
  const search = filters.search.trim().toLowerCase()

  return units.filter((unit) => {
    if (filters.branchId && unit.branchId !== filters.branchId) return false
    if (filters.brand && unit.brand !== filters.brand) return false
    if (filters.year && String(unit.year) !== String(filters.year)) return false
    if (filters.status && unit.status !== filters.status) return false

    if (Number.isFinite(minPrice) && Number(unit.priceUsd) < minPrice) return false
    if (Number.isFinite(maxPrice) && Number(unit.priceUsd) > maxPrice) return false

    if (search) {
      const haystack = `${unit.brand} ${unit.model} ${unit.configuration} ${unit.vin}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

function InventoryFiltersPanel({
  filters,
  onChange,
  onReset,
  branches,
  brands,
  years,
  statuses,
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">Filtros de inventario</h3>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:bg-slate-50"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Sucursal
          <select
            value={filters.branchId}
            onChange={(event) => onChange('branchId', event.target.value)}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            <option value="">Todas</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Marca
          <select
            value={filters.brand}
            onChange={(event) => onChange('brand', event.target.value)}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            <option value="">Todas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Anio
          <select
            value={filters.year}
            onChange={(event) => onChange('year', event.target.value)}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          >
            <option value="">Todos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Precio minimo
          <input
            type="number"
            min="0"
            value={filters.priceMin}
            onChange={(event) => onChange('priceMin', event.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          />
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted">
          Precio maximo
          <input
            type="number"
            min="0"
            value={filters.priceMax}
            onChange={(event) => onChange('priceMax', event.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          />
        </label>

        <label className="space-y-1 text-xs font-semibold text-lab-muted lg:col-span-2">
          Busqueda
          <input
            type="text"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Marca, modelo, configuracion o VIN"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text"
          />
        </label>
      </div>
    </Card>
  )
}

function toUserActionContext(user) {
  return {
    ...user,
    id: user?.id || user?.uid || '',
    uid: user?.uid || user?.id || '',
    name: user?.name || user?.nombre || user?.email || 'Usuario LAB',
    nombre: user?.nombre || user?.name || user?.email || 'Usuario LAB',
    branchId: user?.branchId || user?.sucursalId || '',
    branchName: user?.branchName || user?.sucursalNombre || '',
  }
}

function InventarioNacional() {
  const { user, isFirebaseMode } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const staleHours = Number(import.meta.env.VITE_INVENTORY_STALE_HOURS || 24) || 24

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inventory, setInventory] = useState([])
  const [branches, setBranches] = useState([])
  const [viewMode, setViewMode] = useState('table')
  const [filters, setFilters] = useState(getInitialFilters(user))
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [lastImportedAt, setLastImportedAt] = useState(null)
  const [freshnessError, setFreshnessError] = useState('')
  const [importMetrics, setImportMetrics] = useState(null)
  const [importMetricsLoading, setImportMetricsLoading] = useState(false)
  const [recentImports, setRecentImports] = useState([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    setFilters(getInitialFilters(user))
  }, [user?.id, user?.uid, user?.role, user?.rol, user?.branchId, user?.sucursalId])

  useEffect(() => {
    let isActive = true

    if (isFirebaseMode) {
      setLoading(true)
      setError('')
      setFreshnessError('')
      setImportMetricsLoading(true)

      const unsubscribe = subscribeLiveInventory(
        ({ items, error: streamError, lastImportedAt: nextLastImported }) => {
          if (!isActive) return

          if (streamError) {
            setInventory([])
            setBranches([])
            setError(streamError?.message || 'No fue posible cargar inventario Firestore.')
            setFreshnessError(streamError?.message || 'No fue posible validar frescura del inventario.')
            setLoading(false)
            return
          }

          const normalized = (Array.isArray(items) ? items : []).map(normalizeInventoryUnitForView)
          setInventory(normalized)
          setBranches(deriveBranchesFromInventory(normalized))
          setLastImportedAt(nextLastImported || null)
          setLoading(false)
        },
        { limitCount: 500 }
      )

      let unsubImports = () => {}
      try {
        unsubImports = subscribeLatestInventoryImportMetrics(({ metrics, imports, error: importError }) => {
          if (!isActive) return
          if (!importError) {
            setImportMetrics(metrics)
            setRecentImports(imports)
          }
          setImportMetricsLoading(false)
        })
      } catch (_) {
        setImportMetricsLoading(false)
      }

      return () => {
        isActive = false
        unsubscribe()
        unsubImports()
      }
    }

    const loadDemoInventory = async () => {
      try {
        setLoading(true)
        setError('')
        setFreshnessError('')

        const [inventoryResponse, branchesResponse] = await Promise.all([
          dataService.getInventory(),
          dataService.getBranches(),
        ])

        if (!isActive) return

        const normalized = (Array.isArray(inventoryResponse) ? inventoryResponse : []).map(normalizeInventoryUnitForView)

        setInventory(normalized)
        setBranches(Array.isArray(branchesResponse) ? branchesResponse : [])
        setLastImportedAt(null)
      } catch (loadError) {
        if (isActive) {
          setError(loadError?.message ?? 'No fue posible cargar el inventario.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadDemoInventory()

    return () => {
      isActive = false
    }
  }, [isFirebaseMode])

  const branchesById = useMemo(
    () => Object.fromEntries(branches.map((branch) => [branch.id, branch])),
    [branches]
  )

  const userRole = String(user?.role || user?.rol || '').trim().toLowerCase()
  const scopeMode = scopeModeByRole[userRole] ?? 'global'
  const userBranchId = user?.branchId || user?.sucursalId || ''

  const scopedInventory = useMemo(() => {
    if (!user) return []

    if (scopeMode === 'branch') {
      return inventory.filter((unit) => unit.branchId === userBranchId)
    }

    return inventory
  }, [inventory, scopeMode, user, userBranchId])

  const visibleInventory = useMemo(
    () => applyInventoryFilters(scopedInventory, filters),
    [filters, scopedInventory]
  )

  const filterBranchOptions = useMemo(() => {
    if (scopeMode === 'branch') {
      return branches.filter((branch) => branch.id === userBranchId)
    }

    return branches
  }, [branches, scopeMode, userBranchId])

  const brands = useMemo(
    () => [...new Set(scopedInventory.map((unit) => unit.brand).filter(Boolean))].sort(),
    [scopedInventory]
  )

  const years = useMemo(
    () => [...new Set(scopedInventory.map((unit) => unit.year).filter(Boolean))].sort((a, b) => b - a),
    [scopedInventory]
  )

  const statuses = useMemo(
    () => [...new Set(scopedInventory.map((unit) => unit.status).filter(Boolean))].sort(),
    [scopedInventory]
  )

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const handleResetFilters = () => {
    setFilters(getInitialFilters(user))
  }

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedUnit(null)
  }

  const handleAddToQuote = (unit) => {
    const saved = saveQuoteContext(unit, toUserActionContext(user))
    if (!saved) {
      toast.error('No fue posible preparar la cotizacion')
      return
    }

    toast.success('Unidad agregada a cotizacion')
    handleCloseDetail()
    navigate('/herramientas?tab=cotizador')
  }

  const handleCreateOpportunity = (unit) => {
    const created = createSimulatedOpportunityFromUnit(unit, toUserActionContext(user))
    if (!created) {
      toast.error('No fue posible crear la oportunidad simulada')
      return
    }

    toast.simulated('Oportunidad Salesforce simulada creada')
  }

  const handleShareTechnicalSheet = () => {
    toast.simulated('Ficha tecnica enviada por WhatsApp (simulado)')
  }

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Inventario Nacional</h2>
          <p className="text-sm text-lab-muted">Cargando unidades disponibles...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <EmptyState title="No pudimos cargar el inventario" description={error} />
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Inventario Nacional</h2>
            <p className="text-sm text-lab-muted">
              Base nacional de unidades disponibles para analisis comercial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="success">{user?.name || user?.nombre || 'Usuario'}</Badge>
            <Badge variant="info">{user?.roleLabel || user?.rol || user?.role}</Badge>
            <Badge>{user?.branchName || user?.sucursalNombre || 'Sin sucursal'}</Badge>
          </div>
        </div>
      </Card>

      <InventoryFreshnessBanner
        lastImportedAt={importMetrics?.lastImportedAt ?? lastImportedAt}
        staleHours={staleHours}
        loading={false}
        error={freshnessError}
        missingUnitsCount={importMetrics?.missingUnitsCount}
        lastFailedImportAt={importMetrics?.lastFailedImportAt}
      />

      {isFirebaseMode && (
        <InventoryImportSummaryCard
          metrics={importMetrics}
          loading={importMetricsLoading}
          error={null}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      <InventoryHeaderKpis units={visibleInventory} branches={branches} />

      <InventoryFiltersPanel
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        branches={filterBranchOptions}
        brands={brands}
        years={years}
        statuses={statuses}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-lab-muted">
            Vista actual: {viewMode === 'table' ? 'Tabla' : 'Tarjetas'} | Resultados: {visibleInventory.length}
          </p>
          <div className="inline-flex rounded-lg border border-lab-border bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                viewMode === 'table' ? 'bg-lab-primary text-white' : 'text-lab-muted hover:text-lab-text'
              }`}
            >
              <Table2 className="size-4" aria-hidden="true" />
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                viewMode === 'cards' ? 'bg-lab-primary text-white' : 'text-lab-muted hover:text-lab-text'
              }`}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              Tarjetas
            </button>
          </div>
        </div>
      </Card>

      {viewMode === 'table' ? (
        <InventoryTable
          units={visibleInventory}
          branchesById={branchesById}
          pageSize={20}
          onSelectUnit={handleSelectUnit}
        />
      ) : (
        <InventoryCardGrid
          units={visibleInventory}
          branchesById={branchesById}
          onSelectUnit={handleSelectUnit}
        />
      )}

      <InventoryImportHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        imports={recentImports}
        loading={importMetricsLoading}
        error={null}
      />

      <UnitDetailModal
        unit={selectedUnit}
        branch={selectedUnit ? branchesById[selectedUnit.branchId] : null}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onAddToQuote={handleAddToQuote}
        onCreateOpportunity={handleCreateOpportunity}
        onShare={handleShareTechnicalSheet}
      />
    </section>
  )
}

export default InventarioNacional
