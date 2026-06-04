# LAB - Alcance Actual

## Fuente de verdad

El estado actual del repo es la fuente de verdad.

## Que si existe actualmente

- App React 18 + Vite con Tailwind, React Router v6 y Lucide React.
- Login demo y Firebase segun configuracion.
- Layout compartido con Topbar, Sidebar, BottomNav, DemoPanel y UserMenu.
- Rutas actuales registradas y alineadas con la navegacion.
- Roles demo y productivos ya documentados en el baseline.
- Checklists y notas de deploy que reflejan el estado actual.

## Que queda fuera de alcance

- No crear roles nuevos.
- No crear modulos nuevos.
- No recuperar el blueprint viejo.
- No desarrollar funcionalidades desde cero.
- No redisenar toda la app.

## Rutas actuales

Resumen corto:

- `/`
- `/login`
- `/unauthorized`
- `/inicio`
- `/catalogo-portadas`
- `/inventario`
- `/promociones`
- `/herramientas`
- `/capacitacion`
- `/perfil`
- `/youtube`
- `/canal-youtube`
- `/salesforce`
- `/usuarios`
- `/soporte/usuarios`

## Roles actuales

Demo:

- `admin`
- `direccion`
- `gerente`
- `ejecutivo`
- `bdcLab`
- `bdcSucursal`

Productivos:

- `vendedor`
- `coordinador`
- `soporte`

## Comandos reales

- `npm run lint`
- `npm run build`
- `npm run preview`
- `npm run dev`

## Smoke test real

Verificar login, layout, rutas protegidas, navegacion actual, perfil, inventario, promociones, catalogo de portadas, YouTube, usuarios y soporte de usuarios.

## Proximos tickets

- LAB-033: actualizar smoke test y checklist operativo actual.
- LAB-034: bloquear modo demo accidental en produccion.
- LAB-035: mensajes seguros en login.

## Nota

Los documentos de `docs/baseline`, `docs/fixes` y `docs/reviews` siguen siendo historicos y sirven como trazabilidad del camino que llevo al estado actual.

