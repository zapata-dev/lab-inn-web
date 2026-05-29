import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import AttemptDetailDrawer from '../features/support/notificationAttempts/AttemptDetailDrawer'
import AttemptFilters from '../features/support/notificationAttempts/AttemptFilters'
import AttemptList from '../features/support/notificationAttempts/AttemptList'
import { useAuth } from '../context/AuthContext'
import {
  buildAttemptCsvRows,
  subscribeNotificationAttempts,
} from '../services/notificationAttemptsService'
import { downloadCsv } from '../utils/csvExport'

const DEFAULT_FILTERS = {
  status: '',
  reason: '',
  triggeredBy: '',
  deliveryId: '',
  solicitudId: '',
  userId: '',
  limitCount: 100,
}

const ATTEMPT_CSV_COLUMNS = [
  { key: 'attemptId', label: 'Attempt ID' },
  { key: 'deliveryId', label: 'Delivery ID' },
  { key: 'notificationId', label: 'Notification ID' },
  { key: 'sourceType', label: 'Source Type' },
  { key: 'sourcePath', label: 'Source Path' },
  { key: 'solicitudId', label: 'Solicitud ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
  { key: 'attemptNumber', label: 'Attempt Number' },
  { key: 'triggeredBy', label: 'Triggered By' },
  { key: 'triggeredByUid', label: 'Triggered By UID' },
  { key: 'errorCode', label: 'Error Code' },
  { key: 'errorMessage', label: 'Error Message' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'refPath', label: 'Ref Path' },
]

function buildCsvFilename() {
  const now = new Date()

  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')

  return `notification-attempts-${yyyy}${mm}${dd}-${hh}${min}.csv`
}

function SoporteNotificationAttempts() {
  const { user, isFirebaseMode, isAuthorized, loading } = useAuth()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [items, setItems] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [opsMessage, setOpsMessage] = useState('')

  const normalizedRole = useMemo(
    () => String(user?.rol || user?.role || '').trim().toLowerCase(),
    [user?.rol, user?.role]
  )

  const isSupport = normalizedRole === 'soporte'

  useEffect(() => {
    if (!isFirebaseMode || !isAuthorized || !isSupport) {
      setItems([])
      setDataLoading(false)
      setError('')
      return () => {}
    }

    setDataLoading(true)
    setError('')

    const unsubscribe = subscribeNotificationAttempts(filters, ({ items: nextItems, error: nextError }) => {
      if (nextError) {
        setError(nextError?.message || 'No se pudieron cargar attempts de notificaciones.')
        setDataLoading(false)
        return
      }

      setItems(nextItems)
      setDataLoading(false)
    })

    return unsubscribe
  }, [filters, isAuthorized, isFirebaseMode, isSupport])

  const handleExportCsv = () => {
    const rows = buildAttemptCsvRows(items)

    if (!rows.length) {
      setOpsMessage('No hay attempts para exportar con los filtros actuales.')
      return
    }

    downloadCsv(buildCsvFilename(), rows, ATTEMPT_CSV_COLUMNS)
    setOpsMessage(`CSV exportado con ${rows.length} attempts.`)
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
          <h1 className="text-xl font-semibold text-lab-text">Attempts de notificaciones</h1>
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
                to="/soporte/notificaciones"
                className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver a deliveries
              </Link>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
              >
                <Download className="size-4" aria-hidden="true" />
                Exportar CSV
              </button>
            </div>

            <h1 className="text-3xl font-bold text-lab-text">Attempts de notificaciones</h1>
            <p className="text-sm text-lab-muted">Historial granular de intentos de entrega.</p>
            <p className="text-xs text-lab-muted">
              Para correlacion con incidentes, usa deliveryId, solicitudId y userId contra logs de Cloud Functions.
            </p>
            {opsMessage ? <p className="text-xs text-lab-primary">{opsMessage}</p> : null}
          </div>
        </header>

        <AttemptFilters
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />

        <AttemptList
          items={items}
          loading={dataLoading}
          error={error}
          onSelect={setSelectedAttempt}
          selectedAttemptId={selectedAttempt?.attemptId}
        />
      </div>

      <AttemptDetailDrawer
        isOpen={Boolean(selectedAttempt)}
        attempt={selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
      />
    </main>
  )
}

export default SoporteNotificationAttempts
