import { useMemo, useState } from 'react'
import { Card, EmptyState, FilterBar } from '../../components/common'
import { formatDate, formatUSD } from '../../utils/formatters'

const stageConfig = {
  prospecto: { label: 'Prospecto', className: 'bg-slate-100 text-slate-700' },
  cotizacion: { label: 'Cotizacion', className: 'bg-blue-100 text-blue-700' },
  negociacion: { label: 'Negociacion', className: 'bg-amber-100 text-amber-700' },
  ganada: { label: 'Ganada', className: 'bg-emerald-100 text-emerald-700' },
  perdida: { label: 'Perdida', className: 'bg-rose-100 text-rose-700' },
}

const STAGES = ['prospecto', 'cotizacion', 'negociacion', 'ganada', 'perdida']
const PAGE_SIZE = 15

function StagePill({ stage }) {
  const cfg = stageConfig[stage] ?? stageConfig.prospecto
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>
}

function SourceBadge({ source }) {
  if (source === 'cotizador') {
    return <span className="rounded-full bg-lab-primary/10 px-2 py-0.5 text-xs font-semibold text-lab-primary">Cotizador</span>
  }
  if (source === 'inventario') {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Inventario</span>
  }
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">CRM</span>
}

function normalizeOpp(opp, leadsById, inventoryById, source) {
  const lead = leadsById[opp.leadId]
  const unit = inventoryById[opp.unitId]
  return {
    id: opp.id,
    company: opp.companyName ?? lead?.companyName ?? '-',
    contactName: opp.contactName ?? lead?.contactName ?? '-',
    unitLabel: unit
      ? `${unit.brand} ${unit.model} ${unit.year}`
      : opp.sourceQuoteId ?? opp.unitId ?? '-',
    stage: opp.stage,
    probability: opp.probability,
    amountUsd: opp.amountUsd,
    closeDate: opp.expectedCloseDate ?? opp.closedAt ?? null,
    source,
    folio: opp.sourceQuoteId ?? null,
    isSimulated: source !== 'crm',
  }
}

function SalesforceOpportunitiesTable({ opportunities, simulatedOpps, leadsById, inventoryById, onRowClick }) {
  const [stageFilter, setStageFilter] = useState('')
  const [page, setPage] = useState(1)

  const normalized = useMemo(() => {
    const seed = opportunities.map((o) => normalizeOpp(o, leadsById, inventoryById, 'crm'))
    const simFromCotizador = simulatedOpps
      .filter((o) => o.sourceQuoteId)
      .map((o) => normalizeOpp(o, leadsById, inventoryById, 'cotizador'))
    const simFromInventory = simulatedOpps
      .filter((o) => !o.sourceQuoteId)
      .map((o) => normalizeOpp(o, leadsById, inventoryById, 'inventario'))
    return [...seed, ...simFromCotizador, ...simFromInventory]
  }, [opportunities, simulatedOpps, leadsById, inventoryById])

  const filtered = stageFilter
    ? normalized.filter((o) => o.stage === stageFilter)
    : normalized

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleStage = (e) => {
    setStageFilter(e.target.value)
    setPage(1)
  }

  return (
    <section className="space-y-4">
      <FilterBar title="Oportunidades">
        <select
          value={stageFilter}
          onChange={handleStage}
          className="rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
        >
          <option value="">Todas las etapas</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{stageConfig[s]?.label ?? s}</option>
          ))}
        </select>
        <span className="self-center text-xs text-lab-muted">
          {normalized.length} total · {simulatedOpps.length} simuladas
        </span>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState
          title="Sin oportunidades"
          description="No hay oportunidades que coincidan con los filtros actuales."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-lab-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-lab-muted">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Unidad / Ref</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3 text-right">Prob.</th>
                  <th className="px-4 py-3 text-right">Monto USD</th>
                  <th className="px-4 py-3">Cierre est.</th>
                  <th className="px-4 py-3">Fuente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-border">
                {paginated.map((opp) => (
                  <tr
                    key={opp.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => onRowClick?.(opp)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-lab-text">{opp.company}</p>
                      {opp.folio && (
                        <p className="font-mono text-xs text-lab-muted">{opp.folio}</p>
                      )}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-lab-muted">{opp.unitLabel}</td>
                    <td className="px-4 py-3"><StagePill stage={opp.stage} /></td>
                    <td className="px-4 py-3 text-right text-lab-muted">{opp.probability}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-lab-text">{formatUSD(opp.amountUsd)}</td>
                    <td className="px-4 py-3 text-lab-muted">{formatDate(opp.closeDate) ?? '-'}</td>
                    <td className="px-4 py-3"><SourceBadge source={opp.source} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-lab-border px-4 py-3 text-sm text-lab-muted">
            <span>{filtered.length} oportunidad{filtered.length !== 1 ? 'es' : ''}</span>
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

export default SalesforceOpportunitiesTable
