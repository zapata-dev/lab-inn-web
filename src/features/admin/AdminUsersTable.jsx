import { Badge, Card, EmptyState } from '../../components/common'

const roleVariant = {
  admin: 'info',
  direccion: 'success',
  gerente: 'success',
  bdcLab: 'info',
  bdcSucursal: 'info',
  ejecutivo: 'demo',
}

function AdminUsersTable({ users, branchesById }) {
  if (!users?.length) {
    return <EmptyState title="Sin usuarios" description="No hay usuarios demo disponibles." />
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-lab-border bg-slate-50 text-xs font-semibold uppercase tracking-wide text-lab-muted">
            <tr>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">Puesto</th>
              <th className="hidden px-4 py-3 text-left lg:table-cell">Sucursal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lab-border">
            {users.map((u) => {
              const branch = branchesById[u.branchId]
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-lab-primary/10 text-xs font-bold text-lab-primary">
                        {u.avatar}
                      </span>
                      <div>
                        <p className="font-semibold text-lab-text">{u.name}</p>
                        <p className="text-xs text-lab-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[u.role] ?? 'demo'}>{u.roleLabel}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-lab-muted md:table-cell">{u.position}</td>
                  <td className="hidden px-4 py-3 text-lab-muted lg:table-cell">
                    {branch?.name ?? u.branchName ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default AdminUsersTable
