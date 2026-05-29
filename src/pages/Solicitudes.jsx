import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RequestsList from '../features/requests/RequestsList'
import RequestDetailDrawer from '../features/requests/RequestDetailDrawer'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import {
  addRequestComment,
  getRequestById,
  subscribeRequestsForUser,
  updateRequestStatus,
} from '../services/requestsService'

function Solicitudes() {
  const location = useLocation()
  const { user, isFirebaseMode, isAuthorized } = useAuth()
  const toast = useToast()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailComments, setDetailComments] = useState([])
  const [detailHistory, setDetailHistory] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [openedQueryRequestId, setOpenedQueryRequestId] = useState('')

  const isFlowEnabled = useMemo(() => isFirebaseMode && isAuthorized, [isFirebaseMode, isAuthorized])
  const querySolicitudId = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return String(params.get('solicitudId') ?? '').trim()
  }, [location.search])

  useEffect(() => {
    if (!isFlowEnabled || !user) {
      setLoading(false)
      setRequests([])
      return () => {}
    }

    setLoading(true)
    setError('')

    const unsubscribe = subscribeRequestsForUser(user, ({ items, error: subscriptionError }) => {
      if (subscriptionError) {
        setError(subscriptionError?.message || 'No se pudieron cargar las solicitudes.')
        setLoading(false)
        return
      }

      setRequests(items)
      setLoading(false)
    })

    return unsubscribe
  }, [isFlowEnabled, user])

  const handleOpenRequest = async (request) => {
    try {
      setDetailLoading(true)
      const details = await getRequestById(request.solicitudId)
      setSelectedRequest(details.request)
      setDetailComments(details.comments)
      setDetailHistory(details.history)
    } catch (detailError) {
      toast.error(detailError?.message || 'No se pudo abrir el detalle de solicitud.')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    if (!isFlowEnabled || !querySolicitudId) return
    if (openedQueryRequestId === querySolicitudId) return

    const targetRequest = requests.find(
      (item) => String(item?.solicitudId || item?.id || '').trim() === querySolicitudId
    )

    if (!targetRequest) return

    let isCancelled = false

    const openFromQuery = async () => {
      try {
        setDetailLoading(true)
        const details = await getRequestById(targetRequest.solicitudId)
        if (isCancelled) return

        setSelectedRequest(details.request)
        setDetailComments(details.comments)
        setDetailHistory(details.history)
        setOpenedQueryRequestId(querySolicitudId)
      } catch (detailError) {
        if (!isCancelled) {
          toast.error(detailError?.message || 'No se pudo abrir el detalle de solicitud.')
        }
      } finally {
        if (!isCancelled) {
          setDetailLoading(false)
        }
      }
    }

    openFromQuery()
    return () => {
      isCancelled = true
    }
  }, [isFlowEnabled, openedQueryRequestId, querySolicitudId, requests, toast])

  const refreshSelectedRequest = async (solicitudId) => {
    const details = await getRequestById(solicitudId)
    setSelectedRequest(details.request)
    setDetailComments(details.comments)
    setDetailHistory(details.history)
  }

  const handleAddComment = async (texto) => {
    if (!selectedRequest || !user) return

    setSavingComment(true)
    try {
      await addRequestComment({
        solicitudId: selectedRequest.solicitudId,
        user,
        texto,
      })
      await refreshSelectedRequest(selectedRequest.solicitudId)
      toast.success('Comentario agregado.')
    } finally {
      setSavingComment(false)
    }
  }

  const handleUpdateStatus = async (estadoNuevo, detalle) => {
    if (!selectedRequest || !user) return

    setSavingStatus(true)
    try {
      await updateRequestStatus({
        solicitudId: selectedRequest.solicitudId,
        user,
        estadoNuevo,
        detalle,
      })
      await refreshSelectedRequest(selectedRequest.solicitudId)
      toast.success('Estado de solicitud actualizado.')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-lab-bg to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Link
                to="/inventario"
                className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver a inventario
              </Link>
              <h1 className="text-3xl font-bold text-lab-text">Solicitudes entre sucursales</h1>
              <p className="text-sm text-lab-muted">
                Flujo base para crear, comentar y actualizar estado de solicitudes sobre unidades.
              </p>
            </div>
          </div>
        </header>

        {!isFlowEnabled ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Este flujo esta disponible solo en modo Firebase con usuario autorizado.
          </p>
        ) : (
          <RequestsList items={requests} loading={loading} error={error} onSelect={handleOpenRequest} />
        )}
      </div>

      <RequestDetailDrawer
        isOpen={Boolean(selectedRequest) || detailLoading}
        request={selectedRequest}
        comments={detailComments}
        history={detailHistory}
        user={user}
        onClose={() => {
          setSelectedRequest(null)
          setDetailComments([])
          setDetailHistory([])
        }}
        onAddComment={handleAddComment}
        onUpdateStatus={handleUpdateStatus}
        savingComment={savingComment}
        savingStatus={savingStatus}
      />
    </main>
  )
}

export default Solicitudes
