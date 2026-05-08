import { getScope } from './roleConfig.js'

const ensureArray = (items) => (Array.isArray(items) ? items : [])

export const filterByUser = (items, user, key = 'ownerId') => {
  const safeItems = ensureArray(items)

  if (!user?.id) {
    return []
  }

  return safeItems.filter((item) => item?.[key] === user.id)
}

export const filterByBranch = (items, branchId, key = 'branchId') => {
  const safeItems = ensureArray(items)

  if (!branchId) {
    return []
  }

  return safeItems.filter((item) => item?.[key] === branchId)
}

export const filterByScope = (items, role, user, key = 'branchId') => {
  const safeItems = ensureArray(items)
  const scope = getScope(role)

  if (!user || !scope || scope === 'none') {
    return []
  }

  if (scope === 'global' || scope === 'corp') {
    return [...safeItems]
  }

  if (scope === 'branch') {
    return filterByBranch(safeItems, user.branchId, key)
  }

  if (scope === 'self') {
    return safeItems.filter((item) => item?.ownerId === user.id || item?.userId === user.id)
  }

  return []
}
