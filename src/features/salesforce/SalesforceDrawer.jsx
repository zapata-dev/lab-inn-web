import { useEffect, useState } from 'react'
import { advanceSimulatedOppStage } from '../../services/quotesService'
import { addTask, getFollowUps, getTasks, markFollowUp } from '../../services/salesforceActionsService'
import { formatDate, formatUSD } from '../../utils/formatters'

const stageConfig = {
  prospecto: { label: 'Prospecto', className: 'bg-slate-100 text-slate-700' },
  cotizacion: { label: 'Cotizacion', className: 'bg-blue-100 text-blue-700' },
  negociacion: { label: 'Negociacion', className: 'bg-amber-100 text-amber-700' },
  ganada: { label: 'Ganada', className: 'bg-emerald-100 text-emerald-700' },
  perdida: { label: 'Perdida', className: 'bg-rose-100 text-rose-700' },
  nuevo: { label: 'Nuevo', className: 'bg-slate-100 text-slate-700' },
  contactado: { label: 'Contactado', className: 'bg-blue-100 text-blue-700' },
  calificado: { label: 'Calificado', className: 'bg-emerald-100 text-emerald-700' },
  descartado: { label: 'Descartado', className: 'bg-rose-100 text-rose-700' },
}

const OPP_STAGE_ORDER = ['prospecto', 'cotizacion', 'negociacion', 'ganada']

function StagePill({ stage }) {
  const cfg = stageConfig[stage] ?? { label: stage, className: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function DetailRow({ label, children }) {
  if (children === null || children === undefined) return null
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 text-xs text-lab-muted">{label}</span>
      <span className="text-sm text-lab-text">{children}</span>
    </div>
  )
}

function SalesforceDrawer({ open, entity, entityType, inventoryById = {}, branchesById = {}, onClose, onDataChanged }) {
  const [localStage, setLocalStage] = useState('')
  const [followUps, setFollowUps] = useState([])
  const [tasks, setTasks] = useState([])
  const [taskInput, setTaskInput] = useState('')
  const [followUpFlash, setFollowUpFlash] = useState(false)

  useEffect(() => {
    if (open && entity) {
      setLocalStage(entity.stage ?? '')
      setFollowUps(getFollowUps(entity.id))
      setTasks(getTasks(entity.id))
      setFollowUpFlash(false)
      setTaskInput('')
    }
  }, [open, entity])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!entity) return null

  const isOpp = entityType === 'opp'
  const isSimulated = isOpp && entity.isSimulated
  const currentStageIdx = OPP_STAGE_ORDER.indexOf(localStage)
  const canAdvance = isSimulated && currentStageIdx >= 0 && currentStageIdx < OPP_STAGE_ORDER.length - 1
  const nextStageName = canAdvance ? stageConfig[OPP_STAGE_ORDER[currentStageIdx + 1]]?.label : null

  const handleMarkFollowUp = () => {
    const entry = markFollowUp(entity.id)
    setFollowUps((prev) => [...prev, entry])
    setFollowUpFlash(true)
    setTimeout(() => setFollowUpFlash(false), 2000)
  }

  const handleAdvanceStage = () => {
    const updated = advanceSimulatedOppStage(entity.id)
    if (updated) {
      setLocalStage(updated.stage)
      onDataChanged?.()
    }
  }

  const handleAddTask = () => {
    const text = taskInput.trim()
    if (!text) return
    const task = addTask({ entityId: entity.id, text })
    setTasks((prev) => [...prev, task])
    setTaskInput('')
  }

  const activities = [
    ...followUps.map((f) => ({ id: f.id, type: 'followup', at: f.at, label: 'Seguimiento marcado', text: null })),
    ...tasks.map((t) => ({ id: t.id, type: 'task', at: t.createdAt, label: 'Tarea', text: t.text })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at))

  const title = isOpp ? (entity.company ?? '-') : (entity.companyName ?? '-')
  const contact = entity.contactName
  const unitLabel = isOpp
    ? entity.unitLabel
    : (() => {
        const u = inventoryById[entity.unitId]
        return u ? `${u.brand} ${u.model} ${u.year}` : (entity.unitId ?? '-')
      })()
  const branchName = !isOpp ? (branchesById[entity.branchId]?.name ?? entity.branchId) : null
  const sourceLabel = entity.source === 'cotizador' ? 'Cotizador' : entity.source === 'inventario' ? 'Inventario' : null

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div
        className="absolute inset-0 bg-black/30"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={`relative flex size-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-start justify-between border-b border-lab-border px-5 py-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                {isOpp ? 'Oportunidad' : 'Lead'}
              </span>
              {sourceLabel && (
                <span className="rounded-full bg-lab-primary/10 px-2 py-0.5 text-xs font-semibold text-lab-primary">
                  {sourceLabel}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-lab-text">{title}</h3>
            {contact && contact !== '-' && (
              <p className="text-sm text-lab-muted">{contact}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="ml-4 rounded-full p-1.5 text-lab-muted hover:bg-slate-100 hover:text-lab-text"
          >
            &#x2715;
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Detalle</h4>
            <div className="space-y-1.5">
              <DetailRow label="Etapa"><StagePill stage={localStage} /></DetailRow>
              {isOpp && <DetailRow label="Probabilidad">{entity.probability}%</DetailRow>}
              {isOpp && <DetailRow label="Monto">{formatUSD(entity.amountUsd)}</DetailRow>}
              {isOpp && entity.closeDate && <DetailRow label="Cierre est.">{formatDate(entity.closeDate)}</DetailRow>}
              {isOpp && entity.folio && <DetailRow label="Folio"><span className="font-mono">{entity.folio}</span></DetailRow>}
              {!isOpp && <DetailRow label="Prioridad">{entity.priority}</DetailRow>}
              {!isOpp && <DetailRow label="Canal">{entity.channel}</DetailRow>}
              {!isOpp && <DetailRow label="Valor est.">{formatUSD(entity.estimatedValueUsd)}</DetailRow>}
              {!isOpp && branchName && <DetailRow label="Sucursal">{branchName}</DetailRow>}
              {unitLabel && <DetailRow label="Unidad">{unitLabel}</DetailRow>}
              {!isOpp && entity.lastActivityAt && (
                <DetailRow label="Ult. actividad">{formatDate(entity.lastActivityAt)}</DetailRow>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Acciones</h4>

            <button
              type="button"
              onClick={handleMarkFollowUp}
              className="w-full rounded-lab border border-lab-border px-3 py-2 text-left text-sm font-semibold text-lab-text hover:bg-slate-50"
            >
              {followUpFlash ? 'Seguimiento registrado' : 'Marcar seguimiento'}
            </button>

            {isOpp && (
              canAdvance ? (
                <button
                  type="button"
                  onClick={handleAdvanceStage}
                  className="w-full rounded-lab border border-lab-primary bg-lab-primary/5 px-3 py-2 text-left text-sm font-semibold text-lab-primary hover:bg-lab-primary/10"
                >
                  Avanzar etapa &rarr; {nextStageName}
                </button>
              ) : (
                <div className="rounded-lab border border-lab-border bg-slate-50 px-3 py-2 text-sm text-lab-muted">
                  {localStage === 'ganada' || localStage === 'perdida'
                    ? 'Etapa final alcanzada'
                    : 'Avanzar etapa no disponible para datos CRM'}
                </div>
              )
            )}

            <div className="space-y-2">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Descripcion de la tarea..."
                rows={2}
                className="w-full resize-none rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text placeholder:text-lab-muted focus:outline-none focus:ring-1 focus:ring-lab-primary"
              />
              <button
                type="button"
                onClick={handleAddTask}
                disabled={!taskInput.trim()}
                className="rounded-lab border border-lab-border px-3 py-1.5 text-sm font-semibold text-lab-text hover:bg-slate-50 disabled:opacity-40"
              >
                Crear tarea
              </button>
            </div>
          </section>

          {activities.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Actividad</h4>
              <ul className="space-y-2">
                {activities.map((a) => (
                  <li key={a.id} className="rounded-lab border border-lab-border bg-slate-50 px-3 py-2 text-sm">
                    <p className="font-semibold text-lab-text">{a.label}{a.text ? ': ' : ''}{a.text}</p>
                    <p className="mt-0.5 text-xs text-lab-muted">{formatDate(a.at)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default SalesforceDrawer
