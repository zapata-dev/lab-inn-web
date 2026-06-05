import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BRANCH_OPTIONS,
  ROLE_OPTIONS,
  createAccessRequest,
  getMyAccessRequest,
} from '../services/userAdminService'

const DEFAULT_BRANCH_ID = BRANCH_OPTIONS[0]?.id || 'suc-default'

function formatDate(dateValue) {
  if (!(dateValue instanceof Date)) return 'Sin fecha'
  return dateValue.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mapRequestStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'pendiente') return 'Pendiente'
  if (normalized === 'aprobado') return 'Aprobado'
  if (normalized === 'rechazado') return 'Rechazado'
  if (normalized === 'cancelado') return 'Cancelado'
  return 'Sin estado'
}

function mapRoleLabel(role) {
  if (role === 'coordinador') return 'Coordinador'
  if (role === 'soporte') return 'Soporte'
  return 'Vendedor'
}

function getRequestStatusMessage(status) {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'pendiente') return 'Tu solicitud está en revisión.'
  if (normalized === 'rechazado') {
    return 'Tu solicitud fue rechazada. Contacta a soporte si necesitas reenviarla.'
  }
  if (normalized === 'cancelado') return 'Tu solicitud fue cancelada. Contacta a soporte.'
  if (normalized === 'aprobado') {
    return 'Tu solicitud fue aprobada. Cierra sesión e inicia de nuevo.'
  }
  return 'El equipo de soporte revisará tu solicitud.'
}

function Unauthorized() {
  const navigate = useNavigate()
  const { authErrorCode, authIdentity, error, logout, isFirebaseMode } = useAuth()
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [existingRequest, setExistingRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [requestedRole, setRequestedRole] = useState('vendedor')
  const [requestedSucursalId, setRequestedSucursalId] = useState(DEFAULT_BRANCH_ID)
  const [message, setMessage] = useState('')

  const selectedBranch = useMemo(
    () => BRANCH_OPTIONS.find((branch) => branch.id === requestedSucursalId) || BRANCH_OPTIONS[0] || null,
    [requestedSucursalId]
  )

  useEffect(() => {
    let isMounted = true

    const loadRequest = async () => {
      if (!authIdentity?.uid) {
        setExistingRequest(null)
        return
      }

      setRequestLoading(true)
      setRequestError('')

      try {
        const myRequest = await getMyAccessRequest(authIdentity.uid)
        if (!isMounted) return
        setExistingRequest(myRequest)
      } catch (loadError) {
        if (!isMounted) return
        const code = String(loadError?.code || '').trim()
        if (code === 'permission-denied') {
          setRequestError(
            'No se pudo consultar tu solicitud. Verifica permisos en Firestore o contacta a soporte.'
          )
        } else {
          setRequestError(loadError?.message || 'No fue posible consultar tu solicitud actual.')
        }
      } finally {
        if (isMounted) setRequestLoading(false)
      }
    }

    loadRequest()
    return () => {
      isMounted = false
    }
  }, [authIdentity?.uid])

  useEffect(() => {
    if (!existingRequest) return
    if (existingRequest.requestedRole) {
      setRequestedRole(existingRequest.requestedRole)
    }
    if (existingRequest.requestedSucursalId) {
      setRequestedSucursalId(existingRequest.requestedSucursalId)
    }
    if (existingRequest.message) {
      setMessage(existingRequest.message)
    }
  }, [existingRequest])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setRequestError('')
    setRequestSuccess('')

    if (!authIdentity?.uid || !authIdentity?.email) {
      setRequestError('No encontramos una sesión válida. Vuelve a iniciar sesión con Google Zapata.')
      return
    }

    if (existingRequest?.status === 'pendiente') {
      setRequestError('Ya tienes una solicitud pendiente.')
      return
    }

    if (existingRequest?.status === 'rechazado' || existingRequest?.status === 'cancelado') {
      setRequestError(
        'No se pudo reenviar la solicitud actual por restricciones de reglas en Firestore. Contacta a soporte.'
      )
      return
    }

    setSubmitting(true)
    try {
      const nextRequest = await createAccessRequest(authIdentity, {
        requestedRole,
        requestedSucursalId,
        requestedSucursalNombre: selectedBranch?.nombre || 'Sin asignar',
        message,
        nombre: authIdentity.displayName,
      })
      setExistingRequest(nextRequest)
      setRequestSuccess('Solicitud enviada correctamente. El equipo de soporte la revisara pronto.')
    } catch (submitError) {
      const code = String(submitError?.code || '').trim()
      if (code === 'permission-denied') {
        setRequestError(
          'No se pudo crear la solicitud. Revisa que tu correo sea corporativo Zapata o contacta a soporte.'
        )
      } else if (code === 'request-already-pending') {
        setRequestError('Ya tienes una solicitud pendiente.')
      } else if (code === 'request-already-approved') {
        setRequestError('Tu solicitud ya fue aprobada. Vuelve a iniciar sesión para entrar a LAB.')
      } else if (code === 'request-resubmit-not-allowed') {
        setRequestError(
          'No se puede reenviar una solicitud rechazada o cancelada con las reglas actuales. Contacta a soporte.'
        )
      } else {
        setRequestError(submitError?.message || 'Error al enviar solicitud.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const noValidSession = !authIdentity?.uid || !authIdentity?.email
  const canSubmitNewRequest = !noValidSession && !existingRequest

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl border border-lab-border bg-white p-8 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-lab-text">No tienes acceso a LAB todavía</h1>
          <p className="text-sm text-lab-muted">
            Tu correo fue autenticado con Google, pero aun no tienes permisos asignados en Mi Oficina
            Virtual.
          </p>
        </header>

        {authErrorCode ? (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            Código: {authErrorCode}
            {error?.message ? ` - ${error.message}` : ''}
          </p>
        ) : null}

        {noValidSession ? (
          <section className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-semibold text-rose-700">
              Para solicitar acceso primero inicia sesión con Google Zapata.
            </p>
            <p className="text-sm text-rose-700/90">
              No pudimos confirmar tu identidad de Google, así que todavía no podemos mostrar el formulario de solicitud.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Volver a login
            </button>
          </section>
        ) : (
          <section className="space-y-3 rounded-lg border border-lab-border bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-lab-text">Datos de tu cuenta</h2>
            <p className="text-sm text-lab-muted">
              <span className="font-semibold text-lab-text">Nombre:</span>{' '}
              {authIdentity.displayName || 'Sin nombre'}
            </p>
            <p className="text-sm text-lab-muted">
              <span className="font-semibold text-lab-text">Correo:</span> {authIdentity.email}
            </p>
          </section>
        )}

        {requestLoading ? (
          <p className="rounded-lg border border-lab-border bg-white px-4 py-3 text-sm text-lab-muted">
            Cargando solicitud existente...
          </p>
        ) : null}

        {existingRequest ? (
          <section className="space-y-2 rounded-lg border border-lab-border bg-white px-4 py-3">
            <h2 className="text-sm font-semibold text-lab-text">Estado de tu solicitud</h2>
            <p className="text-sm text-lab-muted">
              <span className="font-semibold text-lab-text">Estado:</span>{' '}
              {mapRequestStatus(existingRequest.status)}
            </p>
            <p className="text-sm text-lab-muted">
              <span className="font-semibold text-lab-text">Rol solicitado:</span>{' '}
              {mapRoleLabel(existingRequest.requestedRole)}
            </p>
            <p className="text-sm text-lab-muted">
              <span className="font-semibold text-lab-text">Sucursal:</span>{' '}
              {existingRequest.requestedSucursalNombre || existingRequest.requestedSucursalId || 'Sin asignar'}
            </p>
            <p className="text-sm text-lab-muted">
              <span className="font-semibold text-lab-text">Fecha:</span>{' '}
              {formatDate(existingRequest.createdAt)}
            </p>
            <p className="text-sm text-lab-muted">{getRequestStatusMessage(existingRequest.status)}</p>
          </section>
        ) : null}

        {canSubmitNewRequest ? (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-lab-border bg-white p-4">
            <h2 className="text-sm font-semibold text-lab-text">Solicitar acceso</h2>

            <label className="flex flex-col gap-1 text-sm text-lab-text">
              Rol solicitado
              <select
                value={requestedRole}
                onChange={(event) => setRequestedRole(event.target.value)}
                className="rounded-md border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {mapRoleLabel(role)}
                  </option>
                ))}
              </select>
            </label>

            {requestedRole === 'soporte' ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Nota: solicitar rol soporte no garantiza aprobación automática.
              </p>
            ) : null}

            <label className="flex flex-col gap-1 text-sm text-lab-text">
              Sucursal
              <select
                value={requestedSucursalId}
                onChange={(event) => setRequestedSucursalId(event.target.value)}
                className="rounded-md border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
              >
                {BRANCH_OPTIONS.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-lab-text">
              Motivo de solicitud
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                maxLength={500}
                className="rounded-md border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
                placeholder="Escribe brevemente por que necesitas acceso."
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white hover:bg-lab-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        ) : null}

        {requestSuccess ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {requestSuccess}
          </p>
        ) : null}

        {requestError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {requestError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
          >
            Volver a login
          </button>

          {isFirebaseMode ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Cerrar sesión
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default Unauthorized

