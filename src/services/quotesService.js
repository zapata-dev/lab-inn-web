import { getFromStorage, removeFromStorage, setToStorage } from './storage'

export const QUOTES_KEY = 'quotes'
export const QUOTE_CONTEXT_KEY = 'cotizadorContext'
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
