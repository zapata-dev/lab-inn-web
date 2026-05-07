# LAB MVP

Proyecto base del MVP comercial interno de Zapata.

## Stack

- React 18
- Vite
- JavaScript (sin TypeScript)
- Tailwind CSS
- React Router v6
- Lucide React

## Scripts

- `npm run dev`: inicia entorno local de desarrollo.
- `npm run build`: genera `dist/` para produccion.
- `npm run preview`: sirve el build localmente.
- `npm run lint`: ejecuta ESLint.
- `npm run format`: ejecuta Prettier.

## Variables de entorno

Duplicar `.env.example` a `.env` y ajustar segun entorno.

## Arquitectura base

```txt
src/
|- components/
|  |- common/
|  `- layout/
|- features/
|  |- dashboard/
|  |- inventory/
|  |- commercialTools/
|  |- training/
|  `- salesforce/
|- pages/
|- routes/
|- context/
|- hooks/
|- services/
|- utils/
|- data/
`- config/
```

## Alcance de este setup

- Incluye pantalla minima de validacion (`LAB MVP`, `Setup base listo`, badge `Modo demo`).
- Incluye icono de Lucide para validar integracion.
- No incluye Auth, Sidebar, backend, tests automatizados ni migracion de legacy.
