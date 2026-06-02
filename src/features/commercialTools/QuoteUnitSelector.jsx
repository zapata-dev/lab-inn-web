import { Card, EmptyState } from '../../components/common'
import { formatNumber, formatUSD } from '../../utils/formatters'

function QuoteUnitSelector({ units = [], branchesById = {}, selectedUnitId = '', onChange }) {
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? null

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-lab-text">1. Seleccion de unidad</h3>
        <p className="text-sm text-lab-muted">Selecciona la unidad base para la cotización.</p>
      </div>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Unidad disponible</span>
        <select
          value={selectedUnitId}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
        >
          <option value="">Selecciona una unidad</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.brand} {unit.model} {unit.year} ({unit.id})
            </option>
          ))}
        </select>
      </label>

      {selectedUnit ? (
        <div className="rounded-lab border border-lab-border bg-slate-50 p-3">
          <p className="text-sm font-semibold text-lab-text">
            {selectedUnit.brand} {selectedUnit.model} {selectedUnit.year}
          </p>
          <p className="text-xs text-lab-muted">
            {selectedUnit.id} | {branchesById[selectedUnit.branchId]?.name ?? selectedUnit.branchId}
          </p>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-lab-muted">Precio lista</dt>
              <dd className="font-semibold text-lab-text">{formatUSD(selectedUnit.priceUsd)}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Configuración</dt>
              <dd className="font-semibold text-lab-text">{selectedUnit.configuration}</dd>
            </div>
            <div>
              <dt className="text-lab-muted">Motor / Transmision</dt>
              <dd className="font-semibold text-lab-text">
                {selectedUnit.engine} / {selectedUnit.transmission}
              </dd>
            </div>
            <div>
              <dt className="text-lab-muted">Kilometraje</dt>
              <dd className="font-semibold text-lab-text">{formatNumber(selectedUnit.mileageKm)} km</dd>
            </div>
          </dl>
        </div>
      ) : (
        <EmptyState
          title="Sin unidad seleccionada"
          description="Selecciona una unidad para continuar con el cotizador."
        />
      )}
    </Card>
  )
}

export default QuoteUnitSelector
