import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Table2 } from 'lucide-react'
import { Badge, Card, EmptyState } from '../components/common'
import { useAuth } from '../context/AuthContext'
import InventoryCardGrid from '../features/inventory/InventoryCardGrid'
import InventoryFilters from '../features/inventory/InventoryFilters'
import InventoryHeaderKpis from '../features/inventory/InventoryHeaderKpis'
import InventoryTable from '../features/inventory/InventoryTable'
import UnitDetailModal from '../features/inventory/UnitDetailModal'
import heroTruckImage from '../assets/home/truck-hero.png'
import useToast from '../hooks/useToast'
import { dataService } from '../services/dataService'
import {
  createSimulatedOpportunityFromUnit,
  saveQuoteContext,
} from '../services/inventoryActionsService'

const scopeModeByRole = {
  admin: 'global',
  direccion: 'global',
  bdcLab: 'global',
  gerente: 'branch',
  bdcSucursal: 'branch',
  ejecutivo: 'branchDefault',
}

const getInitialFilters = (user) => {
  const mode = scopeModeByRole[user?.role] ?? 'global'

  return {
    branchId: mode === 'branch' || mode === 'branchDefault' ? user?.branchId ?? '' : '',
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
      const haystack = `${unit.brand} ${unit.model} ${unit.configuration}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

function InventarioNacional() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inventory, setInventory] = useState([])
  const [branches, setBranches] = useState([])
  const [viewMode, setViewMode] = useState('table')
  const [filters, setFilters] = useState(getInitialFilters(user))
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setFilters(getInitialFilters(user))
  }, [user?.id, user?.role, user?.branchId])

  useEffect(() => {
    let isActive = true

    const loadInventory = async () => {
      try {
        setLoading(true)
        setError('')

        const [inventoryResponse, branchesResponse] = await Promise.all([
          dataService.getInventory(),
          dataService.getBranches(),
        ])

        if (!isActive) return

        setInventory(Array.isArray(inventoryResponse) ? inventoryResponse : [])
        setBranches(Array.isArray(branchesResponse) ? branchesResponse : [])
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

    loadInventory()

    return () => {
      isActive = false
    }
  }, [])

  const branchesById = useMemo(
    () => Object.fromEntries(branches.map((branch) => [branch.id, branch])),
    [branches]
  )

  const scopeMode = scopeModeByRole[user?.role] ?? 'global'

  const scopedInventory = useMemo(() => {
    if (!user) return []

    if (scopeMode === 'branch') {
      return inventory.filter((unit) => unit.branchId === user.branchId)
    }

    return inventory
  }, [inventory, scopeMode, user])

  const visibleInventory = useMemo(
    () => applyInventoryFilters(scopedInventory, filters),
    [filters, scopedInventory]
  )

  const filterBranchOptions = useMemo(() => {
    if (scopeMode === 'branch') {
      return branches.filter((branch) => branch.id === user?.branchId)
    }

    return branches
  }, [branches, scopeMode, user?.branchId])

  const brands = useMemo(
    () => [...new Set(scopedInventory.map((unit) => unit.brand))].sort(),
    [scopedInventory]
  )

  const years = useMemo(
    () => [...new Set(scopedInventory.map((unit) => unit.year))].sort((a, b) => b - a),
    [scopedInventory]
  )

  const statuses = useMemo(
    () => [...new Set(scopedInventory.map((unit) => unit.status))].sort(),
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
    const saved = saveQuoteContext(unit, user)
    if (!saved) {
      toast.error('No fue posible preparar la cotización')
      return
    }

    toast.success('Unidad agregada a cotización')
    handleCloseDetail()
    navigate('/herramientas?tab=cotizador')
  }

  const handleCreateOpportunity = (unit) => {
    const created = createSimulatedOpportunityFromUnit(unit, user)
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
      <section className="relative overflow-hidden rounded-3xl border border-white/15 shadow-[0_22px_50px_rgba(15,23,42,0.22)]">
        <img
          src={heroTruckImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="relative z-10 p-6 sm:p-7 lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white backdrop-blur">
            Inventario Nacional
          </div>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3 text-white">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Inventario Nacional
              </h1>
              <p className="text-sm text-slate-100 sm:text-base">
                Vista ejecutiva de disponibilidad nacional, cobertura operativa y unidades listas para análisis comercial.
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">
                  Disponibilidad en tiempo real
                </Badge>
                <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">
                  Cobertura nacional
                </Badge>
                <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">
                  Herramienta comercial estratégica
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-lg backdrop-blur-md lg:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                Cabina comercial
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">
                Filtra, compara y abre detalle de unidades con una lectura visual de alto impacto sobre la operación nacional.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="success" className="border-white/25 bg-white/15 text-white backdrop-blur">
              {user?.name}
            </Badge>
            <Badge variant="info" className="border-white/25 bg-white/15 text-white backdrop-blur">
              {user?.roleLabel}
            </Badge>
            <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
              {user?.branchName}
            </Badge>
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-4">
        <InventoryHeaderKpis units={visibleInventory} branches={branches} />
      </div>

      <InventoryFilters
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
