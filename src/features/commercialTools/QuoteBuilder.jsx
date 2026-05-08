import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react'
import { Badge, Card, EmptyState } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import { dataService } from '../../services/dataService'
import {
  clearQuoteContext,
  createSimulatedOpportunity,
  finalizeQuote,
  getQuoteContext,
  saveQuoteDraft,
} from '../../services/quotesService'
import { calculateIVA, calculateSubtotal, calculateTotal } from '../../utils/calculations'
import { formatUSD } from '../../utils/formatters'
import QuoteClientForm from './QuoteClientForm'
import QuoteConfirmModal from './QuoteConfirmModal'
import QuoteLineItemsForm from './QuoteLineItemsForm'
import QuoteUnitSelector from './QuoteUnitSelector'

const initialClient = {
  companyName: '',
  rfc: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
}

const initialLineItems = {
  listPriceUsd: 0,
  discountPercent: 0,
  accessoriesUsd: 0,
  servicesUsd: 0,
  notes: '',
}

const stepMeta = [
  { id: 1, label: 'Unidad' },
  { id: 2, label: 'Cliente' },
  { id: 3, label: 'Condiciones' },
]

function QuoteBuilder() {
  const { user } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [units, setUnits] = useState([])
  const [branchesById, setBranchesById] = useState({})
  const [step, setStep] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [client, setClient] = useState(initialClient)
  const [lineItems, setLineItems] = useState(initialLineItems)
  const [hasInventoryContext, setHasInventoryContext] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmedResult, setConfirmedResult] = useState(null)

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [inventory, branches] = await Promise.all([
          dataService.getInventory(),
          dataService.getBranches(),
        ])

        if (!isActive) return

        const safeUnits = Array.isArray(inventory) ? inventory : []
        const safeBranches = Array.isArray(branches) ? branches : []

        setUnits(safeUnits)
        setBranchesById(Object.fromEntries(safeBranches.map((branch) => [branch.id, branch])))

        const context = getQuoteContext()
        if (context?.unitId && safeUnits.some((unit) => unit.id === context.unitId)) {
          setSelectedUnitId(context.unitId)
          setHasInventoryContext(true)
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError?.message ?? 'No fue posible cargar datos para el cotizador.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId, units]
  )

  const totals = useMemo(() => {
    const accessoriesTotal = (Number(lineItems.accessoriesUsd) || 0) + (Number(lineItems.servicesUsd) || 0)
    const subtotal = calculateSubtotal({
      price: lineItems.listPriceUsd,
      discount: lineItems.discountPercent,
      accessories: accessoriesTotal,
    })
    const iva = calculateIVA(subtotal)
    const total = calculateTotal({
      price: lineItems.listPriceUsd,
      discount: lineItems.discountPercent,
      accessories: accessoriesTotal,
    })

    return { subtotal, iva, total }
  }, [lineItems])

  const canConfirm = Boolean(selectedUnitId) && Boolean(client.companyName) && Number(lineItems.listPriceUsd) > 0

  const buildDraft = useCallback(() => ({
    source: 'quoteBuilder',
    userId: user?.id,
    branchId: user?.branchId,
    selectedUnitId,
    unitSnapshot: selectedUnit
      ? {
          id: selectedUnit.id,
          brand: selectedUnit.brand,
          model: selectedUnit.model,
          year: selectedUnit.year,
          priceUsd: selectedUnit.priceUsd,
          branchId: selectedUnit.branchId,
        }
      : null,
    client,
    lineItems,
    totals,
    savedAt: new Date().toISOString(),
  }), [user, selectedUnitId, selectedUnit, client, lineItems, totals])

  const updateClient = useCallback((field, value) => {
    setClient((current) => ({ ...current, [field]: value }))
  }, [])

  const updateLineItems = useCallback((field, value) => {
    setLineItems((current) => ({ ...current, [field]: value }))
  }, [])

  const handleSaveDraft = () => {
    saveQuoteDraft(buildDraft())
    toast.success('Borrador de cotizacion guardado')
  }

  const handleClearContext = () => {
    clearQuoteContext()
    setHasInventoryContext(false)
    toast.info('Contexto de inventario limpiado')
  }

  const handleConfirm = () => {
    const finalQuote = finalizeQuote(buildDraft())
    const opportunity = createSimulatedOpportunity({
      quote: finalQuote,
      userId: user?.id,
      branchId: user?.branchId,
    })
    setConfirmedResult({ quote: finalQuote, opportunity })
    setShowConfirmModal(false)
  }

  const handleReset = () => {
    setConfirmedResult(null)
    setStep(1)
    setSelectedUnitId('')
    setClient(initialClient)
    setLineItems(initialLineItems)
    setHasInventoryContext(false)
  }

  const canGoNext = step < 3
  const canGoPrevious = step > 1

  if (loading) {
    return (
      <Card className="space-y-2">
        <h3 className="text-lg font-semibold text-lab-text">Cotizador</h3>
        <p className="text-sm text-lab-muted">Cargando estructura del cotizador...</p>
      </Card>
    )
  }

  if (error) {
    return <EmptyState title="No pudimos cargar el cotizador" description={error} icon={AlertCircle} />
  }

  if (confirmedResult) {
    const { quote, opportunity } = confirmedResult
    const unitLabel = quote.unitSnapshot
      ? `${quote.unitSnapshot.brand} ${quote.unitSnapshot.model} ${quote.unitSnapshot.year}`
      : 'Sin unidad'

    return (
      <section className="space-y-4">
        <Card className="space-y-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-green-600" />
            <div className="space-y-0.5">
              <h3 className="text-xl font-semibold text-lab-text">Cotizacion confirmada</h3>
              <p className="text-sm text-lab-muted">
                Se genero el folio y se creo la oportunidad simulada en Salesforce.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-lab-border bg-lab-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Folio</p>
              <p className="mt-1 text-2xl font-bold text-lab-primary">{quote.folio}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Oportunidad Salesforce</p>
              <p className="mt-1 font-mono text-sm font-bold text-lab-text">{opportunity.id}</p>
              <p className="mt-0.5 text-xs text-lab-muted">Etapa: Cotizacion · Prob. 45%</p>
            </div>
          </div>

          <dl className="space-y-2 rounded-lg border border-lab-border p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-lab-muted">Unidad</dt>
              <dd className="font-semibold text-lab-text">{unitLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-lab-muted">Cliente</dt>
              <dd className="font-semibold text-lab-text">{quote.client?.companyName}</dd>
            </div>
            {quote.client?.contactName && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-lab-muted">Contacto</dt>
                <dd className="text-lab-text">{quote.client.contactName}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-lab-border pt-2">
              <dt className="font-semibold text-lab-muted">Total USD</dt>
              <dd className="text-base font-bold text-lab-text">{formatUSD(quote.totals?.total)}</dd>
            </div>
          </dl>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text"
            >
              <RotateCcw className="size-4" />
              Iniciar nueva cotizacion
            </button>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-lab-text">Cotizador base</h3>
            <p className="text-sm text-lab-muted">
              Flujo inicial para preparar propuestas desde Inventario hacia Salesforce.
            </p>
          </div>
          {hasInventoryContext && (
            <Badge variant="demo">Unidad precargada desde Inventario</Badge>
          )}
        </div>

        <ol className="grid gap-2 md:grid-cols-3">
          {stepMeta.map((stepItem) => (
            <li
              key={stepItem.id}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                step === stepItem.id
                  ? 'border-lab-primary bg-lab-primary/10 text-lab-primary'
                  : 'border-lab-border bg-white text-lab-muted'
              }`}
            >
              {stepItem.id}. {stepItem.label}
            </li>
          ))}
        </ol>
      </Card>

      {step === 1 && (
        <QuoteUnitSelector
          units={units}
          branchesById={branchesById}
          selectedUnitId={selectedUnitId}
          onChange={setSelectedUnitId}
        />
      )}

      {step === 2 && <QuoteClientForm client={client} onChange={updateClient} />}

      {step === 3 && (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <QuoteLineItemsForm
            values={lineItems}
            onChange={updateLineItems}
            selectedUnit={selectedUnit}
          />

          <Card className="space-y-3">
            <h4 className="text-base font-semibold text-lab-text">Resumen preliminar</h4>
            <div className="space-y-2 text-sm">
              <p className="text-lab-muted">Unidad</p>
              <p className="font-semibold text-lab-text">
                {selectedUnit ? `${selectedUnit.brand} ${selectedUnit.model} ${selectedUnit.year}` : 'Sin unidad'}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-lab-muted">Cliente</p>
              <p className="font-semibold text-lab-text">{client.companyName || 'Sin capturar'}</p>
              <p className="text-lab-muted">{client.contactName || 'Sin contacto'}</p>
            </div>
            <dl className="space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-lab-muted">Subtotal</dt>
                <dd className="font-semibold text-lab-text">{formatUSD(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-lab-muted">IVA</dt>
                <dd className="font-semibold text-lab-text">{formatUSD(totals.iva)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
                <dt className="text-lab-muted">Total</dt>
                <dd className="text-base font-bold text-lab-text">{formatUSD(totals.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={!canGoPrevious}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(3, current + 1))}
            disabled={!canGoNext}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasInventoryContext && (
            <button
              type="button"
              onClick={handleClearContext}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
            >
              Limpiar contexto de inventario
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text"
          >
            Guardar borrador
          </button>
          {step === 3 && (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={!canConfirm}
              title={!canConfirm ? 'Selecciona unidad, captura cliente y precio para confirmar' : undefined}
              className="inline-flex items-center gap-2 rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              Confirmar cotizacion
            </button>
          )}
        </div>
      </Card>

      <QuoteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        draft={buildDraft()}
      />
    </section>
  )
}

export default QuoteBuilder
