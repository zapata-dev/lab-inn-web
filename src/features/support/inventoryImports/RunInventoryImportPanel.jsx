import { useState } from 'react'
import { Play } from 'lucide-react'
import { runInventoryImportNow } from '../../../services/supportInventoryImportsService'
import ImportStatusBadge from './ImportStatusBadge'

function RunInventoryImportPanel() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleRun = () => {
    const trimmedUrl = sourceUrl.trim()
    const confirmMessage = trimmedUrl
      ? `Se ejecutara el import con esta URL:\n${trimmedUrl}\n\n¿Confirmar?`
      : 'Se usara INVENTORY_CSV_URL configurado en Cloud Functions.\n\n¿Confirmar ejecucion?'

    if (!window.confirm(confirmMessage)) return

    executeImport(trimmedUrl)
  }

  const executeImport = async (resolvedUrl) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await runInventoryImportNow({ sourceUrl: resolvedUrl || undefined })
      setResult(data)
    } catch (err) {
      const message = String(err?.message || err || 'Error al ejecutar import manual.')
      setError(message.slice(0, 500))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-lab-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-lab-text">Ejecutar import manual</h2>
      <p className="mt-1 text-xs text-lab-muted">
        Llama a <code className="rounded bg-slate-100 px-1 font-mono">runInventoryImportNow</code> como soporte. La corrida queda registrada en importsInventario.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block space-y-1 text-xs font-semibold text-lab-muted">
          URL de CSV (opcional)
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://... dejar vacio para usar la URL de Cloud Functions"
            disabled={loading}
            className="mt-1 block w-full rounded-lg border border-lab-border px-3 py-2 text-sm font-normal text-lab-text placeholder:text-lab-muted disabled:opacity-50"
          />
          <span className="block font-normal text-lab-muted">
            Si se deja vacio, se usara <code className="rounded bg-slate-100 px-1 font-mono">INVENTORY_CSV_URL</code> configurado en Functions.
          </span>
        </label>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-lab-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="size-4" aria-hidden="true" />
          {loading ? 'Ejecutando import...' : 'Ejecutar import ahora'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-xs font-semibold text-rose-700">Error al ejecutar import</p>
          <p className="mt-1 text-xs text-rose-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-emerald-800">Import ejecutado</p>
            <ImportStatusBadge status={result.status} />
          </div>
          <p className="font-mono text-xs text-emerald-800">{result.importId}</p>
          <div className="flex flex-wrap gap-4 text-xs text-emerald-700">
            {result.registrosUpserted != null && (
              <span>{result.registrosUpserted} upserted</span>
            )}
            {result.registrosConError > 0 && (
              <span className="text-amber-700">{result.registrosConError} errores</span>
            )}
            {result.registrosAusentes > 0 && (
              <span className="text-amber-700">{result.registrosAusentes} ausentes</span>
            )}
            {result.calidadResumen?.promedioScore != null && (
              <span>calidad {result.calidadResumen.promedioScore}%</span>
            )}
          </div>
          {result.errorResumen && (
            <p className="text-xs text-amber-700">{result.errorResumen}</p>
          )}
          <button
            type="button"
            onClick={() => setResult(null)}
            className="text-xs text-emerald-700 underline hover:no-underline"
          >
            Limpiar resultado
          </button>
        </div>
      )}
    </div>
  )
}

export default RunInventoryImportPanel
