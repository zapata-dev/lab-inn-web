export const PRODUCTION_ROLES = {
  vendedor: {
    label: 'Vendedor',
    scope: 'self',
    defaultRoute: '/inicio',
  },
  coordinador: {
    label: 'Coordinador',
    scope: 'branch',
    defaultRoute: '/inicio',
  },
  soporte: {
    label: 'Soporte',
    scope: 'global',
    defaultRoute: '/inicio',
  },
}

export function isValidProductionRole(role) {
  return Boolean(PRODUCTION_ROLES[String(role ?? '').trim().toLowerCase()])
}

export function getProductionRoleLabel(role) {
  const normalizedRole = String(role ?? '').trim().toLowerCase()
  return PRODUCTION_ROLES[normalizedRole]?.label ?? 'Sin rol'
}

export function getProductionRoleScope(role) {
  const normalizedRole = String(role ?? '').trim().toLowerCase()
  return PRODUCTION_ROLES[normalizedRole]?.scope ?? 'none'
}

export function getDefaultRouteForRole(role) {
  const normalizedRole = String(role ?? '').trim().toLowerCase()
  return PRODUCTION_ROLES[normalizedRole]?.defaultRoute ?? '/inicio'
}
