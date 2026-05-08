import { useMemo } from 'react'
import { Card, EmptyState } from '../../components/common'

const MODULE_LABELS = {
  salesforce: 'Salesforce',
  chatbots: 'Chatbots',
  roles: 'Roles',
  procesos: 'Procesos',
  herramientas: 'Herramientas',
}

const MODULES = Object.keys(MODULE_LABELS)

const priorityConfig = {
  alta: 'bg-rose-100 text-rose-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-slate-100 text-slate-700',
}

function ScoreBar({ label, value }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-lab-text">{label}</span>
        <span className="font-bold text-lab-text">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function TrainingProgress({ userProgress, watchedVideos, videos }) {
  if (!userProgress) {
    return <EmptyState title="Sin progreso" description="No hay datos de progreso para este usuario." />
  }

  const scores = MODULES.map((m) => userProgress[m] ?? 0)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  const completedVideoIds = useMemo(() => {
    return new Set([...( userProgress.completedVideos ?? []), ...Object.keys(watchedVideos)])
  }, [userProgress.completedVideos, watchedVideos])

  const completedVideos = videos.filter((v) => completedVideoIds.has(v.id))

  const avgColor = avg >= 80 ? 'text-emerald-600' : avg >= 60 ? 'text-amber-600' : 'text-rose-600'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Promedio global</p>
          <p className={`text-4xl font-bold ${avgColor}`}>{avg}%</p>
        </Card>
        <Card className="space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Videos completados</p>
          <p className="text-4xl font-bold text-lab-text">{completedVideoIds.size}</p>
          <p className="text-xs text-lab-muted">de {videos.length} totales</p>
        </Card>
        <Card className="space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Ultimo diagnostico</p>
          <p className="text-4xl font-bold text-lab-text">{userProgress.lastDiagnosticScore ?? '-'}%</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Avance por modulo</h3>
        <div className="space-y-3">
          {MODULES.map((m) => (
            <ScoreBar key={m} label={MODULE_LABELS[m]} value={userProgress[m] ?? 0} />
          ))}
        </div>
      </Card>

      {userProgress.pendingTasks?.length > 0 && (
        <Card className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Tareas pendientes</h3>
          <ul className="space-y-2">
            {userProgress.pendingTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-3 rounded-lg border border-lab-border px-3 py-2.5">
                <div className="flex-1">
                  <p className="text-sm text-lab-text">{task.title}</p>
                  <p className="text-xs text-lab-muted">{MODULE_LABELS[task.moduleKey] ?? task.moduleKey}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${priorityConfig[task.priority] ?? 'bg-slate-100 text-slate-700'}`}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {completedVideos.length > 0 && (
        <Card className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Videos completados ({completedVideos.length})
          </h3>
          <ul className="space-y-1.5">
            {completedVideos.map((v) => (
              <li key={v.id} className="flex items-center gap-2 text-sm">
                <span className="text-emerald-500">&#10003;</span>
                <span className="text-lab-text">{v.title}</span>
                <span className="text-xs text-lab-muted">· {v.durationMinutes} min</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

export default TrainingProgress
