import { Badge, Card, ProgressBar } from '../../../components/common'
import { computeOverall } from '../../../utils/progressUtils'

function BranchProgressList({ branches = [], users = [], progress = [] }) {
  const progressByUser = Object.fromEntries(progress.map((entry) => [entry.userId, entry]))

  const rows = branches.map((branch) => {
    const branchUsers = users.filter((user) => user.branchId === branch.id)
    const branchScores = branchUsers
      .map((user) => computeOverall(progressByUser[user.id] ?? {}))
      .filter((score) => Number.isFinite(score))

    const average = branchScores.length
      ? Math.round(branchScores.reduce((total, score) => total + score, 0) / branchScores.length)
      : 0

    return {
      branch,
      usersCount: branchUsers.length,
      average,
    }
  })

  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-lab-text">Avance por sucursal</h3>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.branch.id} className="space-y-2 rounded-xl border border-lab-border bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-lab-text">{row.branch.name}</p>
                <p className="text-xs text-lab-muted">{row.branch.region}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  {row.usersCount > 0 ? `${row.usersCount} usuarios` : 'Sin usuarios'}
                </Badge>
                <Badge variant="info">{row.average}%</Badge>
              </div>
            </div>
            <ProgressBar value={row.average} label="Promedio" showValue={false} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default BranchProgressList
