import { Badge } from '../../../components/common'

const STATUS_LABELS = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  aprobado: { label: 'Aprobado', variant: 'success' },
  rechazado: { label: 'Rechazado', variant: 'danger' },
  cancelado: { label: 'Cancelado', variant: 'default' },
  activo: { label: 'Activo', variant: 'success' },
  inactivo: { label: 'Inactivo', variant: 'danger' },
}

function UserStatusBadge({ status, active }) {
  if (typeof active === 'boolean') {
    const key = active ? 'activo' : 'inactivo'
    return <Badge variant={STATUS_LABELS[key].variant}>{STATUS_LABELS[key].label}</Badge>
  }

  const key = String(status || 'pendiente').trim().toLowerCase()
  const config = STATUS_LABELS[key] || STATUS_LABELS.pendiente
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default UserStatusBadge
