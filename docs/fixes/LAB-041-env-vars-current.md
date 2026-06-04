# LAB-041 - Current environment variables

## Resumen ejecutivo

Se documento el inventario actual de variables de entorno del proyecto y se agrego una guia canonica para separar desarrollo, produccion, Firebase/Auth y modo demo.

## Variables encontradas

- `VITE_BRAND_NAME`
- `VITE_VERSION`
- `VITE_DEMO_MODE`
- `VITE_AUTH_MODE`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ALLOWED_DOMAIN`
- `VITE_FIREBASE_FUNCTIONS_REGION`
- `VITE_DEBUG_AUTH`

## Que se creo o modifico

### Creado

- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/fixes/LAB-041-env-vars-current.md`

### Modificado

- `README.md`
- `docs/deploy-checklist.md`

## Que toca la documentacion

- Regla central de produccion: nunca correr en modo demo.
- Matriz de variables por ambiente.
- Variables prohibidas en produccion.
- Variables relacionadas con Firebase/Auth.
- Riesgos si falta configuracion.

## Que no cambio

- No se toco `src/`.
- No se cambio la logica de Auth.
- No se tocaron roles, rutas ni Firestore Rules.
- No se cambiaron valores reales de secretos.
- No se subio `.env.local`.

## Validacion

- `npm run lint`: pendiente.
- `npm run build`: pendiente.

## Riesgos pendientes

- `VITE_DEBUG_AUTH` sigue siendo una bandera util solo para depuracion y no deberia usarse en produccion.
- `VITE_FIREBASE_FUNCTIONS_REGION` esta documentada como referencia, pero no se consume en `src/` hoy.

