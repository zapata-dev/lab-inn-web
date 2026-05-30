import { useEffect, useMemo, useState } from 'react'
import { Drawer } from '../../../components/common'
import { BRANCH_OPTIONS, ROLE_OPTIONS } from '../../../services/userAdminService'
import UserStatusBadge from './UserStatusBadge'

function getBranchNameById(branchId) {
  return BRANCH_OPTIONS.find((branch) => branch.id === branchId)?.nombre || ''
}

function AccessRequestDetailDrawer({
  isOpen,
  request,
  saving,
  error,
  onClose,
  onApprove,
  onReject,
}) {
  const [selectedRole, setSelectedRole] = useState('vendedor')
  const [selectedBranchId, setSelectedBranchId] = useState('suc-qro')
  const [decisionReason, setDecisionReason] = useState('')

  useEffect(() => {
    if (!request) return
    setSelectedRole(request.requestedRole || 'vendedor')
    setSelectedBranchId(request.requestedSucursalId || 'suc-default')
    setDecisionReason('')
  }, [request])

  const selectedBranchName = useMemo(
    () => getBranchNameById(selectedBranchId) || request?.requestedSucursalNombre || 'Sin asignar',
    [request?.requestedSucursalNombre, selectedBranchId]
  )

  if (!request) return null

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Detalle de solicitud">
      <div className="space-y-5">
        <section className="space-y-1 rounded-lg border border-lab-border bg-slate-50 p-3">
          <p className="text-sm font-semibold text-lab-text">{request.nombre || request.displayName || 'Sin nombre'}</p>
          <p className="text-xs text-lab-muted">{request.email || 'Sin correo'}</p>
          <div className="pt-2">
            <UserStatusBadge status={request.status} />
          </div>
        </section>

        <section className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-lab-text">Rol a asignar</span>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="w-full rounded-md border border-lab-border px-3 py-2 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-lab-text">Sucursal</span>
            <select
              value={selectedBranchId}
              onChange={(event) => setSelectedBranchId(event.target.value)}
              className="w-full rounded-md border border-lab-border px-3 py-2 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
            >
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-lab-text">Razon / notas</span>
            <textarea
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
              rows={3}
              placeholder="Comentario de aprobacion o rechazo"
              className="w-full rounded-md border border-lab-border px-3 py-2 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
            />
          </label>
        </section>

        {request.message ? (
          <section className="rounded-lg border border-lab-border bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Mensaje del usuario</p>
            <p className="mt-1 text-sm text-lab-text">{request.message}</p>
          </section>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onApprove({
                rol: selectedRole,
                sucursalId: selectedBranchId,
                sucursalNombre: selectedBranchName,
                decisionReason,
                notas: decisionReason,
              })
            }
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Aprobar'}
          </button>

          <button
            type="button"
            onClick={() => onReject(decisionReason)}
            disabled={saving}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Rechazar'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Drawer>
  )
}

export default AccessRequestDetailDrawer
