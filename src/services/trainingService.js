import { getFromStorage, setToStorage } from './storage'

const WATCHED_KEY = 'trainingWatched'
const DIAGNOSTIC_KEY = 'trainingDiagnosticResults'

export function getWatchedVideos() {
  const data = getFromStorage(WATCHED_KEY, {})
  return typeof data === 'object' && data !== null ? data : {}
}

export function markVideoWatched(videoId) {
  const watched = getWatchedVideos()
  if (watched[videoId]) return false
  setToStorage(WATCHED_KEY, { ...watched, [videoId]: true })
  return true
}

export function getDiagnosticResults(diagnosticId) {
  const all = getFromStorage(DIAGNOSTIC_KEY, [])
  return diagnosticId ? all.filter((r) => r.diagnosticId === diagnosticId) : all
}

export function saveDiagnosticResult({ diagnosticId, score, totalQuestions }) {
  const all = getFromStorage(DIAGNOSTIC_KEY, [])
  const entry = {
    id: `dr-${Date.now()}`,
    diagnosticId,
    score,
    totalQuestions,
    answeredAt: new Date().toISOString(),
  }
  setToStorage(DIAGNOSTIC_KEY, [...all, entry])
  return entry
}
