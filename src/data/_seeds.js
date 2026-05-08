import mockBranches from './mockBranches.js'
import mockUsers from './mockUsers.js'
import mockInventory from './mockInventory.js'
import mockSalesforce from './mockSalesforce.js'
import mockTraining from './mockTraining.js'
import mockSupport from './mockSupport.js'
import mockProgress from './mockProgress.js'

export const seedData = {
  branches: mockBranches,
  users: mockUsers,
  inventory: mockInventory,
  salesforce: mockSalesforce,
  training: mockTraining,
  support: mockSupport,
  progress: mockProgress,
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
  const userIds = new Set(seedData.users.map((user) => user.id))
  const inventoryIds = new Set(seedData.inventory.map((unit) => unit.id))
  const leadIds = new Set(seedData.salesforce.leads.map((lead) => lead.id))
  const opportunityIds = new Set(seedData.salesforce.opportunities.map((opp) => opp.id))
  const orderIds = new Set(seedData.salesforce.orders.map((order) => order.id))
  const routeIds = new Set(seedData.training.routes.map((route) => route.id))
  const videoIds = new Set(seedData.training.videos.map((video) => video.id))

  errors.push(...getDuplicateIds(seedData.branches, 'branch'))
  errors.push(...getDuplicateIds(seedData.users, 'user'))
  errors.push(...getDuplicateIds(seedData.inventory, 'inventory unit'))
  errors.push(...getDuplicateIds(seedData.salesforce.leads, 'lead'))
  errors.push(...getDuplicateIds(seedData.salesforce.opportunities, 'opportunity'))
  errors.push(...getDuplicateIds(seedData.salesforce.orders, 'order'))
  errors.push(...getDuplicateIds(seedData.salesforce.invoices, 'invoice'))
  errors.push(...getDuplicateIds(seedData.training.routes, 'training route'))
  errors.push(...getDuplicateIds(seedData.training.videos, 'training video'))
  errors.push(...getDuplicateIds(seedData.support.tickets, 'support ticket'))
  errors.push(...getDuplicateIds(seedData.support.faqs, 'faq'))
  errors.push(...getDuplicateIds(seedData.progress.map((entry) => ({ id: entry.userId })), 'progress user'))

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

  seedData.salesforce.leads.forEach((lead) => {
    if (!branchIds.has(lead.branchId)) {
      errors.push(`Lead ${lead.id} references unknown branchId: ${lead.branchId}`)
    }

    if (!userIds.has(lead.ownerId)) {
      errors.push(`Lead ${lead.id} references unknown ownerId: ${lead.ownerId}`)
    }

    if (!inventoryIds.has(lead.unitId)) {
      errors.push(`Lead ${lead.id} references unknown unitId: ${lead.unitId}`)
    }
  })

  seedData.salesforce.opportunities.forEach((opportunity) => {
    if (!leadIds.has(opportunity.leadId)) {
      errors.push(`Opportunity ${opportunity.id} references unknown leadId: ${opportunity.leadId}`)
    }

    if (!inventoryIds.has(opportunity.unitId)) {
      errors.push(`Opportunity ${opportunity.id} references unknown unitId: ${opportunity.unitId}`)
    }

    if (!userIds.has(opportunity.ownerId)) {
      errors.push(`Opportunity ${opportunity.id} references unknown ownerId: ${opportunity.ownerId}`)
    }
  })

  seedData.salesforce.orders.forEach((order) => {
    if (!opportunityIds.has(order.opportunityId)) {
      errors.push(`Order ${order.id} references unknown opportunityId: ${order.opportunityId}`)
    }

    if (!inventoryIds.has(order.unitId)) {
      errors.push(`Order ${order.id} references unknown unitId: ${order.unitId}`)
    }
  })

  seedData.salesforce.invoices.forEach((invoice) => {
    if (!orderIds.has(invoice.orderId)) {
      errors.push(`Invoice ${invoice.id} references unknown orderId: ${invoice.orderId}`)
    }
  })

  seedData.training.videos.forEach((video) => {
    if (!routeIds.has(video.routeId)) {
      errors.push(`Video ${video.id} references unknown routeId: ${video.routeId}`)
    }
  })

  seedData.training.routes.forEach((route) => {
    route.videoIds.forEach((videoId) => {
      if (!videoIds.has(videoId)) {
        errors.push(`Route ${route.id} references unknown videoId: ${videoId}`)
      }
    })
  })

  seedData.support.tickets.forEach((ticket) => {
    if (!userIds.has(ticket.userId)) {
      errors.push(`Ticket ${ticket.id} references unknown userId: ${ticket.userId}`)
    }

    if (!branchIds.has(ticket.branchId)) {
      errors.push(`Ticket ${ticket.id} references unknown branchId: ${ticket.branchId}`)
    }
  })

  seedData.progress.forEach((entry) => {
    if (!userIds.has(entry.userId)) {
      errors.push(`Progress entry references unknown userId: ${entry.userId}`)
    }

    entry.completedVideos.forEach((videoId) => {
      if (!videoIds.has(videoId)) {
        errors.push(`Progress user ${entry.userId} references unknown videoId: ${videoId}`)
      }
    })

    ;[
      entry.salesforce,
      entry.chatbots,
      entry.roles,
      entry.procesos,
      entry.herramientas,
      entry.diagnostico,
      entry.lastDiagnosticScore,
    ].forEach((value) => {
      if (value < 0 || value > 100) {
        errors.push(`Progress user ${entry.userId} has out-of-range value: ${value}`)
      }
    })
  })

  return {
    ok: errors.length === 0,
    errors,
  }
}
