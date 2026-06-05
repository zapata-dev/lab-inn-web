# LAB-043 - Auth Request Flow Hotfix

## Contexto

El flujo de acceso en Firebase mostraba `Validando acceso...` y no llevaba a `/unauthorized` para usuarios autenticados pero no registrados en Firestore.

## Causa principal

- `ProtectedRoute` comparaba `authErrorCode` con códigos crudos de Firestore/Auth.
- `AuthContext` publica códigos públicos como `AUTH-ACCESS`, `AUTH-DISABLED`, `AUTH-NETWORK`, etc.
- Por eso el guardia caía a `/login` en lugar de `/unauthorized`.

## Cambios

- [src/routes/ProtectedRoute.jsx](/c:/Users/QRSDGONZ/Desktop/proyectos/mvp-lab-inn/lab-mvp/src/routes/ProtectedRoute.jsx)
  - Usa códigos públicos de auth.
  - Solo manda a `/unauthorized` cuando ya existe `authIdentity`.

- [src/pages/Login.jsx](/c:/Users/QRSDGONZ/Desktop/proyectos/mvp-lab-inn/lab-mvp/src/pages/Login.jsx)
  - Navega a `/unauthorized` cuando el intento de login deja identidad Firebase pero no usuario autorizado.
  - Muestra un mensaje claro para popup/dominio/autenticación.
  - Usa estado local para no dejar el botón atascado en `Validando acceso...`.

- [src/pages/Unauthorized.jsx](/c:/Users/QRSDGONZ/Desktop/proyectos/mvp-lab-inn/lab-mvp/src/pages/Unauthorized.jsx)
  - Si no hay identidad, muestra CTA claro para volver a login.
  - Si hay identidad, mantiene el formulario de solicitud de acceso.

- [src/utils/authMessages.js](/c:/Users/QRSDGONZ/Desktop/proyectos/mvp-lab-inn/lab-mvp/src/utils/authMessages.js)
  - Mapea errores de popup y dominio a mensajes humanos.

## Verificacion

- `npm run lint`: OK, con warnings heredados.
- `npm run build`: OK.
- Dominio Cloud Run autorizado en Firebase Auth para `lab-inn-web-4wcwlyevtq-uc.a.run.app`.

