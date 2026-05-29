import { Badge } from '../../../components/common'

const STATUS_TO_VARIANT = {
  procesando: 'warning',
  completado: 'success',
  completado_con_errores: 'warning',
  fallido: 'danger',
}

const STATUS_LABELS = {
  procesando: 'Procesando',
  completado: 'Completado',
  completado_con_errores: 'Con errores',
  fallido: 'Fallido',
}

function ImportStatusBadge({ status }) {
  const normalizedStatus = String(status || '').trim().toLowerCase()
  const variant = STATUS_TO_VARIANT[normalizedStatus] || 'default'
  const label = STATUS_LABELS[normalizedStatus] || normalizedStatus || 'Sin estado'

  return <Badge variant={variant}>{label}</Badge>
}

export default ImportStatusBadge
