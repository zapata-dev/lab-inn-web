# LAB-042 - UX/UI Inicio Mi Oficina Virtual

## Objetivo

Rediseñar la pantalla de inicio para que `/` y `/inicio` funcionen como una oficina virtual real:

- sidebar corporativa oscura
- topbar clara con búsqueda y notificaciones
- hero principal con imagen del camión, saludo, rol, sucursal y KPIs
- accesos rápidos a inventario, promociones y publicidad
- secciones para plataformas, comunidad y soporte
- soporte visible solo cuando corresponde al rol `soporte`

## Alcance aplicado

- Reemplacé la pantalla principal en [`src/pages/Home.jsx`](../../src/pages/Home.jsx).
- Reutilicé los enlaces existentes desde [`src/data/accessLinks.js`](../../src/data/accessLinks.js).
- Corregí textos visibles con codificación rota en accesos y menú de usuario.
- Mantener `/login`, `/unauthorized`, `/usuarios` y `/soporte/usuarios` sin cambios funcionales.
- No toqué Auth, Firestore Rules, backend ni instalaciones de librerías.

## Detalles de interfaz

- Hero con imagen `truck-hero.png` y capa oscura corporativa.
- Chips de rol, sucursal y cantidad de accesos visibles.
- KPIs de inventario sincronizados desde la caché local o CSV.
- Filtros de navegación por inventario, plataformas, comunidad, soporte y favoritos.
- Tarjetas accesibles con botón real, estrella de favoritos y enlaces internos / externos correctos.
- Estado `status` durante carga de métricas.
- Estado `alert` con acción de reintento si no se pueden obtener métricas y no hay caché.

## Archivos tocados

- [`src/pages/Home.jsx`](../../src/pages/Home.jsx)
- [`src/data/accessLinks.js`](../../src/data/accessLinks.js)
- [`src/components/layout/UserMenu.jsx`](../../src/components/layout/UserMenu.jsx)
- [`docs/SMOKE_TEST_OPERATIVO_ACTUAL.md`](../SMOKE_TEST_OPERATIVO_ACTUAL.md)

## Validación esperada

- `npm run lint`
- `npm run build`
- `git status`
- `git diff --stat`

## Notas

- La Home usa los enlaces reales ya existentes; no se inventaron URLs nuevas.
- La pantalla principal mantiene `/` y `/inicio` como la misma experiencia.
- El soporte de usuarios sigue protegido por rol en la ruta dedicada.
