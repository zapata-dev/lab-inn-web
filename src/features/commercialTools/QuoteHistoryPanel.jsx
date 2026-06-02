import { FileText, Link2, TrendingUp } from 'lucide-react'
import { Card, EmptyState } from '../../components/common'
import { getQuotes, getSimulatedOpportunities } from '../../services/quotesService'
import { formatDate, formatUSD } from '../../utils/formatters'

const stageConfig = {
  prospecto: { label: 'Prospecto', className: 'bg-slate-100 text-slate-700' },
  cotizacion: { label: 'Cotización', className: 'bg-blue-100 text-blue-700' },
  negociacion: { label: 'Negociación', className: 'bg-amber-100 text-amber-700' },
  ganada: { label: 'Ganada', className: 'bg-emerald-100 text-emerald-700' },
  perdida: { label: 'Perdida', className: 'bg-rose-100 text-rose-700' },
}

function StagePill({ stage }) {
  const config = stageConfig[stage] ?? stageConfig.prospecto
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}

function QuoteCard({ quote, opportunity }) {
  const unitLabel = quote.unitSnapshot
    ? `${quote.unitSnapshot.brand} ${quote.unitSnapshot.model} ${quote.unitSnapshot.year}`
    : 'Sin unidad'

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="font-mono text-lg font-bold text-lab-primary">{quote.folio}</p>
          <p className="text-sm font-semibold text-lab-text">{quote.client?.companyName ?? '-'}</p>
          {quote.client?.contactName && (
            <p className="text-xs text-lab-muted">{quote.client.contactName}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Confirmada
        </span>
      </div>

      <dl className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-lab-muted">Unidad</dt>
          <dd className="text-right font-medium text-lab-text">{unitLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-lab-muted">Total USD</dt>
          <dd className="font-bold text-lab-text">{formatUSD(quote.totals?.total)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-lab-muted">Confirmada</dt>
          <dd className="text-lab-text">{formatDate(quote.confirmedAt)}</dd>
        </div>
      </dl>

      {opportunity ? (
        <div className="space-y-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <Link2 className="size-3.5" />
            Oportunidad Salesforce vinculada
          </div>
          <p className="break-all font-mono text-xs text-lab-text">{opportunity.id}</p>
          <div className="flex items-center gap-2">
            <StagePill stage={opportunity.stage} />
            <span className="text-xs text-lab-muted">Prob. {opportunity.probability}%</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-lab-border px-3 py-2 text-xs text-lab-muted">
          Sin oportunidad vinculada
        </div>
      )}
    </Card>
  )
}

function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="rounded-lg bg-lab-primary/10 p-3 text-lab-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-lab-text">{value}</p>
        <p className="text-sm font-medium text-lab-text">{label}</p>
        {sub && <p className="text-xs text-lab-muted">{sub}</p>}
      </div>
    </Card>
  )
}

function QuoteHistoryPanel({ onGoToCotizador }) {
  const quotes = getQuotes()
  const opportunities = getSimulatedOpportunities()

  const opportunitiesByFolio = Object.fromEntries(
    opportunities.map((opp) => [opp.sourceQuoteId, opp])
  )

  const totalAmount = quotes.reduce((sum, quote) => sum + (quote.totals?.total ?? 0), 0)

  if (!quotes.length) {
    return (
      <EmptyState
        icon={FileText}
        title="Sin cotizaciones guardadas"
        description="Confirma una cotización desde el Cotizador para verla aquí con su oportunidad Salesforce vinculada."
        actionLabel="Ir al Cotizador"
        onAction={onGoToCotizador}
      />
    )
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={FileText}
          label="Cotizaciones confirmadas"
          value={quotes.length}
          sub="En este período de sesión"
        />
        <KpiCard
          icon={Link2}
          label="Oportunidades SF simuladas"
          value={opportunities.length}
          sub="Vinculadas al cotizador"
        />
        <KpiCard
          icon={TrendingUp}
          label="Valor total pipeline"
          value={formatUSD(totalAmount)}
          sub="Suma de cotizaciones confirmadas"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.folio}
            quote={quote}
            opportunity={opportunitiesByFolio[quote.folio] ?? null}
          />
        ))}
      </div>
    </section>
  )
}

export default QuoteHistoryPanel
