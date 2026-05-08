import { getFromStorage, setToStorage } from './storage'

const QUOTE_CONTEXT_KEY = 'cotizadorContext'
const SIMULATED_OPPORTUNITIES_KEY = 'sfOpportunities'

const createUnitSnapshot = (unit) => ({
  id: unit?.id,
  brand: unit?.brand,
  model: unit?.model,
  year: unit?.year,
  priceUsd: unit?.priceUsd,
  branchId: unit?.branchId,
  configuration: unit?.configuration,
  engine: unit?.engine,
  transmission: unit?.transmission,
})

export function saveQuoteContext(unit, user) {
  if (!unit || !user) {
    return null
  }

  const context = {
    source: 'inventory',
    unitId: unit.id,
    unitSnapshot: createUnitSnapshot(unit),
    userId: user.id,
    branchId: user.branchId,
    createdAt: new Date().toISOString(),
  }

  setToStorage(QUOTE_CONTEXT_KEY, context)
  return context
}

export function createSimulatedOpportunityFromUnit(unit, user) {
  if (!unit || !user) {
    return null
  }

  const opportunities = getFromStorage(SIMULATED_OPPORTUNITIES_KEY, [])
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : []

  const opportunity = {
    id: `opp-sim-${Date.now()}`,
    source: 'inventory',
    unitId: unit.id,
    branchId: unit.branchId,
    ownerId: user.id,
    stage: 'cotizacion',
    probability: 35,
    amountUsd: unit.priceUsd,
    status: 'simulated',
    createdAt: new Date().toISOString(),
    title: `Cotizacion ${unit.brand} ${unit.model}`,
  }

  setToStorage(SIMULATED_OPPORTUNITIES_KEY, [...safeOpportunities, opportunity])
  return opportunity
}

export function getSimulatedOpportunities() {
  const opportunities = getFromStorage(SIMULATED_OPPORTUNITIES_KEY, [])
  return Array.isArray(opportunities) ? opportunities : []
}
