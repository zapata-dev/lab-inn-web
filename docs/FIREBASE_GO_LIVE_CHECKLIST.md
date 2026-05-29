# Firebase Go-Live Checklist (Dev)

## Proyecto e infraestructura
- [ ] Proyecto Firebase dev creado.
- [ ] Project ID final confirmado con Diego.
- [ ] Billing asociada o confirmada por administrador.
- [ ] Region validada (`us-central1` / Firestore `nam5|us-central`).

## Auth
- [ ] Google Provider habilitado.
- [ ] Correo de soporte configurado (confirmado por Diego).
- [ ] Authorized domains incluye:
  - [ ] localhost
  - [ ] lab-inn-web.onrender.com
  - [ ] dominio Firebase Hosting (si existe)
  - [ ] dominio futuro (si existe)

## Firestore
- [ ] Database creada en production mode.
- [ ] Coleccion `usuarios` creada.
- [ ] Usuario de soporte inicial creado y activo.

## Render
- [ ] Variables Firebase cargadas en Environment.
- [ ] `VITE_AUTH_MODE=firebase`.
- [ ] Clear build cache & deploy ejecutado.

## Pruebas funcionales
- [ ] AUTH-001: boton Google visible en `/login` con modo firebase.
- [ ] AUTH-002: correo externo bloqueado.
- [ ] AUTH-003: `@zapata.com.mx` sin perfil va a `/unauthorized`.
- [ ] AUTH-004: soporte activo entra.
- [ ] AUTH-005: soporte inactivo bloqueado.
- [ ] AUTH-006: rol invalido bloqueado.
- [ ] AUTH-007: modo demo sigue funcionando.
- [ ] AUTH-008: sidebar sin cambios de categorias.

## Seguridad y control de cambios
- [ ] No se subieron secretos al repo.
- [ ] `.env.local` no trackeado.
- [ ] `.firebaserc` real no trackeado.
- [ ] No hubo cambios en inventario/functions/sidebar/modulos comerciales.