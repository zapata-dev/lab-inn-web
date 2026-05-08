import { useState } from 'react'
import { Card, EmptyState, FilterBar, SearchBar } from '../../components/common'
import { formatDate } from '../../utils/formatters'

const priorityConfig = {
  baja: { label: 'Baja', className: 'bg-slate-100 text-slate-700' },
  media: { label: 'Media', className: 'bg-amber-100 text-amber-700' },
  alta: { label: 'Alta', className: 'bg-rose-100 text-rose-700' },
  critica: { label: 'Critica', className: 'bg-rose-200 font-bold text-rose-900' },
}

const statusConfig = {
  abierto: { label: 'Abierto', className: 'bg-amber-100 text-amber-700' },
  en_proceso: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  resuelto: { label: 'Resuelto', className: 'bg-emerald-100 text-emerald-700' },
}

const categoryColors = {
  salesforce: 'bg-blue-100 text-blue-700',
  chatbots: 'bg-purple-100 text-purple-700',
  capacitacion: 'bg-emerald-100 text-emerald-700',
  dashboard: 'bg-indigo-100 text-indigo-700',
  reportes: 'bg-amber-100 text-amber-700',
  integraciones: 'bg-orange-100 text-orange-700',
  seguridad: 'bg-rose-100 text-rose-700',
  soporte: 'bg-slate-100 text-slate-700',
  faq: 'bg-slate-100 text-slate-700',
}

function Pill({ label, className }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

const STATUSES = ['abierto', 'en_proceso', 'resuelto']

function SupportTicketsTable({ tickets, usersById, branchesById, ticketUpdates, onUpdateStatus }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = tickets.filter((ticket) => {
    const effectiveStatus = ticketUpdates[ticket.id]?.status ?? ticket.status
    if (statusFilter && effectiveStatus !== statusFilter) return false
    if (search && !ticket.title.toLowerCase().includes(search.toLowerCase().trim())) return false
    return true
  })

  const handleSearch = (e) => { setSearch(e.target.value); setExpandedId(null) }
  const handleStatus = (e) => { setStatusFilter(e.target.value); setExpandedId(null) }
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <section className="space-y-4">
      <FilterBar title="Tickets">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Buscar ticket..."
          className="w-full max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={handleStatus}
          className="rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{statusConfig[s]?.label ?? s}</option>
          ))}
        </select>
        <span className="self-center text-xs text-lab-muted">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="Sin tickets" description="No hay tickets que coincidan con los filtros." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-lab-border">
            {filtered.map((ticket) => {
              const effectiveStatus = ticketUpdates[ticket.id]?.status ?? ticket.status
              const isExpanded = expandedId === ticket.id
              const statusCfg = statusConfig[effectiveStatus] ?? { label: effectiveStatus, className: 'bg-slate-100 text-slate-700' }
              const priorityCfg = priorityConfig[ticket.priority] ?? { label: ticket.priority, className: 'bg-slate-100 text-slate-700' }
              const catClass = categoryColors[ticket.category] ?? 'bg-slate-100 text-slate-700'
              const userName = usersById[ticket.userId]?.name ?? ticket.userId
              const branchName = branchesById[ticket.branchId]?.name ?? ticket.branchId

              return (
                <div key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(ticket.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium text-lab-text">{ticket.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-lab-muted">{userName} · {branchName}</span>
                        <Pill label={ticket.category} className={catClass} />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Pill label={priorityCfg.label} className={priorityCfg.className} />
                      <Pill label={statusCfg.label} className={statusCfg.className} />
                      <span className="text-xs text-lab-muted">{formatDate(ticket.createdAt)}</span>
                      <span className="text-xs text-lab-muted">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-lab-border bg-slate-50 px-4 py-3">
                      <p className="text-sm text-lab-text">{ticket.description}</p>
                      {effectiveStatus !== 'resuelto' && (
                        <div className="flex gap-2">
                          {effectiveStatus === 'abierto' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(ticket.id, 'en_proceso')}
                              className="rounded-lab border border-blue-400 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Tomar ticket
                            </button>
                          )}
                          {effectiveStatus === 'en_proceso' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(ticket.id, 'resuelto')}
                              className="rounded-lab border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Marcar resuelto
                            </button>
                          )}
                        </div>
                      )}
                      {effectiveStatus === 'resuelto' && ticketUpdates[ticket.id] && (
                        <p className="text-xs font-semibold text-emerald-600">
                          Resuelto · {formatDate(ticketUpdates[ticket.id].updatedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </section>
  )
}

export default SupportTicketsTable
