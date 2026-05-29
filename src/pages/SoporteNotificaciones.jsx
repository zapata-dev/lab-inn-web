import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import DeliveryDetailDrawer from '../features/support/notificationDeliveries/DeliveryDetailDrawer'
import DeliveryFilters from '../features/support/notificationDeliveries/DeliveryFilters'
import DeliveryList from '../features/support/notificationDeliveries/DeliveryList'
import { useAuth } from '../context/AuthContext'
import {
  buildDeliveryCsvRows,
  getNotificationDelivery,
  subscribeNotificationDeliveries,
} from '../services/notificationDeliveriesService'
import { downloadCsv } from '../utils/csvExport'

const DEFAULT_FILTERS = {
  status: '',
  sourceType: '',
  deliveryId: '',
  solicitudId: '',
  userId: '',
  limitCount: 50,
}

const DELIVERY_CSV_COLUMNS = [
  { key: 'deliveryId', label: 'Delivery ID' },
  { key: 'notificationId', label: 'Notification ID' },
  { key: 'sourceType', label: 'Source Type' },
  { key: 'solicitudId', label: 'Solicitud ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Status' },
  { key: 'attemptCount', label: 'Attempt Count' },
  { key: 'lastError', label: 'Last Error' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
  { key: 'deliveredAt', label: 'Delivered At' },
  { key: 'retriedAt', label: 'Retried At' },
]

function buildCsvFilename() {
  const now = new Date()

  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')

  return `notification-deliveries-${yyyy}${mm}${dd}-${hh}${min}.csv`
}

function SoporteNotificaciones() {
  const { user, isFirebaseMode, isAuthorized, loading } = useAuth()
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [items, setItems] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [opsMessage, setOpsMessage] = useState('')

  const normalizedRole = useMemo(
    () => String(user?.rol || user?.role || '').trim().toLowerCase(),
    [user?.rol, user?.role]
  )

  const isSupport = normalizedRole === 'soporte'

  useEffect(() => {
    const deliveryIdFromQuery = String(searchParams.get('deliveryId') || '').trim()
    if (!deliveryIdFromQuery) return

    setFilters((prev) => ({ ...prev, deliveryId: deliveryIdFromQuery }))
  }, [searchParams])

  useEffect(() => {
    if (!isFirebaseMode || !isAuthorized || !isSupport) {
      setItems([])
      setDataLoading(false)
      setError('')
      return () => {}
    }

    setDataLoading(true)
    setError('')

    const unsubscribe = subscribeNotificationDeliveries(filters, ({ items: nextItems, error: nextError }) => {
      if (nextError) {
        setError(nextError?.message || 'No se pudo cargar notificationDeliveries.')
        setDataLoading(false)
        return
      }

      setItems(nextItems)
      setDataLoading(false)
    })

    return unsubscribe
  }, [filters, isAuthorized, isFirebaseMode, isSupport])

  const handleOpenDetail = async (delivery) => {
    try {
      const latest = await getNotificationDelivery(delivery.deliveryId)
      setSelectedDelivery(latest)
      setOpsMessage('')
    } catch (detailError) {
      setError(detailError?.message || 'No se pudo cargar el detalle de la entrega.')
    }
  }

  const handleRetrySuccess = async (deliveryId) => {
    if (!deliveryId) return

    try {
      const latest = await getNotificationDelivery(deliveryId)
      setSelectedDelivery(latest)
      setOpsMessage(`Retry ejecutado para ${deliveryId}.`)
    } catch (_) {
      setOpsMessage('Retry ejecutado; la lista se actualizara por suscripcion.')
    }
  }

  const handleExportCsv = () => {
    const rows = buildDeliveryCsvRows(items)

    if (!rows.length) {
      setOpsMessage('No hay entregas para exportar con los filtros actuales.')
      return
    }

    downloadCsv(buildCsvFilename(), rows, DELIVERY_CSV_COLUMNS)
    setOpsMessage(`CSV exportado con ${rows.length} entregas.`)
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
          <h1 className="text-xl font-semibold text-lab-text">Entregas de notificaciones</h1>
          <p className="mt-2 text-sm text-lab-muted">Esta vista operativa esta disponible solo en modo Firebase.</p>
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
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/inicio"
                className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver
              </Link>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
              >
                <Download className="size-4" aria-hidden="true" />
                Exportar CSV
              </button>

              <Link
                to="/soporte/notificaciones/attempts"
                className="inline-flex items-center gap-2 rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
              >
                Ver attempts granulares
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-lab-text">Entregas de notificaciones</h1>
            <p className="text-sm text-lab-muted">Vista operativa para soporte.</p>
            <p className="text-xs text-lab-muted">
              Para incidentes complejos, revisar logs de Cloud Functions en Google Cloud Console. Ver docs/SUPPORT_DELIVERY_OPS.md.
            </p>
            {opsMessage ? <p className="text-xs text-lab-primary">{opsMessage}</p> : null}
          </div>
        </header>

        <DeliveryFilters
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />

        <DeliveryList
          items={items}
          loading={dataLoading}
          error={error}
          onSelect={handleOpenDetail}
          selectedDeliveryId={selectedDelivery?.deliveryId}
        />
      </div>

      <DeliveryDetailDrawer
        isOpen={Boolean(selectedDelivery)}
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        onRetrySuccess={handleRetrySuccess}
      />
    </main>
  )
}

export default SoporteNotificaciones
