import mockInventory from './mockInventory.js'

const salesforceOwnersByBranch = {
  'branch-mty': ['u-carlos-ejecutivo', 'u-ana-gerente', 'u-carlos-ejecutivo', 'u-ana-gerente'],
  'branch-qro': ['u-miguel-bdcsucursal', 'u-ana-gerente'],
  'branch-gdl': ['u-carlos-ejecutivo', 'u-ana-gerente'],
  'branch-cdmx': ['u-valeria-bdclab', 'u-ricardo-dir', 'u-admin-lab'],
  'branch-slp': ['u-miguel-bdcsucursal', 'u-ana-gerente'],
}

const channels = ['WhatsApp', 'Telefono', 'Formulario web', 'Referido', 'Correo']
const leadStages = ['nuevo', 'contactado', 'calificado', 'descartado']
const leadPriorities = ['alta', 'media', 'alta', 'baja']
const opportunityStages = ['prospecto', 'cotizacion', 'negociacion', 'ganada', 'perdida']
const orderStatuses = ['en_proceso', 'aprobado', 'facturado']
const invoiceStatuses = ['pendiente', 'pagada', 'vencida']

const formatId = (prefix, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`

const getOwnerForBranch = (branchId, index) => {
  const branchOwners = salesforceOwnersByBranch[branchId] ?? ['u-ana-gerente']
  return branchOwners[index % branchOwners.length]
}

const getDateInApril = (day) => `2026-04-${String(day).padStart(2, '0')}`
const getDateInMay = (day) => `2026-05-${String(day).padStart(2, '0')}`

export const mockLeads = Array.from({ length: 50 }, (_, index) => {
  const unit = mockInventory[index % mockInventory.length]
  const id = formatId('lead', index)
  const stage = leadStages[index % leadStages.length]
  const estimatedValueUsd = unit.priceUsd + (index % 5) * 1200
  const createdDay = (index % 26) + 1
  const activityDay = Math.min(createdDay + 2, 30)

  return {
    id,
    branchId: unit.branchId,
    ownerId: getOwnerForBranch(unit.branchId, index),
    unitId: unit.id,
    companyName: `Transportes Demo ${String(index + 1).padStart(2, '0')}`,
    contactName: `Contacto ${String(index + 1).padStart(2, '0')}`,
    channel: channels[index % channels.length],
    stage,
    priority: leadPriorities[index % leadPriorities.length],
    estimatedValueUsd,
    createdAt: getDateInApril(createdDay),
    lastActivityAt: getDateInApril(activityDay),
  }
})

export const mockOpportunities = Array.from({ length: 30 }, (_, index) => {
  const lead = mockLeads[index]
  const stage = opportunityStages[index % opportunityStages.length]
  const probabilityByStage = {
    prospecto: 20,
    cotizacion: 45,
    negociacion: 70,
    ganada: 95,
    perdida: 10,
  }

  return {
    id: formatId('opp', index),
    leadId: lead.id,
    branchId: lead.branchId,
    ownerId: lead.ownerId,
    unitId: lead.unitId,
    stage,
    probability: probabilityByStage[stage],
    amountUsd: lead.estimatedValueUsd,
    expectedCloseDate: getDateInMay((index % 26) + 3),
  }
})

export const mockOrders = Array.from({ length: 12 }, (_, index) => {
  const opportunity = mockOpportunities[index]

  return {
    id: formatId('order', index),
    opportunityId: opportunity.id,
    branchId: opportunity.branchId,
    unitId: opportunity.unitId,
    amountUsd: opportunity.amountUsd,
    status: orderStatuses[index % orderStatuses.length],
    createdAt: getDateInApril((index % 20) + 9),
  }
})

export const mockInvoices = Array.from({ length: 8 }, (_, index) => {
  const order = mockOrders[index]

  return {
    id: formatId('invoice', index),
    orderId: order.id,
    branchId: order.branchId,
    amountUsd: order.amountUsd,
    status: invoiceStatuses[index % invoiceStatuses.length],
    issuedAt: getDateInApril((index % 20) + 12),
  }
})

const mockSalesforce = {
  leads: mockLeads,
  opportunities: mockOpportunities,
  orders: mockOrders,
  invoices: mockInvoices,
}

export default mockSalesforce
