import { Badge } from '../../components/common'
import { getRequestStatusLabel } from '../../utils/requestStatus'

const variantByStatus = {
  nueva: 'info',
  en_negociacion: 'warning',
  aprobada: 'success',
  rechazada: 'danger',
  cancelada: 'default',
  cerrada: 'default',
}

function RequestStatusBadge({ status }) {
  const normalizedStatus = String(status ?? '').trim()
  return <Badge variant={variantByStatus[normalizedStatus] ?? 'default'}>{getRequestStatusLabel(status)}</Badge>
}

export default RequestStatusBadge
