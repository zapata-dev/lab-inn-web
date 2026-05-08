import { getFromStorage, setToStorage } from './storage'

const FOLLOWUPS_KEY = 'sfFollowUps'
const TASKS_KEY = 'sfTasks'

export function getFollowUps(entityId) {
  const all = getFromStorage(FOLLOWUPS_KEY, [])
  return entityId ? all.filter((f) => f.entityId === entityId) : all
}

export function markFollowUp(entityId) {
  const all = getFromStorage(FOLLOWUPS_KEY, [])
  const entry = { id: `fu-${Date.now()}`, entityId, at: new Date().toISOString() }
  setToStorage(FOLLOWUPS_KEY, [...all, entry])
  return entry
}

export function getTasks(entityId) {
  const all = getFromStorage(TASKS_KEY, [])
  return entityId ? all.filter((t) => t.entityId === entityId) : all
}

export function addTask({ entityId, text }) {
  const all = getFromStorage(TASKS_KEY, [])
  const task = { id: `task-${Date.now()}`, entityId, text: text.trim(), createdAt: new Date().toISOString() }
  setToStorage(TASKS_KEY, [...all, task])
  return task
}
