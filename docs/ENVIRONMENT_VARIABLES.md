# Variables de entorno LAB

## Regla central

Produccion nunca debe correr con modo demo.

## Archivos locales

- `.env.local` no se sube.
- `.env.example` solo contiene ejemplos seguros.

## Inventario actual

| Nombre | Dónde se usa | Obligatoria en desarrollo | Obligatoria en produccion | Valor ejemplo seguro | Riesgo si falta | Permitida en produccion | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `VITE_BRAND_NAME` | `.env.example`, docs | No | No | `LAB` | Bajo | Si | Metadata de marca. No se consume en `src/` actualmente. |
| `VITE_VERSION` | `.env.example`, docs | No | No | `1.0.0` | Bajo | Si | Metadata de version. No se consume en `src/` actualmente. |
| `VITE_DEMO_MODE` | `src/utils/authMode.js`, `.env.example` | No | No | `false` | Alto si se deja `true` en produccion | No | Variable prohibida en produccion cuando esta en `true`. |
| `VITE_AUTH_MODE` | `src/utils/authMode.js`, `src/context/AuthContext.jsx`, docs | Si | Si | `firebase` en produccion, `demo` solo local | Alto si falta o queda en modo incorrecto | Si, solo con valor correcto | `demo` solo para local; en produccion debe ser `firebase`. |
| `VITE_FIREBASE_API_KEY` | `src/services/firebase.js`, `.env.example` | Si si usas Firebase | Si si usas Firebase | `<apiKey>` | Alto | Si | Obligatoria para Firebase Auth real. |
| `VITE_FIREBASE_AUTH_DOMAIN` | `src/services/firebase.js`, `.env.example` | Si si usas Firebase | Si si usas Firebase | `<authDomain>` | Alto | Si | Obligatoria para Firebase Auth real. |
| `VITE_FIREBASE_PROJECT_ID` | `src/services/firebase.js`, `.env.example` | Si si usas Firebase | Si si usas Firebase | `<projectId>` | Alto | Si | Obligatoria para Firebase Auth real. |
| `VITE_FIREBASE_APP_ID` | `src/services/firebase.js`, `.env.example` | Si si usas Firebase | Si si usas Firebase | `<appId>` | Alto | Si | Obligatoria para Firebase Auth real. |
| `VITE_FIREBASE_ALLOWED_DOMAIN` | `src/context/AuthContext.jsx`, `src/services/authService.js`, `.env.example` | Si si usas Firebase | Si si usas Firebase | `zapata.com.mx` | Alto si queda vacia o incorrecta | Si | Restringe el correo permitido para acceso. |
| `VITE_FIREBASE_FUNCTIONS_REGION` | `.env.example`, docs | No en el runtime actual | No en el runtime actual | `us-central1` | Bajo | Si | Se documenta para despliegues Firebase/Functions, aunque no se consume en `src/` hoy. |
| `VITE_DEBUG_AUTH` | `src/utils/authMessages.js` | No | No | `false` | Bajo | No recomendado | Solo activa logs de auth en desarrollo o debugging controlado. |

## Variables de autenticacion

### `VITE_AUTH_MODE`

- `demo`: solo desarrollo local.
- `firebase`: autentica con Firebase.
- Cualquier otro valor invalido debe tratarse como riesgo operativo.

### `VITE_DEMO_MODE`

- `true`: habilita demo solo en desarrollo local.
- `false`: valor esperado cuando no se usa demo.
- En produccion debe quedar prohibido si esta en `true`.

## Variables Firebase

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ALLOWED_DOMAIN`
- `VITE_FIREBASE_FUNCTIONS_REGION` como referencia de despliegue

## Matriz por ambiente

### Desarrollo local demo

- `VITE_AUTH_MODE=demo`
- `VITE_DEMO_MODE=true`
- `VITE_BRAND_NAME=LAB` o el valor que se quiera mostrar localmente
- `VITE_VERSION=1.0.0` o un valor de version local

### Desarrollo local Firebase

- `VITE_AUTH_MODE=firebase`
- `VITE_DEMO_MODE=false`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ALLOWED_DOMAIN`

### Produccion Firebase

- `VITE_AUTH_MODE=firebase`
- `VITE_DEMO_MODE=false`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ALLOWED_DOMAIN`
- `VITE_DEMO_MODE=true` prohibido
- `VITE_AUTH_MODE=demo` prohibido

## Errores relacionados

- `AUTH-CONFIG`
- [docs/fixes/LAB-034-block-demo-mode-production.md](docs/fixes/LAB-034-block-demo-mode-production.md)
- [docs/fixes/LAB-035-safe-login-messages.md](docs/fixes/LAB-035-safe-login-messages.md)

## Checklist antes de deploy

- Confirmar que produccion no usa `VITE_AUTH_MODE=demo`.
- Confirmar que produccion no usa `VITE_DEMO_MODE=true`.
- Confirmar que la config Firebase esta completa.
- Confirmar que `.env.local` no esta versionado.

