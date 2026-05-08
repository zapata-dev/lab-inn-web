import { useEffect, useMemo } from 'react'
import { Card } from '../../components/common'
import { calculateIVA, calculateSubtotal, calculateTotal } from '../../utils/calculations'
import { formatUSD } from '../../utils/formatters'

function QuoteLineItemsForm({ values, onChange, selectedUnit }) {
  useEffect(() => {
    if (!selectedUnit) return
    onChange?.('listPriceUsd', selectedUnit.priceUsd ?? 0)
  }, [onChange, selectedUnit?.id])

  const accessoriesTotal = useMemo(
    () => (Number(values.accessoriesUsd) || 0) + (Number(values.servicesUsd) || 0),
    [values.accessoriesUsd, values.servicesUsd]
  )

  const subtotal = useMemo(
    () =>
      calculateSubtotal({
        price: values.listPriceUsd,
        discount: values.discountPercent,
        accessories: accessoriesTotal,
      }),
    [accessoriesTotal, values.discountPercent, values.listPriceUsd]
  )

  const iva = useMemo(() => calculateIVA(subtotal), [subtotal])

  const total = useMemo(
    () =>
      calculateTotal({
        price: values.listPriceUsd,
        discount: values.discountPercent,
        accessories: accessoriesTotal,
      }),
    [accessoriesTotal, values.discountPercent, values.listPriceUsd]
  )

  const setField = (field) => (event) => onChange?.(field, event.target.value)

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-lab-text">3. Condiciones comerciales</h3>
        <p className="text-sm text-lab-muted">Define precio, descuento y adicionales para la propuesta.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Precio lista USD</span>
          <input
            type="number"
            min="0"
            value={values.listPriceUsd}
            onChange={setField('listPriceUsd')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Descuento %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={values.discountPercent}
            onChange={setField('discountPercent')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Accesorios USD</span>
          <input
            type="number"
            min="0"
            value={values.accessoriesUsd}
            onChange={setField('accessoriesUsd')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Servicios USD</span>
          <input
            type="number"
            min="0"
            value={values.servicesUsd}
            onChange={setField('servicesUsd')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Notas comerciales</span>
          <textarea
            value={values.notes}
            onChange={setField('notes')}
            rows={3}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
            placeholder="Condiciones especiales, tiempos de entrega, observaciones..."
          />
        </label>
      </div>

      <div className="rounded-lab border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-lab-text">Preview preliminar</h4>
        <dl className="mt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2 text-lab-muted">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-lab-text">{formatUSD(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 text-lab-muted">
            <dt>IVA (16%)</dt>
            <dd className="font-semibold text-lab-text">{formatUSD(iva)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2 text-lab-muted">
            <dt>Total</dt>
            <dd className="text-base font-bold text-lab-text">{formatUSD(total)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}

export default QuoteLineItemsForm
