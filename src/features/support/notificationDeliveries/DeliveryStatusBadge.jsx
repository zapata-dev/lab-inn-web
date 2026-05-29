import { Badge } from '../../../components/common'

const STATUS_TO_VARIANT = {
  pending: 'warning',
  delivered: 'success',
  skipped_duplicate: 'info',
  failed: 'danger',
  retried: 'default',
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  delivered: 'Entregada',
  skipped_duplicate: 'Duplicado evitado',
  failed: 'Fallida',
  retried: 'Reintentada',
}

function DeliveryStatusBadge({ status }) {
  const normalizedStatus = String(status || '').trim().toLowerCase()
  const variant = STATUS_TO_VARIANT[normalizedStatus] || 'default'
  const label = STATUS_LABELS[normalizedStatus] || normalizedStatus || 'Sin estado'

  return <Badge variant={variant}>{label}</Badge>
}

export default DeliveryStatusBadge
