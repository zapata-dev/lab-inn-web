function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function DetailRow({ label, value }) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-3 border-b border-lab-border/70 py-2 last:border-0">
      <span className="text-sm font-medium text-lab-muted">{label}</span>
      <span className="text-right text-sm text-lab-text">{value}</span>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-xl border border-lab-border bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function InventoryDetailModal({ unit, onClose, onCopy }) {
  if (!unit) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-lab-border bg-lab-bg shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-lab-border bg-white p-5">
          <div>
            <h2 className="text-2xl font-bold text-lab-text">
              {unit.brand} {unit.model}
            </h2>
            <p className="text-sm text-lab-muted">
              {unit.year || 'Ano no especificado'} | {unit.location}
            </p>
            <p className="mt-1 text-xl font-bold text-lab-primary">{formatCurrency(unit.price)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-lab-border bg-white px-3 py-1.5 text-sm font-medium text-lab-muted transition-colors hover:text-lab-text"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="Informacion general">
              <DetailRow label="Marca" value={unit.brand} />
              <DetailRow label="Modelo" value={unit.model} />
              <DetailRow label="Ano" value={unit.year} />
              <DetailRow label="Tipo de unidad" value={unit.unitType} />
              <DetailRow label="Color" value={unit.color} />
              <DetailRow label="Status" value={unit.status} />
            </DetailSection>

            <DetailSection title="Tren motriz">
              <DetailRow label="Motor" value={unit.motor} />
              <DetailRow label="Transmision" value={unit.transmission} />
              <DetailRow label="Potencia HP" value={unit.horsepower} />
              <DetailRow label="Torque" value={unit.torque} />
              <DetailRow label="Combustible" value={unit.fuelType} />
              <DetailRow label="Traccion" value={unit.traction} />
              <DetailRow label="Kilometraje" value={unit.mileage} />
            </DetailSection>

            <DetailSection title="Configuracion">
              <DetailRow label="Paso" value={unit.paso} />
              <DetailRow label="Rodada" value={unit.rodada} />
              <DetailRow label="Cabina" value={unit.cabina} />
              <DetailRow label="Configuracion" value={unit.configuration} />
              <DetailRow label="Suspension" value={unit.suspension} />
              <DetailRow label="Numero de ejes" value={unit.axles} />
              <DetailRow label="Sleeper / daycab" value={unit.sleeper} />
              <DetailRow label="Capacidad de carga" value={unit.payload} />
              <DetailRow label="Caja / remolque" value={unit.boxTrailer} />
            </DetailSection>

            <DetailSection title="Ubicacion y contacto">
              <DetailRow label="Sucursal / ubicacion" value={unit.location} />
              <DetailRow label="Descripcion" value={unit.description} />
              <a
                href={`mailto:innovaciogoon@zapata.com.mx?subject=Interes%20en%20${encodeURIComponent(`${unit.brand} ${unit.model}`)}`}
                className="mt-3 inline-flex rounded-lg bg-lab-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Contactar
              </a>
            </DetailSection>

            <DetailSection title="Datos administrativos">
              <DetailRow label="VIN" value={unit.vin} />
              <DetailRow label="Placas" value={unit.plates} />
              {Object.keys(unit.specs || {}).map((key) => (
                <DetailRow key={key} label={key} value={unit.specs[key]} />
              ))}
            </DetailSection>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-lab-border bg-white p-5">
          <button
            type="button"
            onClick={() => onCopy(unit)}
            className="rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary"
          >
            Copiar informacion
          </button>
          <a
            href={`mailto:innovaciogoon@zapata.com.mx?subject=Interes%20en%20${encodeURIComponent(`${unit.brand} ${unit.model}`)}`}
            className="rounded-xl bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Contacto
          </a>
        </div>
      </div>
    </div>
  )
}

export default InventoryDetailModal
