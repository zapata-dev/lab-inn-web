import { useEffect, useMemo, useState } from 'react'
import { getFromStorage, setToStorage } from '../services/storage'

function getUserStorageKey(user) {
  return String(user?.uid || user?.email || user?.id || 'anon').trim().toLowerCase()
}

function getFavoritesStorageKey(user) {
  return `favorites:${getUserStorageKey(user)}`
}

function useFavorites(user) {
  const storageKey = useMemo(
    () => getFavoritesStorageKey(user),
    [user?.uid, user?.email, user?.id]
  )
  const [favoriteIds, setFavoriteIds] = useState([])

  useEffect(() => {
    try {
      const storedFavorites = getFromStorage(storageKey, [])
      setFavoriteIds(Array.isArray(storedFavorites) ? storedFavorites : [])
    } catch {
      setFavoriteIds([])
    }
  }, [storageKey])

  const persistFavorites = (nextFavoriteIds) => {
    try {
      setToStorage(storageKey, nextFavoriteIds)
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }

  const toggleFavorite = (itemId) => {
    setFavoriteIds((previousFavoriteIds) => {
      const nextFavoriteIds = previousFavoriteIds.includes(itemId)
        ? previousFavoriteIds.filter((favoriteId) => favoriteId !== itemId)
        : [...previousFavoriteIds, itemId]

      persistFavorites(nextFavoriteIds)
      return nextFavoriteIds
    })
  }

  const clearFavorites = () => {
    setFavoriteIds([])
    persistFavorites([])
  }

  return {
    clearFavorites,
    favoriteIds,
    storageKey,
    toggleFavorite,
  }
}

export { getFavoritesStorageKey }
export default useFavorites
