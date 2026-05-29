# Firebase Auth Google para LAB

## Objetivo
Implementar autenticacion base con Google y mantener autorizacion separada via Firestore.

## Variables de entorno
Define estas variables en `.env.local`:

```env
VITE_AUTH_MODE=firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_ALLOWED_DOMAIN=zapata.com.mx
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

Notas:
- Si `VITE_AUTH_MODE` no es `firebase`, la app mantiene modo demo.
- Si faltan variables Firebase, el login muestra error de configuracion.

## Habilitar Google Provider
1. En Firebase Console abre `Authentication`.
2. En `Sign-in method`, habilita `Google`.
3. Configura email de soporte del proyecto.
4. Verifica que el `Authorized domain` incluya tu dominio de hosting.

## Flujo implementado
1. El usuario entra por `Entrar con Google Zapata`.
2. Firebase valida identidad (autenticacion).
3. La app valida dominio `@zapata.com.mx`.
4. La app consulta `usuarios/{uid}` en Firestore (autorizacion).
5. Si no cumple reglas de autorizacion, redirige a `/unauthorized`.

## Diferencia clave
- Autenticacion: confirma quien es el usuario en Google/Firebase Auth.
- Autorizacion: confirma si ese usuario puede usar LAB segun Firestore.

## Fuera de alcance en esta entrega
- Firestore rules.
- Inventario live o imports.
- Cloud Functions.
- Notificaciones.
- Soporte avanzado.