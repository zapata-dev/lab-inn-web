import { Badge, Card, EmptyState } from '../../../components/common'

const priorityVariantMap = {
  critica: 'danger',
  alta: 'warning',
  media: 'info',
  baja: 'default',
}

function PendingTasksList({ tasks = [] }) {
  if (!tasks.length) {
    return (
      <Card>
        <h3 className="mb-3 text-base font-semibold text-lab-text">Pendientes</h3>
        <EmptyState
          title="Sin pendientes activos"
          description="Excelente ritmo. No hay tareas pendientes para este usuario."
        />
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-lab-text">Pendientes</h3>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="rounded-xl border border-lab-border bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-lab-text">{task.title}</p>
              <Badge variant={priorityVariantMap[task.priority] ?? 'default'}>
                Prioridad {task.priority ?? 'media'}
              </Badge>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide text-lab-muted">
              Modulo {task.moduleKey ?? 'general'}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default PendingTasksList
