import { Card } from '../../../components/common'
import UserStatusBadge from './UserStatusBadge'

function UsersList({ users, loading, error, onSelectUser }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-lab-text">Usuarios autorizados</h2>
        <p className="text-sm text-lab-muted">Administra rol, sucursal y estado activo de usuarios LAB.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      {loading ? <p className="text-sm text-lab-muted">Cargando usuarios...</p> : null}

      {!loading && users.length === 0 ? (
        <p className="rounded-lg border border-dashed border-lab-border bg-slate-50 px-4 py-5 text-sm text-lab-muted">
          No hay usuarios autorizados para mostrar.
        </p>
      ) : null}

      {!loading && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lab-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-lab-muted">
                <th className="px-2 py-2 font-semibold">Usuario</th>
                <th className="px-2 py-2 font-semibold">Rol</th>
                <th className="px-2 py-2 font-semibold">Sucursal</th>
                <th className="px-2 py-2 font-semibold">Activo</th>
                <th className="px-2 py-2 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-2 py-3">
                    <p className="font-medium text-lab-text">{user.nombre || 'Sin nombre'}</p>
                    <p className="text-xs text-lab-muted">{user.email || 'Sin correo'}</p>
                  </td>
                  <td className="px-2 py-3 text-lab-text">{user.rol || 'Sin rol'}</td>
                  <td className="px-2 py-3 text-lab-text">{user.sucursalNombre || user.sucursalId || 'Sin sucursal'}</td>
                  <td className="px-2 py-3">
                    <UserStatusBadge active={user.activo} />
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => onSelectUser(user)}
                      className="rounded-md border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:border-lab-primary hover:text-lab-primary"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  )
}

export default UsersList
