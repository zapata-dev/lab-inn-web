import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Card } from '../../components/common'

const TYPE_STYLE = {
  array: 'text-emerald-600',
  object: 'text-blue-600',
  string: 'text-amber-600',
  number: 'text-purple-600',
  boolean: 'text-purple-600',
  null: 'text-lab-muted',
  missing: 'text-lab-muted',
}

function AdminStoragePanel({ snapshot, onRefresh, onClearDemoStorage }) {
  const [confirming, setConfirming] = useState(false)

  const handleClearClick = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setConfirming(false)
    onClearDemoStorage()
  }

  const existingCount = snapshot.filter((s) => s.exists).length

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-lab-text">Storage demo</h4>
          <p className="text-xs text-lab-muted">
            {existingCount} de {snapshot.length} claves con datos
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-lab border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:bg-slate-50"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Actualizar snapshot
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-lab-border text-xs font-semibold uppercase tracking-wide text-lab-muted">
            <tr>
              <th className="py-2 pr-4 text-left">Clave</th>
              <th className="py-2 pr-4 text-left">Estado</th>
              <th className="py-2 pr-4 text-left">Tipo</th>
              <th className="py-2 text-right">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lab-border">
            {snapshot.map((item) => (
              <tr key={item.key} className={item.exists ? '' : 'opacity-40'}>
                <td className="py-2 pr-4 font-mono text-xs text-lab-text">{item.fullKey}</td>
                <td className="py-2 pr-4">
                  {item.exists ? (
                    <span className="text-xs font-semibold text-emerald-600">presente</span>
                  ) : (
                    <span className="text-xs text-lab-muted">vacía</span>
                  )}
                </td>
                <td className={`py-2 pr-4 font-mono text-xs ${TYPE_STYLE[item.type] ?? 'text-lab-muted'}`}>
                  {item.type === 'missing' ? '—' : item.type}
                </td>
                <td className="py-2 text-right text-xs text-lab-muted">
                  {item.count !== null ? item.count : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-lab-border pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <button
                type="button"
                onClick={handleClearClick}
                className="rounded-lab border border-rose-400 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
              >
                Confirmar limpieza
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lab border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClearClick}
              className="rounded-lab border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              Limpiar datos demo
            </button>
          )}
          <p className="text-xs text-lab-muted">No borra la sesion actual.</p>
        </div>
      </div>
    </Card>
  )
}

export default AdminStoragePanel
