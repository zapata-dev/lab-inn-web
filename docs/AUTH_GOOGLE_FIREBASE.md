# Firebase Auth Google - LAB-PROD-003

## Objetivo del ticket

Implementar autenticacion real con Firebase Auth usando Google Sign-In en frontend y bloquear acceso a correos fuera del dominio permitido (`@zapata.com.mx` por defecto).

Este ticket autentica usuarios. La autorizacion por `usuarios/{uid}` y roles reales queda para `LAB-PROD-004`.

## Variables de entorno necesarias

Definir en `.env.local` (no en repo):

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_ALLOWED_DOMAIN=zapata.com.mx
VITE_AUTH_MODE=firebase
```

Notas:

- `VITE_FIREBASE_ALLOWED_DOMAIN` controla el dominio permitido.
- Si `VITE_AUTH_MODE` no es `firebase`, la app usa modo demo.

## Como habilitar Google provider en Firebase Console

1. Abrir Firebase Console y seleccionar el proyecto.
2. Ir a `Authentication` > `Sign-in method`.
3. Habilitar proveedor `Google`.
4. Guardar cambios.
5. Verificar que el dominio de autenticacion del proyecto este disponible en configuracion web.

## Como probar login valido

1. Configurar `.env.local` con variables reales.
2. Ejecutar `npm run dev`.
3. Abrir `/login`.
4. Confirmar que aparece boton `Entrar con Google Zapata`.
5. Iniciar sesion con cuenta `@zapata.com.mx`.
6. Confirmar redireccion a `/inicio`.
7. Confirmar visualizacion de nombre/email en topbar.
8. Ejecutar logout y verificar retorno a `/login`.

## Como probar login invalido (dominio no permitido)

1. En `/login`, iniciar sesion con cuenta que no termine en `@zapata.com.mx`.
2. Verificar que el flujo cierre sesion automaticamente.
3. Verificar mensaje de error de acceso denegado por dominio.
4. Confirmar que no se puede entrar a rutas protegidas.

## Como probar configuracion incompleta de Firebase

1. Quitar temporalmente una variable `VITE_FIREBASE_*` del `.env.local`.
2. Reiniciar `npm run dev`.
3. Ir a `/login`.
4. Confirmar que la app no truena y muestra error claro de configuracion faltante.

## Que NO hace este ticket

- No consulta `usuarios/{uid}` para autorizacion real.
- No implementa roles productivos reales.
- No integra Firestore.
- No crea `firebase.json`.
- No crea `firestore.rules` ni `firestore.indexes.json`.
- No toca SAP/Salesforce.

## Que queda para LAB-PROD-004

- Validar autorizacion real con `usuarios/{uid}`.
- Rechazar acceso si no existe usuario autorizado o `activo=false`.
- Traer rol real (`vendedor`, `coordinador`, `soporte`).
- Sustituir fallback temporal de rol en frontend.
- Definir mensajes de acceso no autorizado por estado de usuario.
