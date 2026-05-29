# Firebase Auth en Render

## Objetivo
Conectar Render con Firebase real para habilitar login Google y autorizacion Firestore.

## Variables requeridas en Render
Configurar en `Environment` del servicio:

```env
VITE_AUTH_MODE=firebase
VITE_FIREBASE_API_KEY=<apiKey real>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain real>
VITE_FIREBASE_PROJECT_ID=<projectId real>
VITE_FIREBASE_APP_ID=<appId real>
VITE_FIREBASE_ALLOWED_DOMAIN=zapata.com.mx
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

Notas:
- No subir estos valores al repo.
- `.env.example` mantiene placeholders.

## De donde sale cada valor
1. Firebase Console -> Project settings -> General -> Your apps -> Web app.
2. Copiar `apiKey`, `authDomain`, `projectId`, `appId`.

## Auth Google
En Firebase Console:
1. Authentication -> Sign-in method.
2. Habilitar `Google`.
3. Solicitar correo real al owner antes de configurar en consola (en docs usar `SOPORTE_EMAIL_ZAPATA`).

## Authorized domains
Agregar al menos:
- `localhost`
- `lab-inn-web.onrender.com`
- dominio de Firebase Hosting (cuando exista)
- dominio futuro (pendiente)

## Deploy en Render
1. Guardar variables.
2. Ejecutar `Clear build cache & deploy`.
3. Probar `/login`.

## Errores comunes
- `firebase-not-configured`: faltan variables en Render.
- `authorization/domain-not-allowed`: correo fuera de `@zapata.com.mx`.
- `authorization/user-not-found`: falta `usuarios/{uid}`.
- `authorization/user-inactive`: `activo` no es `true`.
- `authorization/role-invalid`: `rol` fuera de vendedor/coordinador/soporte.
