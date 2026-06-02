import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import AccessRequestDetailDrawer from '../features/support/users/AccessRequestDetailDrawer'
import AuditLogsList from '../features/support/users/AuditLogsList'
import AccessRequestsList from '../features/support/users/AccessRequestsList'
import useToast from '../hooks/useToast'
import UserEditDrawer from '../features/support/users/UserEditDrawer'
import UsersList from '../features/support/users/UsersList'
import {
  ACCESS_REQUEST_STATUS,
  approveAccessRequest,
  deactivateUser,
  listAuditLogs,
  rejectAccessRequest,
  subscribeAccessRequests,
  subscribeUsers,
  updateUser,
} from '../services/userAdminService'

function mapFirestoreError(error) {
  const code = String(error?.code || '').trim()
  if (code === 'permission-denied') {
    return 'No tienes permisos para esta operación en Firestore.'
  }

  if (code === 'unauthenticated') {
    return 'Tu sesión no es válida. Cierra sesión e intenta de nuevo.'
  }

  return error?.message || 'Ocurrió un error inesperado al administrar usuarios.'
}

function SoporteUsuarios() {
  const { user, loading, isFirebaseMode } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('solicitudes')

  const [statusFilter, setStatusFilter] = useState('pendiente')
  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [requestActionLoading, setRequestActionLoading] = useState(false)
  const [requestActionError, setRequestActionError] = useState('')

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userActionLoading, setUserActionLoading] = useState(false)
  const [userActionError, setUserActionError] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLogsLoading, setAuditLogsLoading] = useState(false)
  const [auditLogsError, setAuditLogsError] = useState('')

  const isSupportUser = useMemo(() => {
    const role = String(user?.rol || user?.role || '').trim().toLowerCase()
    return role === 'soporte'
  }, [user?.rol, user?.role])

  useEffect(() => {
    if (!isFirebaseMode || !isSupportUser) return () => {}

    setRequestsLoading(true)
    setRequestsError('')

    const unsubscribe = subscribeAccessRequests(
      { status: statusFilter },
      (nextRequests) => {
        setRequests(nextRequests)
        setRequestsLoading(false)
      },
      (error) => {
        setRequestsError(mapFirestoreError(error))
        setRequestsLoading(false)
      }
    )

    return unsubscribe
  }, [isFirebaseMode, isSupportUser, statusFilter])

  useEffect(() => {
    if (!isFirebaseMode || !isSupportUser) return () => {}

    setUsersLoading(true)
    setUsersError('')

    const unsubscribe = subscribeUsers(
      (nextUsers) => {
        setUsers(nextUsers)
        setUsersLoading(false)
      },
      (error) => {
        setUsersError(mapFirestoreError(error))
        setUsersLoading(false)
      }
    )

    return unsubscribe
  }, [isFirebaseMode, isSupportUser])

  useEffect(() => {
    if (!isFirebaseMode || !isSupportUser || activeTab !== 'historial') {
      setAuditLogsLoading(false)
      setAuditLogsError('')
      return () => {}
    }

    setAuditLogsLoading(true)
    setAuditLogsError('')

    const unsubscribe = listAuditLogs(
      { limitCount: 50 },
      (nextLogs) => {
        setAuditLogs(nextLogs)
        setAuditLogsLoading(false)
      },
      (error) => {
        setAuditLogsError(mapFirestoreError(error))
        setAuditLogsLoading(false)
      }
    )

    return unsubscribe
  }, [activeTab, isFirebaseMode, isSupportUser])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-lab-bg px-4">
        <p className="text-sm font-medium text-lab-muted">Validando acceso...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isFirebaseMode) {
    return (
      <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
        <section className="mx-auto w-full max-w-4xl">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-lab-border bg-white px-3 py-2 text-sm font-semibold text-lab-text shadow-sm transition hover:border-lab-primary hover:text-lab-primary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a Mi Oficina
            </Link>
          </div>

          <Card className="space-y-3">
            <h1 className="text-2xl font-bold text-lab-text">Soporte de usuarios</h1>
            <p className="text-sm text-lab-muted">
              Esta pantalla solo opera en modo Firebase. Cambia `VITE_AUTH_MODE=firebase` para usar
              gestión real de solicitudes y usuarios.
            </p>
          </Card>
        </section>
      </main>
    )
  }

  if (!isSupportUser) {
    return <Navigate to="/unauthorized" replace />
  }

  const handleApproveRequest = async (payload) => {
    if (!selectedRequest) return
    setRequestActionLoading(true)
    setRequestActionError('')

    try {
      const result = await approveAccessRequest(selectedRequest, payload, user)
      if (result?.auditLogWarning) {
        toast.warning(result.auditLogWarning)
      }
      setSelectedRequest(null)
    } catch (error) {
      setRequestActionError(mapFirestoreError(error))
    } finally {
      setRequestActionLoading(false)
    }
  }

  const handleRejectRequest = async (reason) => {
    if (!selectedRequest) return
    setRequestActionLoading(true)
    setRequestActionError('')

    try {
      const result = await rejectAccessRequest(selectedRequest, reason, user)
      if (result?.auditLogWarning) {
        toast.warning(result.auditLogWarning)
      }
      setSelectedRequest(null)
    } catch (error) {
      setRequestActionError(mapFirestoreError(error))
    } finally {
      setRequestActionLoading(false)
    }
  }

  const handleSaveUser = async (payload) => {
    if (!selectedUser) return
    setUserActionLoading(true)
    setUserActionError('')

    try {
      await updateUser(selectedUser.uid, payload)
      setSelectedUser(null)
    } catch (error) {
      setUserActionError(mapFirestoreError(error))
    } finally {
      setUserActionLoading(false)
    }
  }

  const handleDeactivateUser = async (targetUser) => {
    setUserActionLoading(true)
    setUserActionError('')

    try {
      await deactivateUser(targetUser.uid)
      setSelectedUser(null)
    } catch (error) {
      setUserActionError(mapFirestoreError(error))
    } finally {
      setUserActionLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 rounded-2xl border border-lab-border bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-lab-text">Soporte de usuarios</h1>
            <p className="text-sm text-lab-muted">
              Administra solicitudes de acceso y usuarios autorizados en Firestore.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-lab-border bg-white px-3 py-2 text-sm font-semibold text-lab-text shadow-sm transition hover:border-lab-primary hover:text-lab-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a Mi Oficina
          </Link>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('solicitudes')}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === 'solicitudes'
                ? 'bg-lab-primary text-white'
                : 'border border-lab-border bg-white text-lab-text hover:border-lab-primary hover:text-lab-primary'
            }`}
          >
            Solicitudes de acceso
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === 'usuarios'
                ? 'bg-lab-primary text-white'
                : 'border border-lab-border bg-white text-lab-text hover:border-lab-primary hover:text-lab-primary'
            }`}
          >
            Usuarios autorizados
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === 'historial'
                ? 'bg-lab-primary text-white'
                : 'border border-lab-border bg-white text-lab-text hover:border-lab-primary hover:text-lab-primary'
            }`}
          >
            Historial
          </button>
        </div>

        {activeTab === 'solicitudes' ? (
          <AccessRequestsList
            requests={requests}
            loading={requestsLoading}
            error={requestsError}
            statusFilter={ACCESS_REQUEST_STATUS.includes(statusFilter) ? statusFilter : 'todos'}
            onStatusChange={setStatusFilter}
            onSelectRequest={(request) => {
              setRequestActionError('')
              setSelectedRequest(request)
            }}
          />
        ) : null}

        {activeTab === 'usuarios' ? (
          <UsersList
            users={users}
            loading={usersLoading}
            error={usersError}
            onSelectUser={(nextUser) => {
              setUserActionError('')
              setSelectedUser(nextUser)
            }}
          />
        ) : null}

        {activeTab === 'historial' ? (
          <AuditLogsList logs={auditLogs} loading={auditLogsLoading} error={auditLogsError} />
        ) : null}
      </section>

      <AccessRequestDetailDrawer
        isOpen={Boolean(selectedRequest)}
        request={selectedRequest}
        saving={requestActionLoading}
        error={requestActionError}
        onClose={() => {
          setRequestActionError('')
          setSelectedRequest(null)
        }}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      <UserEditDrawer
        isOpen={Boolean(selectedUser)}
        user={selectedUser}
        saving={userActionLoading}
        error={userActionError}
        onClose={() => {
          setUserActionError('')
          setSelectedUser(null)
        }}
        onSave={handleSaveUser}
        onDeactivate={handleDeactivateUser}
      />
    </main>
  )
}

export default SoporteUsuarios


