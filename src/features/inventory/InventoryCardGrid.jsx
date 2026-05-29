import { Badge, Card, EmptyState } from '../../components/common'
import { formatNumber, formatUSD } from '../../utils/formatters'
import ExportUnitPdfButton from './ExportUnitPdfButton'

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

function getBranchId(unit) {
  return String(unit?.branchId || unit?.sucursalId || '').trim()
}

function getBranchLabel(unit, branchesById) {
  const branchId = getBranchId(unit)
  const label =
    branchesById[branchId]?.name ?? unit?.branchName ?? unit?.sucursalNombre ?? branchId ?? ''
  return label || 'Sin sucursal'
}

function getBrand(unit) {
  return unit?.brand || unit?.marca || 'N/D'
}

function getModel(unit) {
  return unit?.model || unit?.modelo || 'N/D'
}

function getYear(unit) {
  return unit?.year || unit?.anio || 'N/D'
}

function getVin(unit) {
  return unit?.vin || unit?.id || 'N/D'
}

function getConfiguration(unit) {
  return unit?.configuration || unit?.configuracion || 'N/D'
}

function getEngine(unit) {
  return unit?.engine || unit?.motor || 'N/D'
}

function getTransmission(unit) {
  return unit?.transmission || unit?.transmision || 'N/D'
}

function getMileage(unit) {
  return Number(unit?.mileageKm ?? unit?.kilometros ?? 0) || 0
}

function getPrice(unit) {
  return Number(unit?.priceUsd ?? unit?.precio ?? 0) || 0
}

function getDaysInInventory(unit) {
  return Number(unit?.daysInInventory ?? 0) || 0
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
        <Card key={unit.id || unit.vin} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-lab-text">
                {getBrand(unit)} {getModel(unit)}
              </h3>
              <p className="text-xs text-lab-muted">
                {getYear(unit)} | {getVin(unit)}
              </p>
            </div>
            <Badge variant={statusVariant[unit.status] ?? 'default'}>{normalizeStatus(unit.status)}</Badge>
          </div>

          <dl className="grid gap-2 text-sm text-lab-muted">
            <div className="flex items-center justify-between gap-2">
              <dt>Sucursal</dt>
              <dd className="font-medium text-lab-text">{getBranchLabel(unit, branchesById)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Configuracion</dt>
              <dd className="text-right font-medium text-lab-text">{getConfiguration(unit)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Motor / Transmision</dt>
              <dd className="text-right font-medium text-lab-text">
                {getEngine(unit)} / {getTransmission(unit)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Kilometraje</dt>
              <dd className="font-medium text-lab-text">{formatNumber(getMileage(unit))} km</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Dias inventario</dt>
              <dd className="font-medium text-lab-text">{formatNumber(getDaysInInventory(unit))}</dd>
            </div>
          </dl>

          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-lab-muted">Precio USD</p>
            <p className="text-lg font-bold text-lab-text">{formatUSD(getPrice(unit))}</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onSelectUnit?.(unit)}
              className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
            >
              Ver detalle
            </button>
            <ExportUnitPdfButton unit={unit} fullWidth />
            <p className="text-xs text-lab-muted">Abrir detalle para cotizar y crear oportunidad simulada.</p>
          </div>
        </Card>
      ))}
    </section>
  )
}

export default InventoryCardGrid
