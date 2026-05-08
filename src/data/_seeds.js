import mockBranches from './mockBranches.js'
import mockUsers from './mockUsers.js'
import mockInventory from './mockInventory.js'

export const seedData = {
  branches: mockBranches,
  users: mockUsers,
  inventory: mockInventory,
}

const getDuplicateIds = (items, entityName) => {
  const seen = new Set()
  const duplicates = new Set()

  items.forEach((item) => {
    if (seen.has(item.id)) {
      duplicates.add(item.id)
      return
    }

    seen.add(item.id)
  })

  return [...duplicates].map((id) => `Duplicate ${entityName} id detected: ${id}`)
}

export const validateSeedData = () => {
  const errors = []
  const branchIds = new Set(seedData.branches.map((branch) => branch.id))

  errors.push(...getDuplicateIds(seedData.branches, 'branch'))
  errors.push(...getDuplicateIds(seedData.users, 'user'))
  errors.push(...getDuplicateIds(seedData.inventory, 'inventory unit'))

  seedData.users.forEach((user) => {
    if (!branchIds.has(user.branchId)) {
      errors.push(`User ${user.id} references unknown branchId: ${user.branchId}`)
    }
  })

  seedData.inventory.forEach((unit) => {
    if (!branchIds.has(unit.branchId)) {
      errors.push(`Inventory ${unit.id} references unknown branchId: ${unit.branchId}`)
    }
  })

  return {
    ok: errors.length === 0,
    errors,
  }
}
