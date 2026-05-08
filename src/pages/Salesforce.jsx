import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Card, EmptyState } from '../components/common'
import { useAuth } from '../context/AuthContext'
import SalesforceDashboard from '../features/salesforce/SalesforceDashboard'
import SalesforceDrawer from '../features/salesforce/SalesforceDrawer'
import SalesforceInvoicesTable from '../features/salesforce/SalesforceInvoicesTable'
import SalesforceLeadsTable from '../features/salesforce/SalesforceLeadsTable'
import SalesforceOpportunitiesTable from '../features/salesforce/SalesforceOpportunitiesTable'
import SalesforceOrdersTable from '../features/salesforce/SalesforceOrdersTable'
import { dataService } from '../services/dataService'
import { getSimulatedOpportunities } from '../services/quotesService'

const tabs = [
  { key: 'tablero', label: 'Tablero' },
  { key: 'leads', label: 'Leads' },
  { key: 'oportunidades', label: 'Oportunidades' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'facturas', label: 'Facturas' },
]

const scopeModeByRole = {
  admin: 'global',
  direccion: 'global',
  bdcLab: 'global',
  gerente: 'branch',
  bdcSucursal: 'branch',
  ejecutivo: 'branch',
}

function scopeByBranch(items, branchId) {
  return branchId ? items.filter((item) => item.branchId === branchId) : items
}

function Salesforce() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rawLeads, setRawLeads] = useState([])
  const [rawOpportunities, setRawOpportunities] = useState([])
  const [rawOrders, setRawOrders] = useState([])
  const [rawInvoices, setRawInvoices] = useState([])
  const [branches, setBranches] = useState([])
  const [inventory, setInventory] = useState([])
  const [simRefreshKey, setSimRefreshKey] = useState(0)
  const [drawer, setDrawer] = useState({ open: false, entity: null, entityType: null })
  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab')
    return tabs.some((t) => t.key === tab) ? tab : 'tablero'
  }, [searchParams])

  const changeTab = (key) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', key)
    setSearchParams(next)
  }

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const [leads, opps, orders, invoices, branchList, inventoryList] = await Promise.all([
          dataService.getLeads(),
          dataService.getOpportunities(),
          dataService.getOrders(),
          dataService.getInvoices(),
          dataService.getBranches(),
          dataService.getInventory(),
        ])

        if (!isActive) return

        setRawLeads(Array.isArray(leads) ? leads : [])
        setRawOpportunities(Array.isArray(opps) ? opps : [])
        setRawOrders(Array.isArray(orders) ? orders : [])
        setRawInvoices(Array.isArray(invoices) ? invoices : [])
        setBranches(Array.isArray(branchList) ? branchList : [])
        setInventory(Array.isArray(inventoryList) ? inventoryList : [])
      } catch (loadError) {
        if (isActive) {
          setError(loadError?.message ?? 'No fue posible cargar los datos de Salesforce.')
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    load()
    return () => { isActive = false }
  }, [])

  const scopeMode = scopeModeByRole[user?.role] ?? 'global'
  const scopeBranchId = scopeMode === 'branch' ? user?.branchId : null

  const leads = useMemo(() => scopeByBranch(rawLeads, scopeBranchId), [rawLeads, scopeBranchId])
  const opportunities = useMemo(() => scopeByBranch(rawOpportunities, scopeBranchId), [rawOpportunities, scopeBranchId])
  const orders = useMemo(() => scopeByBranch(rawOrders, scopeBranchId), [rawOrders, scopeBranchId])
  const invoices = useMemo(() => scopeByBranch(rawInvoices, scopeBranchId), [rawInvoices, scopeBranchId])

  const simulatedOpps = useMemo(() => {
    const all = getSimulatedOpportunities()
    return scopeBranchId ? all.filter((o) => o.branchId === scopeBranchId) : all
  }, [scopeBranchId, simRefreshKey])

  const openLeadDrawer = useCallback((lead) => {
    setDrawer({ open: true, entity: lead, entityType: 'lead' })
  }, [])

  const openOppDrawer = useCallback((opp) => {
    setDrawer({ open: true, entity: opp, entityType: 'opp' })
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawer({ open: false, entity: null, entityType: null })
  }, [])

  const handleDrawerDataChanged = useCallback(() => {
    setSimRefreshKey((k) => k + 1)
  }, [])

  const branchesById = useMemo(
    () => Object.fromEntries(branches.map((b) => [b.id, b])),
    [branches]
  )
  const inventoryById = useMemo(
    () => Object.fromEntries(inventory.map((u) => [u.id, u])),
    [inventory]
  )
  const leadsById = useMemo(
    () => Object.fromEntries(rawLeads.map((l) => [l.id, l])),
    [rawLeads]
  )

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Salesforce</h2>
          <p className="text-sm text-lab-muted">Cargando datos CRM...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-7xl">
        <EmptyState title="No pudimos cargar Salesforce" description={error} />
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Salesforce</h2>
            <p className="text-sm text-lab-muted">
              Tablero CRM: leads, oportunidades, pedidos y facturas del pipeline comercial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">{user?.name}</Badge>
            <Badge variant="info">{user?.roleLabel}</Badge>
            {scopeMode === 'branch' && <Badge>{user?.branchName}</Badge>}
            <Badge variant="demo">Sprint 4 Dia 2</Badge>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'border-lab-primary bg-lab-primary text-white'
                  : 'border-lab-border bg-white text-lab-muted hover:text-lab-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {activeTab === 'tablero' && (
        <SalesforceDashboard
          leads={leads}
          opportunities={opportunities}
          simulatedOpps={simulatedOpps}
          orders={orders}
          invoices={invoices}
          leadsById={leadsById}
          inventoryById={inventoryById}
        />
      )}

      {activeTab === 'leads' && (
        <SalesforceLeadsTable leads={leads} onRowClick={openLeadDrawer} />
      )}

      {activeTab === 'oportunidades' && (
        <SalesforceOpportunitiesTable
          opportunities={opportunities}
          simulatedOpps={simulatedOpps}
          leadsById={leadsById}
          inventoryById={inventoryById}
          onRowClick={openOppDrawer}
        />
      )}

      {activeTab === 'pedidos' && (
        <SalesforceOrdersTable orders={orders} branchesById={branchesById} />
      )}

      {activeTab === 'facturas' && (
        <SalesforceInvoicesTable invoices={invoices} branchesById={branchesById} />
      )}

      <SalesforceDrawer
        open={drawer.open}
        entity={drawer.entity}
        entityType={drawer.entityType}
        inventoryById={inventoryById}
        branchesById={branchesById}
        onClose={closeDrawer}
        onDataChanged={handleDrawerDataChanged}
      />
    </section>
  )
}

export default Salesforce
