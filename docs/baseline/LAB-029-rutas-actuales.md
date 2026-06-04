# LAB-029 Rutas actuales

## Rutas registradas en `src/routes/AppRoutes.jsx`

| Ruta | Componente | Requiere login | Tipo | Observaciones |
| --- | --- | --- | --- | --- |
| `/login` | `Login` | No | Auth | Pantalla de acceso demo o Firebase. |
| `/unauthorized` | `Unauthorized` | No | Auth | Pantalla publica para rechazos de autorizacion. |
| `/` | `Home` | Si | Principal | Landing interna despues del login. |
| `/catalogo-portadas` | `CatalogoPortadas` | Si | Secundaria | Catalogo de publicidad y portadas. |
| `/inventario` | `Inventario` | Si | Principal | Inventario nacional. |
| `/promociones` | `Promociones` | Si | Principal | Catalogo de promociones. |
| `/perfil` | `Perfil` | Si | Cuenta | Perfil del usuario autenticado. |
| `/youtube` | `CanalYoutube` | Si | Secundaria | Canal de playlists y tutoriales. |
| `/canal-youtube` | `Navigate -> /youtube` | Si | Alias | Alias legado hacia la ruta actual de YouTube. |
| `/usuarios` | `Usuarios` | Si | Administrativa | Directorio de contactos/usuarios autorizados. |
| `/soporte/usuarios` | `SoporteUsuarios` | Si | Administrativa | Panel de soporte y administracion de usuarios. |

## Observaciones

- `Sidebar`, `BottomNav` y `Topbar` referencian `/inicio`, `/herramientas`, `/capacitacion` y `/salesforce`, pero esas rutas no estan registradas en `AppRoutes.jsx` en este baseline.
- Esa diferencia entre navegacion y routing es un riesgo actual que queda documentado, no corregido.
- No se proponen rutas nuevas.
