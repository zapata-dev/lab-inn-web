# LAB-029 Roles actuales

## Roles demo / de auth actual

| Rol | Tipo | Donde aparece | Uso aparente |
| --- | --- | --- | --- |
| `admin` | Demo | `src/data/mockUsers.js`, `src/utils/roleConfig.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/Unauthorized.jsx`, `src/features/admin/*`, `src/pages/Salesforce.jsx` | Acceso global y dashboard ejecutivo. |
| `direccion` | Demo | `src/data/mockUsers.js`, `src/utils/roleConfig.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/Unauthorized.jsx`, `src/features/dashboard/ExecutiveDashboard.jsx` | Direccion con alcance global. |
| `gerente` | Demo | `src/data/mockUsers.js`, `src/utils/roleConfig.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/CapacitacionSoporte.jsx`, `src/pages/Salesforce.jsx` | Gerencia con alcance por sucursal. |
| `ejecutivo` | Demo | `src/data/mockUsers.js`, `src/utils/roleConfig.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/CapacitacionSoporte.jsx`, `src/pages/Salesforce.jsx` | Ejecutivo comercial con alcance personal o de sucursal segun modulo. |
| `bdcLab` | Demo | `src/data/mockUsers.js`, `src/utils/roleConfig.js`, `src/pages/Home.jsx`, `src/pages/CapacitacionSoporte.jsx`, `src/pages/Salesforce.jsx` | BDC corporativo / LAB. |
| `bdcSucursal` | Demo | `src/data/mockUsers.js`, `src/utils/roleConfig.js`, `src/pages/Home.jsx`, `src/pages/CapacitacionSoporte.jsx`, `src/pages/Salesforce.jsx` | BDC por sucursal. |

## Roles de produccion / solicitud de acceso

| Rol | Tipo | Donde aparece | Uso aparente |
| --- | --- | --- | --- |
| `vendedor` | Produccion | `src/utils/productionRoles.js`, `src/services/userAdminService.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/Unauthorized.jsx`, `src/components/layout/UserMenu.jsx` | Rol solicitado y mostrado en flujos de autorizacion. |
| `coordinador` | Produccion | `src/utils/productionRoles.js`, `src/services/userAdminService.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/Unauthorized.jsx`, `src/components/layout/UserMenu.jsx` | Rol solicitado y mostrado en flujos de autorizacion. |
| `soporte` | Produccion | `src/utils/productionRoles.js`, `src/services/userAdminService.js`, `src/pages/Home.jsx`, `src/pages/Perfil.jsx`, `src/pages/Unauthorized.jsx`, `src/pages/SoporteUsuarios.jsx`, `src/components/layout/UserMenu.jsx` | Rol de soporte y administracion. |

## Nota

- No se proponen roles nuevos. Solo se documentan los existentes.
- La app separa roles demo de roles de produccion, y ambos conjuntos conviven en el codigo actual.
