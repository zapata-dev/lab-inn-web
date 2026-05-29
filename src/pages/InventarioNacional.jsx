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
      toast.error('No fue posible preparar la cotizacion')
      return
    }

    toast.success('Unidad agregada a cotizacion')
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
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Inventario Nacional</h2>
            <p className="text-sm text-lab-muted">
              Base nacional de unidades disponibles para analisis comercial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="success">{user?.name}</Badge>
            <Badge variant="info">{user?.roleLabel}</Badge>
            <Badge>{user?.branchName}</Badge>
          </div>
        </div>
      </Card>

      <InventoryHeaderKpis units={visibleInventory} branches={branches} />

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
