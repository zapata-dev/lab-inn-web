# LAB-036 - Route Permissions Current Scope

## Summary

I audited the current routes and added a minimal role gate for the sensitive support panel without creating new roles, routes, or modules.

## Current roles found

### Production roles

- `vendedor`
- `coordinador`
- `soporte`

### Demo roles

- `admin`
- `direccion`
- `gerente`
- `ejecutivo`
- `bdcLab`
- `bdcSucursal`

## Routes audited

| Route | Component | Public/Protected | Sensitive | Current access | Recommendation |
| ---- | ---- | ---- | ---- | ---- | ---- |
| `/` | `Home` | Protected | No | Session only | Keep as is |
| `/login` | `Login` | Public | No | Public | Keep public |
| `/inicio` | `Home` | Protected | No | Session only | Keep as is |
| `/herramientas` | `HerramientasComerciales` | Protected | No | Session only | Keep as is |
| `/capacitacion` | `CapacitacionSoporte` | Protected | No | Session only | Keep as is |
| `/salesforce` | `Salesforce` | Protected | No | Session only | Keep as is |
| `/youtube` | `CanalYoutube` | Protected | No | Session only | Keep as is |
| `/canal-youtube` | `Navigate -> /youtube` | Protected | No | Session only | Keep as is |
| `/inventario` | `Inventario` | Protected | No | Session only | Keep as is |
| `/promociones` | `Promociones` | Protected | No | Session only | Keep as is |
| `/catalogo-portadas` | `CatalogoPortadas` | Protected | No | Session only | Keep as is |
| `/usuarios` | `Usuarios` | Protected | Low | Session only | Keep session-only; it is a directory screen, not an admin panel |
| `/soporte/usuarios` | `SoporteUsuarios` | Protected | Yes | Session only before this ticket | Restrict to `soporte` |
| `/perfil` | `Perfil` | Protected | No | Session only | Keep as is |
| `/unauthorized` | `Unauthorized` | Public | No | Public | Keep public |

## Changes applied

- Extended `src/routes/ProtectedRoute.jsx` with an optional `allowedRoles` prop.
- Applied the role gate to `/soporte/usuarios` only.
- Kept `/usuarios` as a session-protected directory page because the current code treats it as an internal contact directory and does not expose a finer permission signal.
- Updated the current-scope docs and smoke test to describe the route behavior clearly.

## Changes not applied

- No new roles were created.
- No existing roles were renamed.
- No routes were changed.
- No Firestore rules were touched.
- No libraries were installed.
- No RBAC matrix was invented.
- No nav item was removed.

## How to validate

1. Run `npm run lint`.
2. Run `npm run build`.
3. Open the app and log in with any authenticated user.
4. Verify `/usuarios` loads for any authenticated user.
5. Verify `/soporte/usuarios` loads only for `soporte`.
6. Verify a non-support user is redirected to `/unauthorized` when opening `/soporte/usuarios`.
7. Verify `/login` and `/unauthorized` still work publicly.

## Known limitations

- The current app still does not have a full route-permission matrix.
- Demo users still exist in `mockUsers`, so demo-only access patterns can differ from production.
- `/usuarios` remains session-only because the repository does not currently expose a separate current-scope permission rule for that page.

## Validation

- `npm run lint`: 11 warnings, 0 errors.
- `npm run build`: OK, with the usual Vite large chunk warning.

