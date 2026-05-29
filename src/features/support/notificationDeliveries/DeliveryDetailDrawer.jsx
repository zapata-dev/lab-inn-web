import { useState } from 'react'
import { Drawer } from '../../../components/common'
import { retryNotificationDelivery } from '../../../services/notificationDeliveriesService'
import DeliveryOpsActions from './DeliveryOpsActions'
import DeliveryRetryHistory from './DeliveryRetryHistory'
import DeliveryStatusBadge from './DeliveryStatusBadge'

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

function DeliveryDetailDrawer({ isOpen, delivery, onClose, onRetrySuccess }) {
  const [retrying, setRetrying] = useState(false)
  const [retryResult, setRetryResult] = useState(null)
  const [retryError, setRetryError] = useState('')

  const handleRetry = async () => {
    if (!delivery?.deliveryId || delivery.status !== 'failed') return

    setRetrying(true)
    setRetryError('')
    setRetryResult(null)

    try {
      const result = await retryNotificationDelivery(delivery.deliveryId)
      setRetryResult(result)
      onRetrySuccess?.(delivery.deliveryId)
    } catch (error) {
      setRetryError(error?.message || 'No se pudo ejecutar retry manual.')
    } finally {
      setRetrying(false)
    }
  }

  if (!delivery) {
    return <Drawer isOpen={isOpen} onClose={onClose} title="Detalle de entrega" />
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Delivery ${delivery.deliveryId}`}>
      <div className="space-y-4">
        <section className="rounded-lg border border-lab-border bg-slate-50 p-3">
          <h4 className="text-sm font-semibold text-lab-text">Resumen</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">Status:</span> <DeliveryStatusBadge status={delivery.status} /></p>
            <p><span className="font-semibold">Tipo:</span> {delivery.tipo || 'N/D'}</p>
            <p><span className="font-semibold">Intentos:</span> {delivery.attemptCount ?? 0}</p>
            <p><span className="font-semibold">Creado:</span> {formatDate(delivery.createdAt)}</p>
            <p><span className="font-semibold">Actualizado:</span> {formatDate(delivery.updatedAt)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Destinatario</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">User ID:</span> {delivery.userId || 'N/D'}</p>
            <p><span className="font-semibold">Notification ID:</span> {delivery.notificationId || 'N/D'}</p>
          </div>
        </section>

        <section className="rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Origen</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">Source Event ID:</span> {delivery.sourceEventId || 'N/D'}</p>
            <p><span className="font-semibold">Source Type:</span> {delivery.sourceType || 'N/D'}</p>
            <p><span className="font-semibold">Source Path:</span> {delivery.sourcePath || 'N/D'}</p>
            <p><span className="font-semibold">Solicitud ID:</span> {delivery.solicitudId || 'N/D'}</p>
          </div>
        </section>

        <DeliveryRetryHistory delivery={delivery} deliveryId={delivery.deliveryId} />

        <section className="rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Error</h4>
          {delivery.lastError ? (
            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700">
              {delivery.lastError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-lab-muted">Sin error registrado.</p>
          )}
        </section>

        <section className="space-y-2 rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Metadata</h4>
          <pre className="max-h-48 overflow-auto rounded-lg border border-lab-border bg-slate-950 p-3 text-[11px] text-slate-100">
            {JSON.stringify(delivery.metadata || {}, null, 2)}
          </pre>
        </section>

        <DeliveryOpsActions
          delivery={delivery}
          onRetry={handleRetry}
          retryLoading={retrying}
          retryResult={retryResult}
        />

        {retryError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{retryError}</p>
        ) : null}
      </div>
    </Drawer>
  )
}

export default DeliveryDetailDrawer
