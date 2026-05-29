# Firestore Security Matrix - LAB Produccion Piloto

## 1. Objetivo

Definir permisos conceptuales por rol para guiar reglas de Firestore y validaciones de servicios en la fase de Produccion Piloto.

Este documento no contiene reglas tecnicas (`firestore.rules`) todavia.

## 2. Principios de seguridad

- Denegar por defecto y permitir solo lo necesario por rol.
- Identidad por Google Auth; autorizacion por `usuarios/{uid}`.
- Usuario sin documento en `usuarios` o con `activo=false` no entra.
- Controlar acceso por rol y alcance de sucursal.
- Proteger auditoria contra eliminacion o alteracion no autorizada.

## 3. Matriz por rol

| Recurso / Accion | vendedor | coordinador | soporte |
|---|---|---|---|
| Leer inventario nacional | si | si | si |
| Crear solicitud | si | si | si |
| Leer solicitudes propias o de su sucursal | si (propias) | si (sucursal solicitante o duena) | si (todas) |
| Comentar solicitud visible | si | si | si |
| Cambiar estado de solicitud | no | si (si su sucursal participa) | si |
| Aprobar/Rechazar solicitud | no | si (si su sucursal participa) | si |
| Cerrar solicitud atorada | no | no | si |
| Leer notificaciones propias | si | si | si |
| Reprocesar notificaciones | no | no | si |
| Editar usuarios | no | no | si |
| Leer auditoria global | no | no | si |
| Borrar auditoria | no | no | no |

## 4. Reglas conceptuales por coleccion

### 4.1 `usuarios/{uid}`

- Lectura propia: permitida para cualquier usuario activo autenticado.
- Lectura global: solo soporte.
- Escritura: solo soporte (altas, bajas logicas, rol, sucursal, activo).
- Campo `rol` restringido a `vendedor`, `coordinador`, `soporte`.

### 4.2 `sucursales/{sucursalId}`

- Lectura: todos los roles autenticados y autorizados.
- Escritura: solo soporte.

### 4.3 `inventario/{vin}`

- Lectura: todos los roles autenticados y autorizados.
- Escritura operativa manual: solo soporte.
- Escritura masiva por importacion: proceso de backend/scheduler (no cliente).

### 4.4 `solicitudes/{solicitudId}`

- Crear: vendedor/coordinador/soporte.
- Leer: 
  - vendedor: si `vendedorId == auth.uid`.
  - coordinador: si su `sucursalId` coincide con `sucursalSolicitanteId` o `sucursalDuenaId`.
  - soporte: siempre.
- Actualizar estado:
  - coordinador: permitido cuando su sucursal participa.
  - soporte: permitido.
  - vendedor: no permitido para aprobar/rechazar/cerrar.

### 4.5 `solicitudes/{solicitudId}/comentarios/{comentarioId}`

- Crear comentario: quien tenga visibilidad de la solicitud.
- Leer comentarios: quien tenga visibilidad de la solicitud.
- Edicion/eliminacion: no permitida en V1 desde cliente (inmutables).

### 4.6 `solicitudes/{solicitudId}/historial/{eventoId}`

- Escritura: backend (Cloud Functions) para consistencia de trazabilidad.
- Lectura: roles con visibilidad de la solicitud.
- Eliminacion: no permitida.

### 4.7 `notificaciones/{notificacionId}`

- Lectura: solo `userId == auth.uid`, excepto soporte que puede leer todo para diagnostico.
- Actualizacion de `leida/readAt`: solo destinatario.
- Reproceso y marca de envio/error: solo soporte o backend.

### 4.8 `auditoria/{auditId}`

- Escritura: backend o flujos controlados por soporte.
- Lectura: solo soporte.
- Eliminacion/edicion destructiva: no permitida en V1.

### 4.9 `importsInventario/{importId}`

- Lectura: soporte (y opcional coordinador solo lectura en futura revision).
- Escritura: backend/scheduler.

### 4.10 `systemConfig/{configId}`

- Lectura: todos los roles autenticados y autorizados.
- Escritura: soporte.

## 5. Casos limite

1. Usuario autenticado con Google y dominio valido, pero sin documento en `usuarios`: acceso denegado y log `login_rechazado`.
2. Usuario con documento en `usuarios` pero `activo=false`: acceso denegado y log `login_rechazado`.
3. Coordinador intenta aprobar solicitud fuera de su sucursal: denegar.
4. Vendedor intenta cambiar estado a `aprobada`: denegar.
5. Soporte corrige una solicitud: registrar en `auditoria` con metadata minima.
6. Notificacion `email` fallida: mantener evento `in_app` y registrar error para reproceso.

## 6. Lo que queda fuera de V1

- Reglas avanzadas por multi-sucursal por usuario.
- Impersonacion de usuarios.
- Workflow de aprobacion multinivel con direccion.
- Integracion de identidad externa distinta a Google.
- Borrado legal automatizado de auditoria (se define en fase posterior).

## 7. Implementacion inicial en firestore.rules

Desde `LAB-PROD-005` ya existe implementacion inicial en `firestore.rules` con enfoque deny-by-default:

- Helpers de autenticacion/autorizacion (`signedIn`, `isAuthorized`, `isActive`, `role`).
- Permisos por rol (`vendedor`, `coordinador`, `soporte`).
- Restricciones por sucursal en lectura/actualizacion de `solicitudes`.
- Bloqueo de `delete` en colecciones criticas (`solicitudes`, `auditoria`, `usuarios`, entre otras).
- Fallback global `allow read, write: if false`.

Pendiente V1.1:

- Endurecer transiciones finas de estado en `solicitudes` con mayor granularidad por actor.
- Endurecer creacion de `historial` por `tipoEvento` permitido.
- Endurecer mutaciones de notificaciones para flujos automaticos por backend.
