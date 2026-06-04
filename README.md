# LAB MVP

Proyecto base del MVP comercial interno de Zapata.

## Fuente de verdad

El alcance actual del proyecto vive en [`docs/LAB-ALCANCE-ACTUAL.md`](docs/LAB-ALCANCE-ACTUAL.md). Este README solo resume la base tecnica y de arranque.

## Flujo operativo

El flujo actual de ramas, PR, CI, deploy y rollback esta documentado en [`docs/FLUJO_OPERATIVO_ACTUAL.md`](docs/FLUJO_OPERATIVO_ACTUAL.md).

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
La referencia actual de variables vive en [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md).

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

## Alcance actual

- Mantiene la base demo/Firebase actual y el layout compartido.
- Documenta la navegacion, rutas y roles vigentes en el baseline y en `docs/LAB-ALCANCE-ACTUAL.md`.
- No recupera el blueprint viejo ni agrega modulos nuevos.
- No incluye tests automatizados ni Docker.
