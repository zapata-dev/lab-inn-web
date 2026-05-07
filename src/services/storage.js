const NS = 'lab:v1:'

function getStorageKey(key) {
  return `${NS}${key}`
}

function getFromStorage(key, fallbackValue = null) {
  const fullKey = getStorageKey(key)

  try {
    const raw = window.localStorage.getItem(fullKey)
    if (raw === null) {
      return fallbackValue
    }
    return JSON.parse(raw)
  } catch (error) {
    return fallbackValue
  }
}

function setToStorage(key, value) {
  const fullKey = getStorageKey(key)
  const serialized = JSON.stringify(value)
  window.localStorage.setItem(fullKey, serialized)
}

function removeFromStorage(key) {
  const fullKey = getStorageKey(key)
  window.localStorage.removeItem(fullKey)
}

function clearLabStorage() {
  const keysToRemove = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key?.startsWith(NS)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => {
    window.localStorage.removeItem(key)
  })
}

function resetDemo() {
  clearLabStorage()
}

export { NS, getStorageKey, getFromStorage, setToStorage, removeFromStorage, clearLabStorage, resetDemo }
