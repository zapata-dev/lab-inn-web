import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ImportDetailDrawer from '../features/support/inventoryImports/ImportDetailDrawer'
import ImportFilters from '../features/support/inventoryImports/ImportFilters'
import ImportList from '../features/support/inventoryImports/ImportList'
import RunInventoryImportPanel from '../features/support/inventoryImports/RunInventoryImportPanel'
import { subscribeInventoryImports } from '../services/supportInventoryImportsService'

const DEFAULT_FILTERS = { status: '', limitCount: 25 }

function SoporteInventoryImports() {
  const { user, isFirebaseMode, isAuthorized, loading } = useAuth()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [imports, setImports] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImport, setSelectedImport] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const normalizedRole = useMemo(
    () => String(user?.rol || user?.role || '').trim().toLowerCase(),
    [user?.rol, user?.role]
  )
  const isSupport = normalizedRole === 'soporte'

  useEffect(() => {
    if (!isFirebaseMode || !isAuthorized || !isSupport) {
      setImports([])
      setDataLoading(false)
      setError('')
      return () => {}
    }

    setDataLoading(true)
    setError('')

    const unsubscribe = subscribeInventoryImports(filters, ({ items, error: nextError }) => {
      if (nextError) {
        setError(nextError?.message || 'No se pudo cargar el historial de imports.')
        setDataLoading(false)
        return
      }
      setImports(items)
      setDataLoading(false)
    })

    return unsubscribe
  }, [filters, isAuthorized, isFirebaseMode, isSupport])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetFilters = () => setFilters(DEFAULT_FILTERS)

  const handleOpenDetail = (imp) => {
    setSelectedImport(imp)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedImport(null)
  }

  if (loading) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6 py-8">
        <p className="text-sm text-lab-muted">Validando acceso...</p>
      </main>
    )
  }

  if (!isFirebaseMode) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6 py-8">
        <section className="w-full max-w-2xl rounded-2xl border border-lab-border bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-lab-text">Importaciones de inventario</h1>
          <p className="mt-2 text-sm text-lab-muted">
            Esta vista operativa esta disponible solo en modo Firebase.
          </p>
          <Link
            to="/inicio"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </section>
      </main>
    )
  }

  if (!isAuthorized || !isSupport) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-lab-bg to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/inicio"
                  className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Volver
                </Link>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-lab-text">
                Importaciones de inventario
              </h1>
              <p className="text-sm text-lab-muted">
                Historial de corridas, ejecucion manual y detalle operativo. Solo soporte.
              </p>
            </div>
          </div>
        </header>

        <RunInventoryImportPanel />

        <div className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-lab-text">Historial de imports</h2>
          </div>
          <ImportFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        <ImportList
          imports={imports}
          loading={dataLoading}
          error={error}
          onSelectImport={handleOpenDetail}
        />

        <ImportDetailDrawer
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          imp={selectedImport}
        />
      </div>
    </main>
  )
}

export default SoporteInventoryImports
