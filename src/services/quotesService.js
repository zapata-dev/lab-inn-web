import { getFromStorage, removeFromStorage, setToStorage } from './storage'

export const QUOTES_KEY = 'quotes'
export const QUOTE_CONTEXT_KEY = 'cotizadorContext'
export const SF_OPPORTUNITIES_KEY = 'sfOpportunities'
const QUOTE_DRAFT_KEY = 'quoteDraft'

export function getQuoteContext() {
  return getFromStorage(QUOTE_CONTEXT_KEY, null)
}

export function clearQuoteContext() {
  removeFromStorage(QUOTE_CONTEXT_KEY)
}

export function getQuotes() {
  const quotes = getFromStorage(QUOTES_KEY, [])
  return Array.isArray(quotes) ? quotes : []
}

export function saveQuoteDraft(draft) {
  const safeDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  }

  setToStorage(QUOTE_DRAFT_KEY, safeDraft)
  return safeDraft
}

export function getQuoteDraft() {
  return getFromStorage(QUOTE_DRAFT_KEY, null)
}

function generateFolio(existingQuotes) {
  const year = new Date().getFullYear()
  const seq = String(existingQuotes.length + 1).padStart(3, '0')
  return `COT-${year}-${seq}`
}

export function finalizeQuote(draft) {
  const quotes = getQuotes()
  const folio = generateFolio(quotes)
  const finalQuote = {
    ...draft,
    folio,
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
  }
  setToStorage(QUOTES_KEY, [...quotes, finalQuote])
  removeFromStorage(QUOTE_DRAFT_KEY)
  return finalQuote
}

export function getSimulatedOpportunities() {
  const opportunities = getFromStorage(SF_OPPORTUNITIES_KEY, [])
  return Array.isArray(opportunities) ? opportunities : []
}

export function createSimulatedOpportunity({ quote, userId, branchId }) {
  const opportunities = getSimulatedOpportunities()
  const opportunity = {
    id: `sf-opp-${Date.now()}`,
    sourceQuoteId: quote.folio,
    unitId: quote.selectedUnitId,
    ownerId: userId,
    branchId,
    companyName: quote.client?.companyName ?? '',
    contactName: quote.client?.contactName ?? '',
    stage: 'cotizacion',
    probability: 45,
    amountUsd: quote.totals?.total ?? 0,
    createdAt: new Date().toISOString(),
    closedAt: null,
    notes: `Generada desde cotizador. Folio: ${quote.folio}`,
  }
  setToStorage(SF_OPPORTUNITIES_KEY, [...opportunities, opportunity])
  return opportunity
}
