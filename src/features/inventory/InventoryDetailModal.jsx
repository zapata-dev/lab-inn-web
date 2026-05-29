import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CreateRequestModal from '../requests/CreateRequestModal'
import ExportUnitPdfButton from './ExportUnitPdfButton'

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKilometers(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Kilometraje por confirmar'

  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} km`
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
  const { user, isFirebaseMode, isAuthorized } = useAuth()
  const [requestModalOpen, setRequestModalOpen] = useState(false)

  if (!unit) return null

  const isRequestEnabled = isFirebaseMode && isAuthorized && Boolean(user)
  const userBranchId = String(user?.sucursalId ?? '').trim()
  const unitBranchId = String(
    unit?.sucursalId || unit?.branchId || unit?.sucursal || unit?.centro || ''
  ).trim()
  const isSameBranch = userBranchId && unitBranchId && userBranchId === unitBranchId

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[1px]"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-lab-border bg-lab-bg shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-lab-border bg-white p-5">
          <div>
            <h2 className="text-2xl font-bold text-lab-text">
              {unit.marca || 'Sin marca'} {unit.modelo || 'Sin modelo'}
            </h2>
            <p className="text-sm text-lab-muted">
              {unit.anio || 'Ano no especificado'} | {unit.ubicacion || 'Sin ubicacion'}
            </p>
            <p className="mt-1 text-xl font-bold text-lab-primary">{formatCurrency(unit.precio)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-lab-border bg-white px-3 py-1.5 text-sm font-medium text-lab-muted transition-colors hover:text-lab-text"
          >
            Cerrar
          </button>
        </div>

          <div className="max-h-[72vh] space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="Informacion general">
              <DetailRow label="Marca" value={unit.marca} />
              <DetailRow label="Modelo" value={unit.modelo} />
              <DetailRow label="Ano" value={unit.anio} />
              <DetailRow label="Color" value={unit.color} />
              <DetailRow label="Subempresa" value={unit.subempresa} />
              <DetailRow label="Status" value={unit.status} />
            </DetailSection>

            <DetailSection title="Tren motriz">
              <DetailRow label="Motor" value={unit.motor} />
              <DetailRow label="Transmision" value={unit.transmision} />
              <DetailRow label="Cilindros" value={unit.cilindros} />
              <DetailRow label="Kilometraje" value={formatKilometers(unit.kilometros)} />
            </DetailSection>

            <DetailSection title="Configuracion">
              <DetailRow label="Paso" value={unit.paso} />
              <DetailRow label="Rodada" value={unit.rodada} />
              <DetailRow label="Eje delantero" value={unit.ejeDelantero} />
              <DetailRow label="Eje trasero" value={unit.ejeTrasero} />
              <DetailRow label="Dormitorio" value={unit.dormitorio} />
            </DetailSection>

            <DetailSection title="Ubicacion y contacto">
              <DetailRow label="Centro" value={unit.centro} />
              <DetailRow label="Ubicacion fisica" value={unit.ubicacion} />
              <a
                href={`mailto:innovaciogoon@zapata.com.mx?subject=Interes%20en%20${encodeURIComponent(`${unit.marca || ''} ${unit.modelo || ''}`.trim())}`}
                className="mt-3 inline-flex rounded-lg bg-lab-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Contactar
              </a>
            </DetailSection>

            <DetailSection title="Datos administrativos">
              <DetailRow label="VIN completo" value={unit.vinCompleto} />
              <DetailRow label="VIN" value={unit.vin} />
              <DetailRow label="Promocion" value={unit.promocion} />
            </DetailSection>
          </div>

          <section className="rounded-xl border border-lab-border bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Imagenes</h3>
            <div className="mt-3 space-y-3">
              {unit.imagenPortada ? (
                <img
                  src={unit.imagenPortada}
                  alt={`${unit.marca || 'Unidad'} portada`}
                  className="h-56 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-medium text-slate-500">
                  Sin foto
                </div>
              )}

              {Array.isArray(unit.imagenesCompletas) && unit.imagenesCompletas.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {unit.imagenesCompletas.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`Galeria ${index + 1}`}
                      className="h-28 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-lab-muted">No hay galeria disponible para esta unidad.</p>
              )}
            </div>
          </section>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-lab-border bg-white p-5">
            <ExportUnitPdfButton unit={unit} />
            {isRequestEnabled && (
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                Solicitar unidad
              </button>
            )}
            <button
              type="button"
              onClick={() => onCopy(unit)}
              className="rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary"
            >
              Copiar informacion
            </button>
            <a
              href={`mailto:innovaciogoon@zapata.com.mx?subject=Interes%20en%20${encodeURIComponent(`${unit.marca || ''} ${unit.modelo || ''}`.trim())}`}
              className="rounded-xl bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Contacto
            </a>
            <Link
              to="/solicitudes"
              className="rounded-xl border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text transition-colors hover:border-lab-primary/40 hover:text-lab-primary"
            >
              Ver solicitudes
            </Link>
            {isRequestEnabled && isSameBranch && (
              <p className="basis-full text-xs text-amber-700">
                Esta unidad esta en tu misma sucursal. Puedes solicitarla de todos modos para registro.
              </p>
            )}
            <p className="basis-full text-xs text-lab-muted">
              Al guardar como PDF, desactiva &quot;Encabezados y pies&quot; en el cuadro de impresion para un
              resultado limpio.
            </p>
          </div>
        </div>
      </div>
      <CreateRequestModal
        isOpen={requestModalOpen}
        unit={unit}
        onClose={() => setRequestModalOpen(false)}
        onCreated={() => {
          setRequestModalOpen(false)
        }}
      />
    </>
  )
}

export default InventoryDetailModal
