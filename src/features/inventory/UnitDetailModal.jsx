import { useState } from 'react'
import { Badge, Card, Modal } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import CreateRequestModal from '../requests/CreateRequestModal'
import { formatNumber, formatUSD } from '../../utils/formatters'
import ExportUnitPdfButton from './ExportUnitPdfButton'

const statusVariant = {
  available: 'success',
  reserved: 'warning',
  maintenance: 'danger',
  demo: 'info',
}

const historyItems = [
  'Ingreso a inventario',
  'Inspeccion completada',
  'Disponible para cotizacion',
]

const normalizeStatus = (status) => {
  if (!status) return 'Sin status'
  return String(status).replaceAll('_', ' ')
}

function UnitDetailModal({
  unit,
  branch,
  isOpen,
  onClose,
  onAddToQuote,
  onCreateOpportunity,
  onShare,
}) {
  const { user, isFirebaseMode, isAuthorized } = useAuth()
  const [requestModalOpen, setRequestModalOpen] = useState(false)

  if (!isOpen || !unit) {
    return null
  }

  const isRequestEnabled = isFirebaseMode && isAuthorized && Boolean(user)

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${unit.brand} ${unit.model} ${unit.year}`}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-lab-border px-3 py-2 text-sm font-semibold text-lab-text"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => onShare?.(unit)}
              className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700"
            >
              Compartir ficha tecnica
            </button>
            <ExportUnitPdfButton unit={unit} />
            {isRequestEnabled && (
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"
              >
                Solicitar unidad
              </button>
            )}
            <button
              type="button"
              onClick={() => onCreateOpportunity?.(unit)}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
            >
              Crear oportunidad Salesforce
            </button>
            <button
              type="button"
              onClick={() => onAddToQuote?.(unit)}
              className="rounded-lg bg-lab-primary px-3 py-2 text-sm font-semibold text-white"
            >
              Agregar a cotizacion
            </button>
          </div>
        }
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[unit.status] ?? 'default'}>{normalizeStatus(unit.status)}</Badge>
          <Badge variant="info">{branch?.name ?? unit.branchId}</Badge>
          <Badge>ID {unit.id}</Badge>
        </div>

        <Card className="space-y-2 bg-slate-50">
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-lab-muted">Marca / Modelo</dt>
              <dd className="font-semibold text-lab-text">
                {unit.brand} {unit.model}
              </dd>
            </div>
            <div>
              <dt className="text-lab-muted">Anio</dt>
              <dd className="font-semibold text-lab-text">{unit.year}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Precio USD</dt>
              <dd className="font-semibold text-lab-text">{formatUSD(unit.priceUsd)}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Kilometraje</dt>
              <dd className="font-semibold text-lab-text">{formatNumber(unit.mileageKm)} km</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Configuracion</dt>
              <dd className="font-semibold text-lab-text">{unit.configuration}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Motor</dt>
              <dd className="font-semibold text-lab-text">{unit.engine}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Transmision</dt>
              <dd className="font-semibold text-lab-text">{unit.transmission}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Color</dt>
              <dd className="font-semibold text-lab-text">{unit.color || 'N/D'}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Dias en inventario</dt>
              <dd className="font-semibold text-lab-text">{formatNumber(unit.daysInInventory)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-lab-text">Galeria referencial</h4>
          <div className="grid gap-3 md:grid-cols-3">
            {['Exterior', 'Cabina', 'Ficha tecnica'].map((label) => (
              <div
                key={label}
                className="flex aspect-video items-center justify-center rounded-lab border border-dashed border-lab-border bg-slate-50 text-sm font-medium text-lab-muted"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-lab-text">Historial simulado</h4>
          <ul className="space-y-2">
            {historyItems.map((eventName) => (
              <li key={eventName} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-lab-text">
                {eventName}
              </li>
            ))}
          </ul>
        </div>
        </div>
      </Modal>
      <CreateRequestModal
        isOpen={requestModalOpen}
        unit={unit}
        onClose={() => setRequestModalOpen(false)}
        onCreated={() => setRequestModalOpen(false)}
      />
    </>
  )
}

export default UnitDetailModal
