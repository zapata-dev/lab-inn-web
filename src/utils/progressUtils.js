export const PROGRESS_WEIGHTS = {
  salesforce: 30,
  chatbots: 15,
  roles: 15,
  procesos: 15,
  herramientas: 10,
  diagnostico: 15,
}

const PROGRESS_LABELS = {
  salesforce: 'Salesforce',
  chatbots: 'Chatbots',
  roles: 'Roles',
  procesos: 'Procesos',
  herramientas: 'Herramientas',
  diagnostico: 'Diagnostico',
}

const toNumber = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export const clampProgress = (value) => {
  const numeric = toNumber(value)
  if (numeric < 0) return 0
  if (numeric > 100) return 100
  return numeric
}

export const computeOverall = (progress = {}) => {
  const weightedSum = Object.entries(PROGRESS_WEIGHTS).reduce((sum, [moduleKey, weight]) => {
    const value = clampProgress(progress[moduleKey] ?? 0)
    return sum + value * (weight / 100)
  }, 0)

  return Math.round(clampProgress(weightedSum))
}

export const getProgressBreakdown = (progress = {}) =>
  Object.entries(PROGRESS_WEIGHTS).map(([moduleKey, weight]) => {
    const value = clampProgress(progress[moduleKey] ?? 0)
    const weightedValue = Number((value * (weight / 100)).toFixed(2))

    return {
      moduleKey,
      label: PROGRESS_LABELS[moduleKey] ?? moduleKey,
      value,
      weight,
      weightedValue,
    }
  })
