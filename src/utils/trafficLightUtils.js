const toScore = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }

  if (numeric < 0) return 0
  if (numeric > 100) return 100
  return numeric
}

export const computeTrafficLight = (score, options = {}) => {
  const safeScore = toScore(score)
  const hasCriticalPending = Boolean(options.hasCriticalPending)
  const overdueTickets = Number.isFinite(Number(options.overdueTickets)) ? Number(options.overdueTickets) : 0

  let status = 'rojo'

  if (safeScore >= 80) {
    status = 'verde'
  } else if (safeScore >= 50) {
    status = 'amarillo'
  }

  if ((hasCriticalPending || overdueTickets > 0) && status === 'verde') {
    status = 'amarillo'
  }

  return status
}

const TRAFFIC_LIGHT_META = {
  verde: {
    status: 'verde',
    label: 'Verde',
    description: 'Desempeno saludable y dentro de objetivo.',
    tone: 'success',
  },
  amarillo: {
    status: 'amarillo',
    label: 'Amarillo',
    description: 'Requiere seguimiento para evitar deterioro.',
    tone: 'warning',
  },
  rojo: {
    status: 'rojo',
    label: 'Rojo',
    description: 'Nivel critico, requiere accion inmediata.',
    tone: 'danger',
  },
}

export const getTrafficLightMeta = (status) => TRAFFIC_LIGHT_META[status] ?? TRAFFIC_LIGHT_META.rojo
