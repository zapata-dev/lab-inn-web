import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import { Drawer } from '../../../components/common'
import AttemptStatusBadge from './AttemptStatusBadge'

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

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

function OpsButton({ label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-md border border-lab-border px-2 py-1 text-xs font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Link2 className="size-3.5" aria-hidden="true" />
      {label}
    </button>
  )
}

function AttemptDetailDrawer({ isOpen, attempt, onClose }) {
  const navigate = useNavigate()
  const [copyMessage, setCopyMessage] = useState('')

  const runCopy = async (value, label) => {
    const copied = await copyText(value)
    setCopyMessage(copied ? `${label} copiado.` : `No se pudo copiar ${label}.`)
  }

  if (!attempt) {
    return <Drawer isOpen={isOpen} onClose={onClose} title="Detalle de attempt" />
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Attempt ${attempt.attemptId}`}>
      <div className="space-y-4">
        <section className="rounded-lg border border-lab-border bg-slate-50 p-3">
          <h4 className="text-sm font-semibold text-lab-text">Resumen</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">Status:</span> <AttemptStatusBadge status={attempt.status} /></p>
            <p><span className="font-semibold">Reason:</span> {attempt.reason || 'N/D'}</p>
            <p><span className="font-semibold">Attempt #:</span> {attempt.attemptNumber || 'N/D'}</p>
            <p><span className="font-semibold">Triggered by:</span> {attempt.triggeredBy || 'N/D'}</p>
            <p><span className="font-semibold">Fecha:</span> {formatDate(attempt.createdAt)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">IDs tecnicos</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">attemptId:</span> {attempt.attemptId || 'N/D'}</p>
            <p><span className="font-semibold">deliveryId:</span> {attempt.deliveryId || 'N/D'}</p>
            <p><span className="font-semibold">notificationId:</span> {attempt.notificationId || 'N/D'}</p>
            <p><span className="font-semibold">solicitudId:</span> {attempt.solicitudId || 'N/D'}</p>
            <p><span className="font-semibold">userId:</span> {attempt.userId || 'N/D'}</p>
          </div>
        </section>

        <section className="rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Origen</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">sourceType:</span> {attempt.sourceType || 'N/D'}</p>
            <p><span className="font-semibold">sourcePath:</span> {attempt.sourcePath || 'N/D'}</p>
            <p><span className="font-semibold">triggeredByUid:</span> {attempt.triggeredByUid || 'N/D'}</p>
            <p><span className="font-semibold">tipo:</span> {attempt.tipo || 'N/D'}</p>
            <p><span className="font-semibold">refPath:</span> {attempt.refPath || 'N/D'}</p>
          </div>
        </section>

        <section className="rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Error</h4>
          <div className="mt-2 space-y-1 text-xs text-lab-text">
            <p><span className="font-semibold">errorCode:</span> {attempt.errorCode || 'N/D'}</p>
            <p><span className="font-semibold">errorMessage:</span> {attempt.errorMessage || 'Sin error registrado'}</p>
          </div>
        </section>

        <section className="space-y-2 rounded-lg border border-lab-border bg-white p-3">
          <h4 className="text-sm font-semibold text-lab-text">Metadata</h4>
          <pre className="max-h-48 overflow-auto rounded-lg border border-lab-border bg-slate-950 p-3 text-[11px] text-slate-100">
            {JSON.stringify(attempt.metadata || {}, null, 2)}
          </pre>
        </section>

        <section className="space-y-2 rounded-lg border border-lab-border bg-slate-50 p-3">
          <h4 className="text-sm font-semibold text-lab-text">Acciones</h4>

          <div className="flex flex-wrap gap-2">
            <OpsButton label="Copiar attemptId" onClick={() => runCopy(attempt.attemptId, 'attemptId')} />
            <OpsButton label="Copiar deliveryId" onClick={() => runCopy(attempt.deliveryId, 'deliveryId')} />
            <OpsButton
              label="Copiar notificationId"
              onClick={() => runCopy(attempt.notificationId, 'notificationId')}
            />
            <OpsButton label="Copiar solicitudId" onClick={() => runCopy(attempt.solicitudId, 'solicitudId')} />
            <OpsButton label="Copiar userId" onClick={() => runCopy(attempt.userId, 'userId')} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(`/soporte/notificaciones?deliveryId=${encodeURIComponent(String(attempt.deliveryId || ''))}`)
              }
              disabled={!attempt.deliveryId}
              className="rounded-md border border-lab-border px-2 py-1 text-xs font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Abrir delivery padre
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/solicitudes?solicitudId=${encodeURIComponent(String(attempt.solicitudId || ''))}`)
              }
              disabled={!attempt.solicitudId}
              className="rounded-md border border-lab-border px-2 py-1 text-xs font-semibold text-lab-text hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Abrir solicitud
            </button>
          </div>

          {copyMessage ? <p className="text-xs text-lab-muted">{copyMessage}</p> : null}
        </section>
      </div>
    </Drawer>
  )
}

export default AttemptDetailDrawer
