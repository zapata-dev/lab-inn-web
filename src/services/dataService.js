import { seedData, validateSeedData } from '../data/_seeds'

export const dataService = {
  getBranches: () => Promise.resolve(seedData.branches),
  getUsers: () => Promise.resolve(seedData.users),
  getInventory: () => Promise.resolve(seedData.inventory),
  getSeedValidation: () => Promise.resolve(validateSeedData()),
}
