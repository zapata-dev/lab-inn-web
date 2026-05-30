import { useEffect, useMemo, useState } from 'react'
import { Drawer } from '../../../components/common'
import { BRANCH_OPTIONS, ROLE_OPTIONS } from '../../../services/userAdminService'

function getBranchNameById(branchId) {
  return BRANCH_OPTIONS.find((branch) => branch.id === branchId)?.nombre || ''
}

function UserEditDrawer({ isOpen, user, saving, error, onClose, onSave, onDeactivate }) {
  const [selectedRole, setSelectedRole] = useState('vendedor')
  const [selectedBranchId, setSelectedBranchId] = useState('suc-default')
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!user) return
    setSelectedRole(user.rol || user.role || 'vendedor')
    setSelectedBranchId(user.sucursalId || 'suc-default')
    setIsActive(user.activo === true)
    setNotes(user.notas || '')
  }, [user])

  const selectedBranchName = useMemo(
    () => getBranchNameById(selectedBranchId) || user?.sucursalNombre || 'Sin asignar',
    [selectedBranchId, user?.sucursalNombre]
  )

  if (!user) return null

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Editar usuario">
      <div className="space-y-5">
        <section className="space-y-1 rounded-lg border border-lab-border bg-slate-50 p-3">
          <p className="text-sm font-semibold text-lab-text">{user.nombre || 'Sin nombre'}</p>
          <p className="text-xs text-lab-muted">{user.email || 'Sin correo'}</p>
        </section>

        <section className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-lab-text">Rol</span>
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

          <label className="flex items-center gap-2 text-sm text-lab-text">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Usuario activo
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-lab-text">Notas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Notas internas del soporte"
              className="w-full rounded-md border border-lab-border px-3 py-2 text-sm text-lab-text focus:border-lab-primary focus:outline-none"
            />
          </label>
        </section>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onSave({
                ...user,
                rol: selectedRole,
                role: selectedRole,
                sucursalId: selectedBranchId,
                sucursalNombre: selectedBranchName,
                activo: isActive,
                notas: notes,
              })
            }
            disabled={saving}
            className="rounded-md bg-lab-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            type="button"
            onClick={() => onDeactivate(user)}
            disabled={saving}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Procesando...' : 'Desactivar'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Drawer>
  )
}

export default UserEditDrawer
