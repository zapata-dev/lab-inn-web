# LAB-029 Estado actual

- Fecha: 2026-06-03
- Rama: `chore/LAB-029-baseline-estado-actual`
- Fuente de verdad: el estado actual del repo

## Ultimos 5 commits

1. `4aa85cc` - `fix: polish inventory filter labels`
2. `b5764d9` - `feat: turn youtube page into tab menu`
3. `7291c53` - `fix: uppercase agency labels in promotions`
4. `f32e119` - `fix: clean promotions and inventory labels`
5. `56ed542` - `feat: add youtube playlist selection page`

## Resultado de lint

- `npm.cmd run lint`
- Resultado: 11 warnings, 0 errores
- Observacion: warnings de Tailwind shorthand en `src/features/support/users/AccessRequestsList.jsx` y `src/features/support/users/UsersList.jsx`

## Resultado de build

- `npm.cmd run build`
- Resultado: build exitoso
- Observacion: Vite emitio warning de chunk mayor a 500 kB, pero el build termino correctamente

## Resumen del estado actual

La app actual es un MVP React 18 + Vite con Tailwind, React Router v6 y Lucide React. Tiene:

- Login demo y login con Google/Firebase segun variables de entorno.
- Layout compartido con Topbar, Sidebar, BottomNav, DemoPanel y UserMenu.
- Pantallas activas de inicio, inventario, promociones, catalogo de portadas, YouTube, perfil, usuarios y soporte de usuarios.
- Mocks y servicios locales para inventario, Salesforce, entrenamiento, soporte y administracion.
- Configuracion de deploy para Firebase Hosting, Render y Vercel.

## Nota de baseline

El estado actual es la fuente de verdad. Alcances antiguos no implementados quedan fuera de este baseline.
