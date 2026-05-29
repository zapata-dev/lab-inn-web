import { useEffect, useMemo, useState } from 'react'
import {
  subscribeDeliveryAttempts,
} from '../../../services/notificationDeliveriesService'
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

function buildDerivedEvents(delivery) {
  return [
    {
      id: 'created',
      label: 'Registro creado',
      date: delivery.createdAt,
      visible: Boolean(delivery.createdAt),
    },
    {
      id: 'delivery-result',
      label:
        delivery.status === 'failed'
          ? 'Entrega fallida'
          : delivery.deliveredAt
            ? 'Entrega registrada'
            : 'Resultado de entrega',
      date: delivery.deliveredAt || delivery.updatedAt,
      visible: Boolean(delivery.deliveredAt || delivery.updatedAt),
    },
    {
      id: 'retried',
      label: 'Retry manual ejecutado',
      date: delivery.retriedAt,
      visible: Boolean(delivery.retriedAt),
    },
  ].filter((event) => event.visible)
}

function AttemptRow({ attempt }) {
  return (
    <li className="space-y-1 rounded-md border border-lab-border bg-white px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-lab-text">Intento #{attempt.attemptNumber || 'N/D'}</p>
        <DeliveryStatusBadge status={attempt.status} />
      </div>

      <p className="text-lab-muted">{formatDate(attempt.createdAt)}</p>
      <p className="text-lab-text">
        <span className="font-semibold">Reason:</span> {attempt.reason || 'N/D'}
      </p>
      <p className="text-lab-text">
        <span className="font-semibold">Triggered by:</span> {attempt.triggeredBy || 'N/D'}
      </p>

      {attempt.errorMessage ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700">
          {attempt.errorMessage}
        </p>
      ) : null}
    </li>
  )
}

function DeliveryRetryHistory({ delivery, deliveryId: deliveryIdProp = '' }) {
  const [attempts, setAttempts] = useState([])
  const [loadingAttempts, setLoadingAttempts] = useState(false)
  const [attemptsError, setAttemptsError] = useState('')

  const deliveryId = String(deliveryIdProp || delivery?.deliveryId || '').trim()

  useEffect(() => {
    if (!deliveryId) {
      setAttempts([])
      setAttemptsError('')
      setLoadingAttempts(false)
      return () => {}
    }

    setLoadingAttempts(true)
    setAttempts([])
    setAttemptsError('')

    const unsubscribe = subscribeDeliveryAttempts(deliveryId, ({ items, error }) => {
      if (error) {
        setAttempts([])
        setAttemptsError(error.message || 'No se pudo cargar historial granular de attempts.')
        setLoadingAttempts(false)
        return
      }

      setAttempts(items)
      setAttemptsError('')
      setLoadingAttempts(false)
    })

    return unsubscribe
  }, [deliveryId])

  const derivedEvents = useMemo(() => buildDerivedEvents(delivery || {}), [delivery])

  if (!delivery) return null

  return (
    <section className="space-y-2 rounded-lg border border-lab-border bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-lab-text">Historial de intentos</h4>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <p className="text-xs text-lab-muted">Intentos registrados: {delivery.attemptCount ?? 0}</p>

      {loadingAttempts ? <p className="text-xs text-lab-muted">Cargando attempts...</p> : null}

      {!loadingAttempts && attemptsError ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700">{attemptsError}</p>
      ) : null}

      {!loadingAttempts && !attemptsError && attempts.length > 0 ? (
        <ol className="space-y-2">
          {attempts.map((attempt) => (
            <AttemptRow key={attempt.attemptId} attempt={attempt} />
          ))}
        </ol>
      ) : null}

      {!loadingAttempts && !attemptsError && attempts.length === 0 ? (
        <div className="space-y-2">
          {derivedEvents.length > 0 ? (
            <ol className="space-y-2">
              {derivedEvents.map((event) => (
                <li key={event.id} className="rounded-md border border-lab-border bg-white px-3 py-2 text-xs">
                  <p className="font-semibold text-lab-text">{event.label}</p>
                  <p className="text-lab-muted">{formatDate(event.date)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-lab-muted">No hay timestamps suficientes para mostrar historial derivado.</p>
          )}

          <p className="text-[11px] text-lab-muted">
            Historial granular no disponible todavia para esta entrega; se usa fallback derivado.
          </p>
        </div>
      ) : null}
    </section>
  )
}

export default DeliveryRetryHistory
