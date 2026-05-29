const SCORE_PENALTIES = {
  marca_missing: 15,
  modelo_missing: 15,
  precio_invalido: 10,
  sucursal_missing: 10,
  anio_invalido: 5,
  status_missing: 5,
  fotos_invalidas: 5,
}

export function computeDataQualityScore(unit) {
  let score = 100
  const yearNow = new Date().getFullYear()

  if (!unit.marca || String(unit.marca).trim().length === 0) {
    score -= SCORE_PENALTIES.marca_missing
  }
  if (!unit.modelo || String(unit.modelo).trim().length === 0) {
    score -= SCORE_PENALTIES.modelo_missing
  }
  if (unit.precio == null || unit.precio <= 0) {
    score -= SCORE_PENALTIES.precio_invalido
  }
  if (!unit.sucursalId || String(unit.sucursalId).trim().length === 0) {
    score -= SCORE_PENALTIES.sucursal_missing
  }
  if (unit.anio != null && (unit.anio < 1980 || unit.anio > yearNow + 2)) {
    score -= SCORE_PENALTIES.anio_invalido
  }
  if (!unit.status || String(unit.status).trim().length === 0) {
    score -= SCORE_PENALTIES.status_missing
  }
  if (Array.isArray(unit.fotos) && unit.fotos.length > 0) {
    const invalidCount = unit.fotos.filter((f) => !String(f || '').startsWith('http')).length
    if (invalidCount > 0) {
      score -= SCORE_PENALTIES.fotos_invalidas
    }
  }

  return Math.max(0, Math.min(100, score))
}

export function validateInventoryUnit(unit, rowIndex = 0) {
  const errors = []
  const warnings = []
  const yearNow = new Date().getFullYear()
  const vin = String(unit?.vin || '').trim()

  if (!vin) {
    errors.push({ type: 'vin_missing', field: 'vin', rowIndex })
    return { valid: false, errors, warnings, score: 0 }
  }

  if (vin.length < 5) {
    errors.push({ type: 'vin_too_short', field: 'vin', rowIndex, vin })
    return { valid: false, errors, warnings, score: 0 }
  }

  if (!unit.marca || String(unit.marca).trim().length === 0) {
    warnings.push({ type: 'marca_missing', field: 'marca', rowIndex })
  }

  if (!unit.modelo || String(unit.modelo).trim().length === 0) {
    warnings.push({ type: 'modelo_missing', field: 'modelo', rowIndex })
  }

  if (unit.precio == null || unit.precio <= 0) {
    warnings.push({ type: 'precio_invalido', field: 'precio', rowIndex })
  }

  if (!unit.sucursalId || String(unit.sucursalId).trim().length === 0) {
    warnings.push({ type: 'sucursal_missing', field: 'sucursalId', rowIndex })
  }

  if (unit.anio != null && (unit.anio < 1980 || unit.anio > yearNow + 2)) {
    warnings.push({ type: 'anio_invalido', field: 'anio', rowIndex, anio: unit.anio })
  }

  if (!unit.status || String(unit.status).trim().length === 0) {
    warnings.push({ type: 'status_missing', field: 'status', rowIndex })
  }

  if (Array.isArray(unit.fotos) && unit.fotos.length > 0) {
    const invalidCount = unit.fotos.filter((f) => !String(f || '').startsWith('http')).length
    if (invalidCount > 0) {
      warnings.push({ type: 'fotos_invalidas', field: 'fotos', rowIndex, count: invalidCount })
    }
  }

  const score = computeDataQualityScore(unit)

  return { valid: true, errors, warnings, score }
}

export function summarizeQualityResults(results) {
  const valid = results.filter((r) => r.valid)
  const invalid = results.filter((r) => !r.valid)
  const allWarnings = results.flatMap((r) => r.warnings)
  const scores = valid.map((r) => r.score)
  const promedioScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100

  return {
    filasValidas: valid.length,
    filasInvalidas: invalid.length,
    promedioScore,
    warnings: allWarnings.length,
  }
}

export function groupErrorsByType(errors) {
  const groups = {}
  for (const error of errors) {
    const type = error.type || 'unknown'
    groups[type] = (groups[type] || 0) + 1
  }
  return groups
}

export function groupWarningsByType(warnings) {
  const groups = {}
  for (const warning of warnings) {
    const type = warning.type || 'unknown'
    groups[type] = (groups[type] || 0) + 1
  }
  return groups
}
