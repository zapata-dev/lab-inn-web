import { Card, Badge } from '../../components/common'

function ToolPlaceholder({ title, description, badge = 'Sprint 4' }) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-lab-text">{title}</h3>
        <Badge variant="info">{badge}</Badge>
      </div>
      <p className="text-sm text-lab-muted">{description}</p>
      <p className="text-xs text-lab-muted">
        Esta herramienta se implementara en Sprint 4 con alcance funcional completo.
      </p>
    </Card>
  )
}

export default ToolPlaceholder
