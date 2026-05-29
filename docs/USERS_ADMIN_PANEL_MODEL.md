# USERS ADMIN PANEL MODEL

## Objetivo del modelo

Definir la base de seguridad y datos para un panel minimo de soporte que permita aprobar accesos sin depender de Firebase Console para cada usuario.

Este ticket no crea UI. Solo prepara:

- modelo de `accessRequests`;
- reglas de acceso;
- responsabilidades por rol;
- flujo operativo de aprobacion/rechazo.

## Colecciones involucradas

### 1) `usuarios/{uid}`

Fuente de autorizacion productiva actual.

- El documento habilita o bloquea acceso a LAB.
- `uid` debe ser exactamente el UID de Firebase Auth.
- Soporte puede crear/actualizar usuarios.
- Vendedor y coordinador no administran usuarios.

### 2) `accessRequests/{uid}`

Nueva coleccion para solicitud de acceso.

- Documento por usuario autenticado.
- `uid` del documento debe coincidir con `request.auth.uid`.
- Usuario no autorizado puede crear/actualizar su solicitud.
- Soporte puede leer y revisar solicitudes.

## Esquema recomendado de `accessRequests/{uid}`

```json
{
  "uid": "UID",
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre Usuario",
  "displayName": "Nombre Google",
  "photoURL": "url opcional",
  "domain": "zapata.com.mx",
  "status": "pendiente",
  "requestedRole": "vendedor",
  "requestedSucursalId": "suc-qro",
  "requestedSucursalNombre": "Queretaro",
  "message": "Solicito acceso",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "reviewedAt": "timestamp opcional",
  "reviewedBy": "uid soporte opcional",
  "decisionReason": "string opcional"
}
```

## Estados permitidos

- `pendiente`
- `aprobado`
- `rechazado`
- `cancelado`

## Flujo esperado de solicitud y aprobacion

1. Usuario inicia sesion con Google.
2. Si no existe `usuarios/{uid}`, la app lo manda a `/unauthorized`.
3. Desde ese flujo, el usuario crea o actualiza `accessRequests/{uid}` con estado `pendiente`.
4. Soporte revisa solicitudes pendientes (futuro panel).
5. Soporte decide:
- aprobar: actualiza solicitud y crea/actualiza `usuarios/{uid}`.
- rechazar: actualiza solicitud con motivo.
6. Usuario vuelve a entrar y queda autorizado si su `usuarios/{uid}` esta activo y con rol valido.

## Permisos por rol

### Usuario autenticado no autorizado

Puede:

- leer su propio `accessRequests/{uid}`;
- crear su propio `accessRequests/{uid}`;
- actualizar su propia solicitud mientras este pendiente.

No puede:

- aprobarse a si mismo;
- escribir campos de revision (`reviewedBy`, `reviewedAt`, `decisionReason`);
- crear o actualizar `usuarios/{uid}`.

### soporte

Puede:

- leer todas las solicitudes en `accessRequests`;
- actualizar estado de solicitud y campos de revision;
- crear y actualizar `usuarios/{uid}`;
- leer usuarios.

No puede (desde cliente):

- borrar `usuarios/{uid}`;
- saltarse validaciones de rol/campos.

### vendedor / coordinador

Pueden:

- operar la app segun su autorizacion vigente.

No pueden:

- administrar usuarios;
- revisar solicitudes de terceros;
- escribir en `usuarios/{uid}` de otras personas.

## Reglas de seguridad implementadas (resumen)

En `firestore.rules`:

- Helpers base:
- `signedIn()`
- `userDoc()`
- `isActive()`
- `role()`
- `isSoporte()`
- `isValidRole()`
- `isValidAccessRequestStatus()`

- `usuarios/{uid}`:
- lectura propia o soporte;
- create/update solo soporte activo;
- delete denegado.

- `accessRequests/{uid}`:
- lectura propia o soporte;
- create propio con estado inicial `pendiente` y dominio corporativo;
- update propio solo en estado pendiente/cancelado sin campos de revision;
- update de soporte para gestionar estado y revision;
- delete denegado.

- Fallback global:
- `match /{document=**} { allow read, write: if false; }`

## Errores comunes esperados

- UID de solicitud distinto a `request.auth.uid`.
- `status` invalido o intento de autoaprobacion.
- `activo` como string en `usuarios`.
- `rol`/`role` inconsistentes.
- email fuera de `@zapata.com.mx`.

## Limitaciones de este ticket

- No incluye UI de panel soporte.
- No incluye Cloud Functions.
- No incluye automatizacion de notificaciones.
- No despliega reglas a produccion en este ticket.

## Proximo ticket recomendado

`LAB-USERS-003 - Panel soporte de usuarios`

Alcance sugerido para ese ticket:

- vista de solicitudes pendientes;
- aprobacion/rechazo con motivo;
- alta/actualizacion de `usuarios/{uid}`;
- trazabilidad basica en UI.
