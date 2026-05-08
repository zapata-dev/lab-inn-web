import { useState } from 'react'
import { Card, EmptyState, FilterBar, SearchBar } from '../../components/common'
import { formatDate, formatUSD } from '../../utils/formatters'

const PAGE_SIZE = 15

const leadStageConfig = {
  nuevo: { label: 'Nuevo', className: 'bg-slate-100 text-slate-700' },
  contactado: { label: 'Contactado', className: 'bg-blue-100 text-blue-700' },
  calificado: { label: 'Calificado', className: 'bg-emerald-100 text-emerald-700' },
  descartado: { label: 'Descartado', className: 'bg-rose-100 text-rose-700' },
}

const priorityConfig = {
  alta: 'bg-rose-100 text-rose-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-slate-100 text-slate-700',
}

function Pill({ value, config }) {
  const cfg = config[value]
  if (!cfg) return <span className="text-lab-muted">{value ?? '-'}</span>
  const className = typeof cfg === 'string' ? cfg : cfg.className
  const label = typeof cfg === 'string' ? value : cfg.label
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

const LEAD_STAGES = ['nuevo', 'contactado', 'calificado', 'descartado']
const PRIORITIES = ['alta', 'media', 'baja']

function SalesforceLeadsTable({ leads }) {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = leads.filter((lead) => {
    if (stageFilter && lead.stage !== stageFilter) return false
    if (priorityFilter && lead.priority !== priorityFilter) return false
    if (search) {
      const hay = `${lead.companyName} ${lead.contactName}`.toLowerCase()
      if (!hay.includes(search.toLowerCase().trim())) return false
    }
    return true
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleStage = (e) => {
    setStageFilter(e.target.value)
    setPage(1)
  }

  const handlePriority = (e) => {
    setPriorityFilter(e.target.value)
    setPage(1)
  }

  return (
    <section className="space-y-4">
      <FilterBar title="Leads">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Empresa o contacto..."
          className="w-full max-w-xs"
        />
        <select
          value={stageFilter}
          onChange={handleStage}
          className="rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
        >
          <option value="">Todas las etapas</option>
          {LEAD_STAGES.map((s) => (
            <option key={s} value={s}>{leadStageConfig[s]?.label ?? s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={handlePriority}
          className="rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
        >
          <option value="">Todas las prioridades</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="Sin leads" description="No hay leads que coincidan con los filtros actuales." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-lab-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-lab-muted">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3 text-right">Valor est.</th>
                  <th className="px-4 py-3">Ultima actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-border">
                {paginated.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-lab-text">{lead.companyName}</td>
                    <td className="px-4 py-3 text-lab-muted">{lead.contactName}</td>
                    <td className="px-4 py-3 text-lab-muted">{lead.channel}</td>
                    <td className="px-4 py-3">
                      <Pill value={lead.stage} config={leadStageConfig} />
                    </td>
                    <td className="px-4 py-3">
                      <Pill value={lead.priority} config={priorityConfig} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-lab-text">
                      {formatUSD(lead.estimatedValueUsd)}
                    </td>
                    <td className="px-4 py-3 text-lab-muted">{formatDate(lead.lastActivityAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-lab-border px-4 py-3 text-sm text-lab-muted">
            <span>{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded border border-lab-border px-2.5 py-1 font-semibold disabled:opacity-40"
              >
                ‹
              </button>
              <span className="px-2 py-1">{safePage} / {pageCount}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                className="rounded border border-lab-border px-2.5 py-1 font-semibold disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </Card>
      )}
    </section>
  )
}

export default SalesforceLeadsTable
