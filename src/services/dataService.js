import { seedData, validateSeedData } from '../data/_seeds'

export const dataService = {
  getBranches: () => Promise.resolve(seedData.branches),
  getUsers: () => Promise.resolve(seedData.users),
  getInventory: () => Promise.resolve(seedData.inventory),
  getSalesforce: () => Promise.resolve(seedData.salesforce),
  getLeads: () => Promise.resolve(seedData.salesforce.leads),
  getOpportunities: () => Promise.resolve(seedData.salesforce.opportunities),
  getOrders: () => Promise.resolve(seedData.salesforce.orders),
  getInvoices: () => Promise.resolve(seedData.salesforce.invoices),
  getTraining: () => Promise.resolve(seedData.training),
  getSupport: () => Promise.resolve(seedData.support),
  getProgress: () => Promise.resolve(seedData.progress),
  getProgressByUser: (userId) =>
    Promise.resolve(seedData.progress.find((progressEntry) => progressEntry.userId === userId) ?? null),
  getSeedValidation: () => Promise.resolve(validateSeedData()),
}
