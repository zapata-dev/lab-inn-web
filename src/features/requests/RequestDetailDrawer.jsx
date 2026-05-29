import { useMemo, useState } from 'react'
import { Drawer } from '../../components/common'
import { canCommentRequest } from '../../utils/requestPermissions'
import {
  canTransitionRequestStatus,
  getRequestStatusLabel,
  REQUEST_STATUS_OPTIONS,
} from '../../utils/requestStatus'
import RequestComments from './RequestComments'
import RequestStatusBadge from './RequestStatusBadge'

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

function RequestDetailDrawer({
  isOpen,
  request,
  comments,
  history,
  user,
  onClose,
  onAddComment,
  onUpdateStatus,
  savingComment,
  savingStatus,
}) {
  const [nextStatus, setNextStatus] = useState('')
  const [statusDetail, setStatusDetail] = useState('')
  const [statusError, setStatusError] = useState('')

  const commentEnabled = useMemo(() => {
    if (!request || !user) return false
    return canCommentRequest(user, request)
  }, [request, user])

  const availableTransitions = useMemo(() => {
    if (!request || !user) return []

    return REQUEST_STATUS_OPTIONS.filter((option) =>
      canTransitionRequestStatus({
        from: request.estado,
        to: option.value,
        user,
        request,
      })
    )
  }, [request, user])

  const handleStatusUpdate = async () => {
    if (!nextStatus) {
      setStatusError('Selecciona un nuevo estado.')
      return
    }

    try {
      setStatusError('')
      await onUpdateStatus?.(nextStatus, statusDetail)
      setNextStatus('')
      setStatusDetail('')
    } catch (error) {
      setStatusError(error?.message || 'No se pudo actualizar el estado.')
    }
  }

  if (!request) {
    return <Drawer isOpen={isOpen} onClose={onClose} title="Detalle de solicitud" />
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Solicitud ${request.solicitudId}`}>
      <div className="space-y-4">
        <section className="space-y-2 rounded-lg border border-lab-border bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-lab-text">{request.unitSnapshot?.marca || 'Unidad'} {request.unitSnapshot?.modelo || ''}</p>
            <RequestStatusBadge status={request.estado} />
          </div>
          <p className="text-xs text-lab-muted">VIN: {request.unitVin || 'N/D'}</p>
          <p className="text-xs text-lab-muted">Solicitante: {request.sucursalSolicitanteNombre || request.sucursalSolicitanteId || 'N/D'}</p>
          <p className="text-xs text-lab-muted">Dueña: {request.sucursalDuenaNombre || request.sucursalDuenaId || 'N/D'}</p>
          <p className="text-xs text-lab-muted">Vendedor: {request.vendedorNombre || request.vendedorEmail || 'N/D'}</p>
          <p className="text-xs text-lab-muted">Prioridad: {request.prioridad || 'normal'}</p>
          <p className="text-xs text-lab-muted">Actividad: {formatDate(request.lastActivityAt || request.updatedAt)}</p>
          {request.comentarioInicial ? (
            <p className="rounded-md border border-lab-border bg-white px-2 py-1 text-xs text-lab-text">
              Comentario inicial: {request.comentarioInicial}
            </p>
          ) : null}
        </section>

        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-lab-text">Cambiar estado</h4>
          {availableTransitions.length > 0 ? (
            <>
              {statusError && <p className="text-xs text-rose-600">{statusError}</p>}
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
                className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm"
              >
                <option value="">Selecciona estado</option>
                {availableTransitions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                value={statusDetail}
                onChange={(event) => setStatusDetail(event.target.value)}
                placeholder={`Motivo del cambio (${getRequestStatusLabel(nextStatus) || 'estado'})`}
                className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={savingStatus}
                className="rounded-lg bg-lab-primary px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingStatus ? 'Actualizando...' : 'Actualizar estado'}
              </button>
            </>
          ) : (
            <p className="text-xs text-lab-muted">No tienes transiciones disponibles para esta solicitud.</p>
          )}
        </section>

        <RequestComments
          comments={comments}
          canComment={commentEnabled}
          onSubmit={onAddComment}
          saving={savingComment}
        />

        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-lab-text">Historial</h4>
          {history.length > 0 ? (
            <ul className="space-y-2">
              {history.map((event) => (
                <li key={event.eventoId} className="rounded-lg border border-lab-border bg-white px-3 py-2 text-xs">
                  <p className="font-semibold text-lab-text">{event.tipoEvento || 'evento'}</p>
                  <p className="text-lab-muted">
                    {event.estadoAnterior || '-'} {'->'} {event.estadoNuevo || '-'}
                  </p>
                  {event.detalle ? <p className="text-lab-text">{event.detalle}</p> : null}
                  <p className="text-lab-muted">{formatDate(event.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-lab-muted">Sin eventos de historial para mostrar.</p>
          )}
        </section>
      </div>
    </Drawer>
  )
}

export default RequestDetailDrawer
