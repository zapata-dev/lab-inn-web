# LAB-031 Stash Review

- Fecha: 2026-06-04
- Rama: `chore/LAB-031-review-lab-028-stash`
- Stash revisado: `stash@{0}`
- Evidencia: `docs/reviews/LAB-031-lab-028-stash.patch`

## Tabla de archivos del stash

| Archivo | Tipo de cambio | Riesgo | Decisión sugerida | Motivo |
| --- | --- | --- | --- | --- |
| `README.md` | Documentación | Bajo | Aplicado | Actualiza el alcance al estado real actual y elimina una referencia vieja a `config/`. |
| `src/data/mockAccessLinks.js` | Datos mock + limpieza | Bajo | Aplicado | Elimina `resultMetrics`, que quedó huérfano tras retirar `Inicio.jsx`, y mantiene accesos vigentes. |
| `src/routes/AppRoutes.jsx` | Rutas | Alto | Descartado | LAB-030 ya alineó rutas; re-aplicar este cambio arriesga romper `/inicio`, `/herramientas`, `/capacitacion` o `/salesforce`. |
| `src/pages/Inicio.jsx` | Eliminación | Bajo | Aplicado | No está referenciado por rutas activas ni por imports actuales. |
| `src/pages/InventarioNacional.jsx` | Eliminación | Bajo | Aplicado | No está referenciado por rutas activas ni por imports actuales. |
| `src/pages/_DesignSystem.jsx` | Eliminación | Bajo | Aplicado | Página huérfana sin rutas o imports activos. |
| `src/features/dashboard/BdcDashboardStub.jsx` | Eliminación | Bajo | Aplicado | Solo era usada por `Inicio.jsx`, que ya quedó fuera de alcance. |

## Hallazgos clave

- El stash trae limpieza útil, pero `AppRoutes.jsx` es el punto sensible y se debe mantener tal como quedó en LAB-030.
- `resultMetrics` ya no tiene consumidores después de eliminar `Inicio.jsx`, así que su retiro es coherente.
- Las páginas eliminadas están huérfanas en el estado actual de `main`.

## Validación

- `npm run lint`: 11 warnings, 0 errores
- `npm run build`: exitoso, con warning de chunk grande de Vite
- Smoke test: exitoso, rutas clave respondieron `200`

## Smoke test

- `/`
- `/login`
- `/inicio`
- `/herramientas`
- `/capacitacion`
- `/salesforce`
- `/youtube`
- `/usuarios`
- `/soporte/usuarios`
- `/perfil`

## Confirmación

- `stash@{0}` sigue existiendo y no fue borrado.
