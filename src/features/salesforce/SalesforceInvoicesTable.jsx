import { Card, EmptyState } from '../../components/common'
import { formatDate, formatUSD } from '../../utils/formatters'

const statusConfig = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  pagada: { label: 'Pagada', className: 'bg-emerald-100 text-emerald-700' },
  vencida: { label: 'Vencida', className: 'bg-rose-100 text-rose-700' },
}

function StatusPill({ status }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>
}

function SalesforceInvoicesTable({ invoices, branchesById }) {
  if (!invoices.length) {
    return <EmptyState title="Sin facturas" description="No hay facturas en el scope actual." />
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-lab-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-lab-muted">
            <tr>
              <th className="px-4 py-3">Factura</th>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Sucursal</th>
              <th className="px-4 py-3 text-right">Monto USD</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha emision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lab-border">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-lab-text">{invoice.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-lab-muted">{invoice.orderId}</td>
                <td className="px-4 py-3 text-lab-muted">{branchesById[invoice.branchId]?.name ?? invoice.branchId}</td>
                <td className="px-4 py-3 text-right font-semibold text-lab-text">{formatUSD(invoice.amountUsd)}</td>
                <td className="px-4 py-3"><StatusPill status={invoice.status} /></td>
                <td className="px-4 py-3 text-lab-muted">{formatDate(invoice.issuedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-lab-border px-4 py-3 text-sm text-lab-muted">
        {invoices.length} factura{invoices.length !== 1 ? 's' : ''}
      </div>
    </Card>
  )
}

export default SalesforceInvoicesTable
