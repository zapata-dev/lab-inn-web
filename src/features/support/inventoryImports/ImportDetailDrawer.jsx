import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, ExternalLink, X } from 'lucide-react'
import ImportStatusBadge from './ImportStatusBadge'

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function renderEntries(obj) {
  if (!obj || typeof obj !== 'object') return '—'
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

function DetailRow({ label, value, mono = false }) {
  if (value == null || value === '' || value === '—') return null
  return (
    <div className="flex flex-wrap gap-2 border-b border-lab-border py-2 last:border-b-0">
      <dt className="w-44 shrink-0 text-xs font-semibold text-lab-muted">{label}</dt>
      <dd className={`flex-1 text-xs text-lab-text ${mono ? 'font-mono' : ''}`}>{String(value)}</dd>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-lab-muted first:mt-0">
      {title}
    </p>
  )
}

function ImportDetailDrawer({ isOpen, onClose, imp }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !imp) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imp.importId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {
      // clipboard API not available
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-lab-border px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ImportStatusBadge status={imp.status} />
            </div>
            <p className="mt-1 truncate font-mono text-xs text-lab-muted" title={imp.importId}>
              {imp.importId}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              title="Copiar importId"
              className="inline-flex items-center gap-1.5 rounded-lg border border-lab-border px-2.5 py-1.5 text-xs font-semibold text-lab-text hover:bg-slate-50"
            >
              <Copy className="size-3.5" aria-hidden="true" />
              {copied ? 'Copiado' : 'Copiar ID'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-lab-muted hover:bg-slate-100 hover:text-lab-text"
              aria-label="Cerrar detalle"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <SectionHeader title="Identificacion" />
          <dl>
            <DetailRow label="Import ID" value={imp.importId} mono />
            <DetailRow label="Fuente" value={imp.fuente} />
            <DetailRow label="Archivo" value={imp.archivoNombre} />
            <DetailRow label="Ejecutado por" value={imp.createdBy} />
          </dl>

          <SectionHeader title="Tiempos" />
          <dl>
            <DetailRow label="Inicio" value={formatDate(imp.startedAt)} />
            <DetailRow label="Fin" value={formatDate(imp.finishedAt)} />
          </dl>

          <SectionHeader title="Registros" />
          <dl>
            <DetailRow label="Total CSV" value={imp.totalRegistros} />
            <DetailRow label="Upserted" value={imp.registrosUpserted} />
            <DetailRow label="Creados" value={imp.registrosCreados} />
            <DetailRow label="Actualizados" value={imp.registrosActualizados} />
            <DetailRow label="Errores" value={imp.registrosConError} />
            <DetailRow label="Ausentes" value={imp.registrosAusentes} />
            <DetailRow label="Inventario previo" value={imp.totalInventarioPrevio} />
            <DetailRow label="CSV actual" value={imp.totalCsvActual} />
            <DetailRow label="Promociones activas" value={imp.promocionesActivas || null} />
            {imp.completedWithWarnings && (
              <DetailRow label="Warnings" value="Si" />
            )}
          </dl>

          {imp.calidadResumen && (
            <>
              <SectionHeader title="Calidad de datos" />
              <dl>
                <DetailRow label="Filas validas" value={imp.calidadResumen.filasValidas} />
                <DetailRow label="Filas invalidas" value={imp.calidadResumen.filasInvalidas} />
                <DetailRow label="Puntaje promedio" value={imp.calidadResumen.promedioScore != null ? `${imp.calidadResumen.promedioScore}%` : null} />
                <DetailRow label="Warnings totales" value={imp.calidadResumen.warnings} />
              </dl>
            </>
          )}

          {imp.driftResumen && (
            <>
              <SectionHeader title="Drift" />
              <dl>
                <DetailRow label="Nuevas" value={imp.driftResumen.nuevas} />
                <DetailRow label="Actualizadas" value={imp.driftResumen.actualizadas} />
                <DetailRow label="Ausentes" value={imp.driftResumen.ausentes} />
                <DetailRow label="Errores" value={imp.driftResumen.errores} />
                <DetailRow label="Total previo" value={imp.driftResumen.totalPrevio} />
                <DetailRow label="Total actual" value={imp.driftResumen.totalActual} />
              </dl>
            </>
          )}

          {imp.erroresPorTipo && Object.keys(imp.erroresPorTipo).length > 0 && (
            <>
              <SectionHeader title="Errores por tipo" />
              <p className="text-xs text-lab-text">{renderEntries(imp.erroresPorTipo)}</p>
            </>
          )}

          {imp.warningsPorTipo && Object.keys(imp.warningsPorTipo).length > 0 && (
            <>
              <SectionHeader title="Warnings por tipo" />
              <p className="text-xs text-lab-text">{renderEntries(imp.warningsPorTipo)}</p>
            </>
          )}

          {imp.unidadesPorSucursal && Object.keys(imp.unidadesPorSucursal).length > 0 && (
            <>
              <SectionHeader title="Unidades por sucursal" />
              <p className="text-xs text-lab-text">{renderEntries(imp.unidadesPorSucursal)}</p>
            </>
          )}

          {imp.errorResumen && (
            <>
              <SectionHeader title="Resumen de error" />
              <p className="text-xs text-rose-700">{imp.errorResumen}</p>
            </>
          )}

          <div className="mt-6 border-t border-lab-border pt-4">
            <Link
              to="/inventario"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary hover:bg-lab-primary hover:text-white"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Abrir Inventario Nacional
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export default ImportDetailDrawer
