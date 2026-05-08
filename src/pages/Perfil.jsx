import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Card, EmptyState } from '../components/common'
import { useAuth } from '../context/AuthContext'
import AdminDataSummary from '../features/admin/AdminDataSummary'
import AdminStoragePanel from '../features/admin/AdminStoragePanel'
import AdminUsersTable from '../features/admin/AdminUsersTable'
import useToast from '../hooks/useToast'
import { clearDemoStorage, getStorageSnapshot } from '../services/adminService'
import { dataService } from '../services/dataService'

function Perfil() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'

  const [resetting, setResetting] = useState(false)

  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminData, setAdminData] = useState(null)
  const [storageSnapshot, setStorageSnapshot] = useState(() => getStorageSnapshot())

  useEffect(() => {
    if (!isAdmin) return
    let isActive = true

    const load = async () => {
      try {
        setAdminLoading(true)
        const [users, branches, inventory, leads, opps, orders, invoices, training, support] =
          await Promise.all([
            dataService.getUsers(),
            dataService.getBranches(),
            dataService.getInventory(),
            dataService.getLeads(),
            dataService.getOpportunities(),
            dataService.getOrders(),
            dataService.getInvoices(),
            dataService.getTraining(),
            dataService.getSupport(),
          ])
        if (!isActive) return
        setAdminData({ users, branches, inventory, leads, opps, orders, invoices, training, support })
      } catch (err) {
        if (isActive) setAdminError(err?.message ?? 'Error al cargar datos de admin.')
      } finally {
        if (isActive) setAdminLoading(false)
      }
    }

    load()
    return () => { isActive = false }
  }, [isAdmin])

  const branchesById = useMemo(
    () => Object.fromEntries((adminData?.branches ?? []).map((b) => [b.id, b])),
    [adminData]
  )

  const counts = useMemo(() => {
    if (!adminData) return {}
    return {
      usuarios: adminData.users.length,
      sucursales: adminData.branches.length,
      inventario: adminData.inventory.length,
      leads: adminData.leads.length,
      oportunidades: adminData.opps.length,
      pedidos: adminData.orders.length,
      facturas: adminData.invoices.length,
      videos: adminData.training?.videos?.length ?? 0,
      tickets: adminData.support?.tickets?.length ?? 0,
      faqs: adminData.support?.faqs?.length ?? 0,
    }
  }, [adminData])

  const handleLogout = () => {
    toast.info('Sesion cerrada')
    logout()
    navigate('/login', { replace: true })
  }

  const handleResetDemo = () => {
    if (!resetting) {
      setResetting(true)
      return
    }
    clearDemoStorage({ keepAuth: false })
    toast.warning('Demo reseteada')
    logout()
    navigate('/login', { replace: true })
  }

  const handleAdminClearStorage = () => {
    const newSnapshot = clearDemoStorage({ keepAuth: true })
    setStorageSnapshot(newSnapshot)
    toast.success('Datos demo limpiados. Sesion activa.')
  }

  const handleRefreshSnapshot = () => {
    setStorageSnapshot(getStorageSnapshot())
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Perfil</h2>
            <p className="text-sm text-lab-muted">Gestion de sesion y configuracion demo.</p>
          </div>
          {isAdmin && <Badge variant="info">Admin LAB</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">{user?.name}</Badge>
          <Badge variant="info">{user?.roleLabel}</Badge>
          <Badge>{user?.email}</Badge>
          {user?.branchName && <Badge>{user?.branchName}</Badge>}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-lab-text">Sesion</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Cerrar sesion
          </button>
          {!isAdmin && (
            <>
              <button
                type="button"
                onClick={handleResetDemo}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  resetting
                    ? 'border-rose-400 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-lab-border bg-white text-lab-text hover:bg-slate-50'
                }`}
              >
                {resetting ? 'Confirmar reset completo' : 'Resetear demo'}
              </button>
              {resetting && (
                <button
                  type="button"
                  onClick={() => setResetting(false)}
                  className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </>
          )}
        </div>
        {resetting && !isAdmin && (
          <p className="text-xs text-rose-600">Esto cerrara la sesion y limpiara todos los datos demo.</p>
        )}
      </Card>

      {isAdmin && (
        <>
          <Card className="space-y-1">
            <h3 className="text-lg font-semibold text-lab-text">Panel Admin LAB</h3>
            <p className="text-sm text-lab-muted">
              Sala de control del MVP: usuarios demo, resumen de datos y estado del storage local.
            </p>
          </Card>

          {adminLoading && (
            <Card>
              <p className="text-sm text-lab-muted">Cargando datos de admin...</p>
            </Card>
          )}

          {adminError && !adminLoading && (
            <EmptyState title="Error al cargar admin" description={adminError} />
          )}

          {!adminLoading && !adminError && adminData && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                  Resumen de datos
                </h4>
                <AdminDataSummary counts={counts} />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                  Usuarios demo
                </h4>
                <AdminUsersTable users={adminData.users} branchesById={branchesById} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Storage local
            </h4>
            <AdminStoragePanel
              snapshot={storageSnapshot}
              onRefresh={handleRefreshSnapshot}
              onClearDemoStorage={handleAdminClearStorage}
            />
          </div>
        </>
      )}
    </section>
  )
}

export default Perfil
