# LAB-029 Smoke test actual

## Escenario

Hacer el smoke test con un usuario demo, por ejemplo `Admin LAB`, desde el estado actual del repo.

## Pasos y resultado esperado

| Paso | Accion | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir `/login` | Se ve la pantalla de acceso y el indicador de modo demo o Firebase segun variables. |
| 2 | Entrar con un usuario demo | La app redirige a `/` y carga el dashboard actual. |
| 3 | Revisar Topbar, Sidebar y BottomNav | Se renderizan los controles de layout y el boton de logout fijo del `ProtectedRoute`. |
| 4 | Ir a `/inventario` | Carga el inventario nacional con filtros, actualizacion y exportacion PDF. |
| 5 | Ir a `/promociones` | Carga el catalogo de promociones. |
| 6 | Ir a `/catalogo-portadas` | Carga el catalogo de publicidad / portadas. |
| 7 | Ir a `/youtube` y luego `/canal-youtube` | Ambas rutas muestran el canal de YouTube y el alias resuelve a la misma vista. |
| 8 | Ir a `/usuarios` | Carga el modulo de usuarios autorizados si se esta autenticado. |
| 9 | Ir a `/soporte/usuarios` | Carga el panel de soporte de usuarios si se esta autenticado. |
| 10 | Ir a `/perfil` | Carga el perfil del usuario actual. |
| 11 | Cerrar sesion | La app vuelve a `/login`. |

## Chequeo adicional de navegacion

- Validar manualmente los items de navegacion que apuntan a `/inicio`, `/herramientas`, `/capacitacion` y `/salesforce`.
- En este baseline esas rutas no estan registradas en `AppRoutes.jsx`, asi que el comportamiento observable debe documentarse tal como aparezca en la app.

## Resultado esperado por pantalla

- Login: selector de usuario demo o boton de Google segun ambiente.
- Home: dashboard principal y resumen de resultados.
- Inventario: marketplace nacional con filtros y exportacion.
- Promociones: catalogo comercial vigente.
- Catalogo de portadas: biblioteca de materiales.
- YouTube: playlists y accesos a contenido de capacitacion.
- Usuarios / soporte usuarios: paneles administrativos y de soporte.
- Perfil: informacion del usuario autenticado.
- Logout: retorno al login sin sesion activa.
