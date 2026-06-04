# LAB-030 Align Navigation Routes

## Rutas encontradas en `AppRoutes.jsx`

- `/`
- `/inicio`
- `/catalogo-portadas`
- `/herramientas`
- `/capacitacion`
- `/inventario`
- `/promociones`
- `/perfil`
- `/youtube`
- `/canal-youtube`
- `/salesforce`
- `/usuarios`
- `/soporte/usuarios`
- `/login`
- `/unauthorized`

## Links rotos encontrados

- Ninguno despues del ajuste.
- Antes del fix, `Sidebar`, `BottomNav` y accesos internos de la app apuntaban a `/inicio`, `/herramientas`, `/capacitacion` y `/salesforce` sin rutas registradas en `AppRoutes.jsx`.

## Correccion aplicada

- Se registro `/inicio` con `Home`.
- Se registro `/herramientas` con `HerramientasComerciales`.
- Se registro `/capacitacion` con `CapacitacionSoporte`.
- Se registro `/salesforce` con `Salesforce`.
- No se tocaron roles, AuthContext, Firestore Rules ni contenido funcional de los modulos.

## Archivos modificados

- `src/routes/AppRoutes.jsx`
- `docs/fixes/LAB-030-align-navigation-routes.md`

## Pruebas manuales

- Verificar login y entrada a home.
- Hacer clic en cada item de `Sidebar`.
- Hacer clic en cada item de `BottomNav`.
- Validar accesos internos que usan `navigate(...)` hacia `/inicio`, `/herramientas`, `/capacitacion` y `/salesforce`.
- Refrescar cada ruta corregida y confirmar que no cae en 404.

## Riesgos restantes

- `Topbar`, `Sidebar` y `BottomNav` quedan alineados con el router, pero la app sigue teniendo warnings de lint por Tailwind shorthand en soporte de usuarios.
- El bundle de build sigue generando un chunk grande, sin afectar la ejecucion.
