const PRODUCTION_ROLES = Object.freeze({
  vendedor: 'vendedor',
  coordinador: 'coordinador',
  soporte: 'soporte',
})

const ROLE_LABELS = Object.freeze({
  vendedor: 'Vendedor',
  coordinador: 'Coordinador',
  soporte: 'Soporte',
})

function isValidProductionRole(role) {
  const normalizedRole = String(role ?? '')
    .trim()
    .toLowerCase()

  return Object.values(PRODUCTION_ROLES).includes(normalizedRole)
}

function getProductionRoleLabel(role) {
  const normalizedRole = String(role ?? '')
    .trim()
    .toLowerCase()

  return ROLE_LABELS[normalizedRole] ?? 'Rol invalido'
}

export { PRODUCTION_ROLES, isValidProductionRole, getProductionRoleLabel }