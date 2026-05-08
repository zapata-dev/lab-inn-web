import { getFromStorage, setToStorage } from './storage'

const TICKET_UPDATES_KEY = 'supportTicketUpdates'

export function getTicketUpdates() {
  const data = getFromStorage(TICKET_UPDATES_KEY, {})
  return typeof data === 'object' && data !== null ? data : {}
}

export function updateTicketStatus(ticketId, newStatus) {
  const updates = getTicketUpdates()
  setToStorage(TICKET_UPDATES_KEY, {
    ...updates,
    [ticketId]: { status: newStatus, updatedAt: new Date().toISOString() },
  })
}
