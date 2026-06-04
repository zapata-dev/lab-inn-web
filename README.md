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
```

## Alcance de este setup

- Mantiene el modo demo y la base visual del MVP.
- Incluye navegacion principal, auth demo/Firebase y layout compartido.
- No incluye tests automatizados ni Docker.
