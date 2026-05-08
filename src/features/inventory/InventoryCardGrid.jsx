import { Badge, Card, EmptyState } from '../../components/common'
import { formatNumber, formatUSD } from '../../utils/formatters'

const statusVariant = {
  available: 'success',
  reserved: 'warning',
  maintenance: 'danger',
  demo: 'info',
}

const normalizeStatus = (status) => {
  if (!status) return 'Sin status'
  return String(status).replaceAll('_', ' ')
}

function InventoryCardGrid({ units = [], branchesById = {}, onSelectUnit }) {
  if (!units.length) {
    return (
      <EmptyState
        title="Sin unidades para mostrar"
        description="No encontramos unidades con los filtros actuales."
      />
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {units.map((unit) => (
        <Card key={unit.id} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-lab-text">
                {unit.brand} {unit.model}
              </h3>
              <p className="text-xs text-lab-muted">
                {unit.year} | {unit.id}
              </p>
            </div>
            <Badge variant={statusVariant[unit.status] ?? 'default'}>{normalizeStatus(unit.status)}</Badge>
          </div>

          <dl className="grid gap-2 text-sm text-lab-muted">
            <div className="flex items-center justify-between gap-2">
              <dt>Sucursal</dt>
              <dd className="font-medium text-lab-text">{branchesById[unit.branchId]?.name ?? unit.branchId}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Configuracion</dt>
              <dd className="text-right font-medium text-lab-text">{unit.configuration}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Motor / Transmision</dt>
              <dd className="text-right font-medium text-lab-text">
                {unit.engine} / {unit.transmission}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Kilometraje</dt>
              <dd className="font-medium text-lab-text">{formatNumber(unit.mileageKm)} km</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Dias inventario</dt>
              <dd className="font-medium text-lab-text">{formatNumber(unit.daysInInventory)}</dd>
            </div>
          </dl>

          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-lab-muted">Precio USD</p>
            <p className="text-lg font-bold text-lab-text">{formatUSD(unit.priceUsd)}</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onSelectUnit?.(unit)}
              className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
            >
              Ver detalle
            </button>
            <p className="text-xs text-lab-muted">Abrir detalle para cotizar y crear oportunidad simulada.</p>
          </div>
        </Card>
      ))}
    </section>
  )
}

export default InventoryCardGrid
