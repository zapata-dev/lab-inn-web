import { Badge, Card, EmptyState, StatusBadge } from '../../../components/common'
import { computeOverall } from '../../../utils/progressUtils'
import { computeTrafficLight } from '../../../utils/trafficLightUtils'

function RiskUsersList({ users = [], progressByUser = {}, maxItems = 5 }) {
  const rankedUsers = users
    .map((user) => {
      const progressEntry = progressByUser[user.id] ?? {}
      const overall = computeOverall(progressEntry)
      const traffic = computeTrafficLight(overall)

      return {
        ...user,
        overall,
        traffic,
      }
    })
    .sort((a, b) => a.overall - b.overall)
    .slice(0, maxItems)

  if (!rankedUsers.length) {
    return (
      <Card>
        <h3 className="mb-3 text-base font-semibold text-lab-text">Usuarios en riesgo</h3>
        <EmptyState title="Sin usuarios para evaluar" description="No hay datos de progreso disponibles." />
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-lab-text">Usuarios en riesgo</h3>
      <ul className="space-y-3">
        {rankedUsers.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-lab-border bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-lab-text">{entry.name}</p>
                <p className="text-xs text-lab-muted">
                  {entry.roleLabel} | {entry.branchName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={entry.traffic} />
                <Badge variant="info">{entry.overall}%</Badge>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default RiskUsersList
