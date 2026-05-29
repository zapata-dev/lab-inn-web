import { useState } from 'react'
import { Link2, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  let success = false
  try {
    success = document.execCommand('copy')
  } catch (_) {
    success = false
  }

  document.body.removeChild(textarea)
  return success
}

async function copyText(text) {
  const normalized = String(text || '').trim()
  if (!normalized) return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(normalized)
      return true
    }
  } catch (_) {
    // fallback abajo
  }

  return fallbackCopy(normalized)
}

function OpsButton({ label, onClick, disabled = false, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-md border border-lab-border px-2 py-1 text-xs font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {label}
    </button>
  )
}

function DeliveryOpsActions({ delivery, onRetry, retryLoading, retryResult }) {
  const navigate = useNavigate()
  const [copyMessage, setCopyMessage] = useState('')

  if (!delivery) return null

  const canRetry = delivery.status === 'failed'

  const runCopy = async (value, label) => {
    const copied = await copyText(value)
    setCopyMessage(copied ? `${label} copiado.` : `No se pudo copiar ${label}.`)
  }

  return (
    <section className="space-y-2 rounded-lg border border-lab-border bg-slate-50 p-3">
      <h4 className="text-sm font-semibold text-lab-text">Acciones operativas</h4>

      <div className="flex flex-wrap gap-2">
        <OpsButton label="Copiar deliveryId" onClick={() => runCopy(delivery.deliveryId, 'deliveryId')} icon={Link2} />
        <OpsButton label="Copiar notificationId" onClick={() => runCopy(delivery.notificationId, 'notificationId')} icon={Link2} />
        <OpsButton label="Copiar solicitudId" onClick={() => runCopy(delivery.solicitudId, 'solicitudId')} disabled={!delivery.solicitudId} icon={Link2} />
        <OpsButton label="Copiar userId" onClick={() => runCopy(delivery.userId, 'userId')} icon={Link2} />
      </div>

      <div className="flex flex-wrap gap-2">
        <OpsButton
          label={retryLoading ? 'Reintentando...' : 'Reintentar entrega'}
          onClick={onRetry}
          disabled={!canRetry || retryLoading}
          icon={RefreshCw}
        />
        <OpsButton
          label="Abrir solicitud"
          onClick={() => navigate(`/solicitudes?solicitudId=${encodeURIComponent(delivery.solicitudId)}`)}
          disabled={!delivery.solicitudId}
        />
      </div>

      {copyMessage ? <p className="text-xs text-lab-muted">{copyMessage}</p> : null}
      {retryResult ? (
        <pre className="max-h-40 overflow-auto rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
          {JSON.stringify(retryResult, null, 2)}
        </pre>
      ) : null}
    </section>
  )
}

export default DeliveryOpsActions
