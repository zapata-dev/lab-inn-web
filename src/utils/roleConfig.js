export const ROLES = {
  admin: 'admin',
  direccion: 'direccion',
  gerente: 'gerente',
  ejecutivo: 'ejecutivo',
  bdcLab: 'bdcLab',
  bdcSucursal: 'bdcSucursal',
}

export const ROLE_CAPS = {
  admin: { canEdit: true, scope: 'global', dashboardVariant: 'executive' },
  direccion: { canEdit: false, scope: 'global', dashboardVariant: 'executive' },
  gerente: { canEdit: true, scope: 'branch', dashboardVariant: 'manager' },
  ejecutivo: { canEdit: true, scope: 'self', dashboardVariant: 'sales' },
  bdcLab: { canEdit: true, scope: 'corp', dashboardVariant: 'bdcLab' },
  bdcSucursal: { canEdit: true, scope: 'branch', dashboardVariant: 'bdcSucursal' },
}

const fallbackCapabilities = {
  canEdit: false,
  scope: 'none',
  dashboardVariant: 'sales',
}

export const getRoleCapabilities = (role) => ROLE_CAPS[role] ?? fallbackCapabilities

export const canEdit = (role) => Boolean(getRoleCapabilities(role).canEdit)

export const getScope = (role) => getRoleCapabilities(role).scope

export const getDashboardVariant = (role) => getRoleCapabilities(role).dashboardVariant
