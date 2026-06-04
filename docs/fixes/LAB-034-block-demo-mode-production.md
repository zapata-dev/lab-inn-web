# LAB-034 - Block Demo Mode in Production

## Riesgo corregido

La app podia quedar en modo demo por omision o por configuracion peligrosa en produccion.

## Archivos modificados

- `.env.example`
- `docs/deploy-checklist.md`
- `src/context/AuthContext.jsx`
- `src/pages/Login.jsx`
- `src/utils/authMode.js`

## Comportamiento antes

- `VITE_AUTH_MODE` caia a `demo` por defecto.
- `VITE_DEMO_MODE=true` no estaba bloqueado en produccion.
- El login mostraba selector demo aun cuando la configuracion no era segura.

## Comportamiento despues

- En produccion, `VITE_AUTH_MODE` faltante bloquea el acceso con un error controlado.
- En produccion, `VITE_AUTH_MODE=demo` bloquea el acceso con un error controlado.
- En produccion, `VITE_DEMO_MODE=true` bloquea el acceso con un error controlado.
- El login no muestra selector demo cuando la configuracion esta bloqueada.
- El mensaje visible es seguro y usa el codigo `AUTH-CONFIG`.

## Como validar en desarrollo

- Ejecutar `npm run dev`.
- Confirmar que el flujo demo sigue disponible si `VITE_AUTH_MODE=demo`.
- Confirmar que la navegacion no se rompe.

## Como validar antes de produccion

- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Revisar que `docs/deploy-checklist.md` marque como obligatorio que produccion no use `VITE_AUTH_MODE=demo` ni `VITE_DEMO_MODE=true`.
- Simular configuraciones peligrosas y confirmar que el helper resuelve `effectiveMode=blocked`.

## Resultado de validacion

- `npm run lint`: 11 warnings, 0 errores.
- `npm run build`: exitoso, con warning habitual de chunk grande de Vite.
- Simulacion del helper:
  - `prod-demo` => `effectiveMode=blocked`
  - `prod-missing` => `effectiveMode=blocked`
  - `prod-firebase-ok` => `effectiveMode=firebase`
  - `dev-demo` => `effectiveMode=demo`

## Riesgos pendientes

- Si el entorno de despliegue publica variables incorrectas, la app mostrara el bloqueo seguro en login.
- El bloqueo no cambia rutas, roles ni reglas de Firestore.
