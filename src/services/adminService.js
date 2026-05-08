import { getFromStorage, removeFromStorage } from './storage'

export const LAB_STORAGE_KEYS = [
  'auth',
  'cotizadorContext',
  'quoteDraft',
  'quotes',
  'sfOpportunities',
  'sfFollowUps',
  'sfTasks',
  'trainingWatched',
  'trainingDiagnosticResults',
  'supportTicketUpdates',
]

export function getStorageKeyStatus(key) {
  const fullKey = `lab:v1:${key}`
  const value = getFromStorage(key, null)
  // Direct getItem needed: getFromStorage can't distinguish "key missing" from "key = null"
  const rawItem = window.localStorage.getItem(fullKey)
  const exists = rawItem !== null

  let type = 'missing'
  let count = null

  if (exists) {
    if (value === null) {
      type = 'null'
    } else if (Array.isArray(value)) {
      type = 'array'
      count = value.length
    } else if (typeof value === 'object') {
      type = 'object'
      count = Object.keys(value).length
    } else {
      type = typeof value
    }
  }

  return { key, fullKey, exists, type, count }
}

export function getStorageSnapshot() {
  return LAB_STORAGE_KEYS.map(getStorageKeyStatus)
}

export function clearDemoStorage({ keepAuth = true } = {}) {
  const keysToClear = keepAuth
    ? LAB_STORAGE_KEYS.filter((k) => k !== 'auth')
    : LAB_STORAGE_KEYS
  keysToClear.forEach((key) => removeFromStorage(key))
  return getStorageSnapshot()
}
