import { CheckCircle2, Link2 } from 'lucide-react'
import { Modal } from '../../components/common'
import { formatUSD } from '../../utils/formatters'

function QuoteConfirmModal({ isOpen, onClose, onConfirm, draft }) {
  if (!draft) return null

  const unitLabel = draft.unitSnapshot
    ? `${draft.unitSnapshot.brand} ${draft.unitSnapshot.model} ${draft.unitSnapshot.year}`
    : 'Sin unidad seleccionada'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar cotización">
      <div className="space-y-4">
        <p className="text-sm text-lab-muted">
          Al confirmar se generará un folio oficial y se creará una oportunidad simulada en Salesforce.
          Esta acción no puede deshacerse.
        </p>

        <dl className="space-y-2 rounded-lg border border-lab-border bg-lab-surface p-4 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="text-lab-muted">Unidad</dt>
            <dd className="text-right font-semibold text-lab-text">{unitLabel}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-lab-muted">Cliente</dt>
            <dd className="text-right font-semibold text-lab-text">
              {draft.client?.companyName || 'Sin capturar'}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-lab-muted">Contacto</dt>
            <dd className="text-right text-lab-text">
              {draft.client?.contactName || '-'}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-2 border-t border-lab-border pt-2">
            <dt className="text-lab-muted">Subtotal</dt>
            <dd className="font-semibold text-lab-text">{formatUSD(draft.totals?.subtotal)}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-lab-muted">IVA</dt>
            <dd className="font-semibold text-lab-text">{formatUSD(draft.totals?.iva)}</dd>
          </div>
          <div className="flex items-start justify-between gap-2 border-t border-lab-border pt-2">
            <dt className="font-semibold text-lab-muted">Total</dt>
            <dd className="text-base font-bold text-lab-text">{formatUSD(draft.totals?.total)}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <Link2 className="size-3.5 shrink-0" />
          Se creará una oportunidad en etapa <strong className="mx-1">Cotización</strong> vinculada al folio generado.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <CheckCircle2 className="size-4" />
            Confirmar y crear oportunidad
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default QuoteConfirmModal
