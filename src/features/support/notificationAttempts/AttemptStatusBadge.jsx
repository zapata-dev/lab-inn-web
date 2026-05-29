import { Badge } from '../../../components/common'

const STATUS_TO_VARIANT = {
  pending: 'warning',
  delivered: 'success',
  skipped_duplicate: 'info',
  failed: 'danger',
  retried: 'default',
  retry_not_required: 'default',
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  delivered: 'Entregado',
  skipped_duplicate: 'Duplicado evitado',
  failed: 'Fallido',
  retried: 'Reintentado',
  retry_not_required: 'Retry no requerido',
}

function AttemptStatusBadge({ status }) {
  const normalizedStatus = String(status || '').trim().toLowerCase()
  const variant = STATUS_TO_VARIANT[normalizedStatus] || 'default'
  const label = STATUS_LABELS[normalizedStatus] || normalizedStatus || 'Sin estado'

  return <Badge variant={variant}>{label}</Badge>
}

export default AttemptStatusBadge
