import { Card, EmptyState } from '../../components/common'
import { formatDate, formatUSD } from '../../utils/formatters'

const statusConfig = {
  en_proceso: { label: 'En proceso', className: 'bg-amber-100 text-amber-700' },
  aprobado: { label: 'Aprobado', className: 'bg-blue-100 text-blue-700' },
  facturado: { label: 'Facturado', className: 'bg-emerald-100 text-emerald-700' },
}

function StatusPill({ status }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>
}

function SalesforceOrdersTable({ orders, branchesById }) {
  if (!orders.length) {
    return <EmptyState title="Sin pedidos" description="No hay pedidos en el scope actual." />
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-lab-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-lab-muted">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Oportunidad</th>
              <th className="px-4 py-3">Sucursal</th>
              <th className="px-4 py-3 text-right">Monto USD</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lab-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-lab-text">{order.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-lab-muted">{order.opportunityId}</td>
                <td className="px-4 py-3 text-lab-muted">{branchesById[order.branchId]?.name ?? order.branchId}</td>
                <td className="px-4 py-3 text-right font-semibold text-lab-text">{formatUSD(order.amountUsd)}</td>
                <td className="px-4 py-3"><StatusPill status={order.status} /></td>
                <td className="px-4 py-3 text-lab-muted">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-lab-border px-4 py-3 text-sm text-lab-muted">
        {orders.length} pedido{orders.length !== 1 ? 's' : ''}
      </div>
    </Card>
  )
}

export default SalesforceOrdersTable
