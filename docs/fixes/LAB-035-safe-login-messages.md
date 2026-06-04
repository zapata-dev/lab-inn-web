# LAB-035 - Safe Login Messages

## Riesgo corregido

El login y el flujo de autorizacion podian mostrar mensajes tecnicos o crudos al usuario final.

## Antes

- Se podian mostrar nombres internos de Firebase y Firestore.
- Podian aparecer mensajes crudos como `permission-denied`.
- La pantalla de login podia reflejar configuracion interna de acceso.
- Los errores de auth no estaban estandarizados en codigos publicos.

## Despues

- El usuario final solo ve codigos publicos y mensajes seguros.
- `AUTH-CONFIG` sigue bloqueando configuraciones peligrosas.
- Los errores se normalizan a:
  - `AUTH-CONFIG`
  - `AUTH-ACCESS`
  - `AUTH-PENDING`
  - `AUTH-DISABLED`
  - `AUTH-DOMAIN`
  - `AUTH-NETWORK`
  - `AUTH-UNKNOWN`
- En desarrollo se conservan logs internos con prefijo `[LAB][auth]`.

## Archivos modificados

- `.env.example`
- `docs/deploy-checklist.md`
- `src/context/AuthContext.jsx`
- `src/pages/Login.jsx`
- `src/services/firebase.js`
- `src/utils/authMessages.js`
- `src/pages/Unauthorized.jsx`

## Como validar

### En desarrollo

- Ejecutar `npm run dev`.
- Confirmar que el login sigue operando segun la configuracion local.
- Revisar la consola para ver logs de desarrollo con prefijo `[LAB][auth]` cuando se fuerzan errores.

### Antes de produccion

- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Verificar que el login no muestre Firebase, Firestore, `.env`, `permission-denied` ni trazas tecnicas al usuario final.
- Verificar que `AUTH-CONFIG` siga bloqueando configuraciones peligrosas.

## Resultado de validacion

- `npm run lint`: 11 warnings, 0 errores.
- `npm run build`: exitoso, con warning habitual de chunk grande de Vite.
- Mapa publico validado:
  - `AUTH-CONFIG` -> `AUTH-CONFIG`
  - `firebase-not-configured` -> `AUTH-CONFIG`
  - `authorization/user-not-found` -> `AUTH-ACCESS`
  - `authorization/user-inactive` -> `AUTH-DISABLED`
  - `authorization/domain-not-allowed` -> `AUTH-DOMAIN`
  - `authorization/permission-denied` -> `AUTH-NETWORK`
  - `authorization/validation-timeout` -> `AUTH-NETWORK`
  - `request-already-pending` -> `AUTH-PENDING`
- `GET /login` en desarrollo respondio `200`.

## Riesgos pendientes

- Los mensajes de soporte y flujos administrativos fuera del login pueden seguir mostrando detalles operativos propios de esas pantallas.
- El equipo debe seguir revisando variables de entorno antes de cada deploy.
