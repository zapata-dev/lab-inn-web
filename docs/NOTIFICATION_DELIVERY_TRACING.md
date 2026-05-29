# Notification Delivery Tracing (LAB-PROD-009)

## 1. Objetivo
Hacer el fan-out de notificaciones idempotente, trazable e investigable para soporte.

## 2. Problema que resuelve
Sin idempotencia, un trigger reejecutado puede duplicar notificaciones. Con trazabilidad, cada intento queda registrado y se puede auditar.

## 3. Modelo `notificationDeliveries`
Coleccion: `notificationDeliveries/{deliveryId}`

Campos:
- `deliveryId`
- `notificationId`
- `sourceEventId`
- `sourceType`
- `sourcePath`
- `solicitudId`
- `userId`
- `tipo`
- `status` (`pending | delivered | skipped_duplicate | failed | retried`)
- `attemptCount`
- `lastError`
- `createdAt`
- `updatedAt`
- `deliveredAt`
- `retriedAt`
- `metadata`
- `notificationPayload` (`titulo`, `mensaje`)

## 4. Construccion de IDs
`deliveryId` se arma con partes determinísticas:
- `sourceType`
- `solicitudId`
- `commentId` (si aplica)
- `estadoNuevo` (si aplica)
- `tipo`
- `userId`

`notificationId`:
- `notif_${deliveryId}`

## 5. Estados de entrega
- `pending`: intento inicial registrado.
- `delivered`: notificacion creada.
- `skipped_duplicate`: ya existia `notificaciones/{notificationId}`.
- `failed`: fallo de entrega con `lastError`.
- `retried`: entrega creada en retry manual de soporte.

## 6. Como investigar una notificacion que no llego
1. Buscar solicitud en `solicitudes/{solicitudId}`.
2. Consultar `notificationDeliveries` por `solicitudId` y `updatedAt desc`.
3. Revisar `status`, `attemptCount`, `lastError`, `sourceType`.
4. Si `failed`, revisar logs de Functions por `deliveryId`.
5. Confirmar si existe o no `notificaciones/{notificationId}`.

## 7. Como detectar duplicados evitados
- Buscar `status = skipped_duplicate`.
- Verificar que solo exista una notificacion con `notificationId` derivado del `deliveryId`.

## 8. Reintento manual
Function callable:
- `retryNotificationDelivery`

Reglas operativas:
- solo soporte.
- requiere `deliveryId`.
- solo procesa cuando `status = failed`.
- si ya existe notificacion, queda `skipped_duplicate`.
- si se recupera, queda `retried`.

## 9. Logs recomendados
- `onRequestCreated summary`
- `onRequestCommentCreated summary`
- `onRequestStatusUpdated summary`
- errores con `deliveryId`, `notificationId`, `solicitudId`, `tipo`.

## 10. Riesgos conocidos
- si no se captura actor en estado, la exclusion de actor puede no aplicar siempre.
- no hay DLQ ni alertas automáticas.
- retry manual depende de operación de soporte.

## 11. Fuera de alcance
- correo
- WhatsApp
- push notifications
- dashboard de soporte
- alertas automáticas
- DLQ avanzada

## 12. LAB-PROD-010: Vista soporte
- Ruta interna: `/soporte/notificaciones`.
- Solo rol `soporte` puede acceder.
- Permite filtros operativos sobre `notificationDeliveries`.
- Incluye retry manual para estados `failed` via callable `retryNotificationDelivery`.
- No sustituye logs de Cloud Functions; es complemento operativo.

## 13. LAB-PROD-011: Operacion avanzada de soporte
- La vista incluye export CSV con campos operativos clave para analisis fuera de la app.
- El detalle muestra historial derivado de intentos con `attemptCount` y timestamps disponibles.
- Se pueden copiar IDs para diagnostico y escalamiento:
  - `deliveryId`
  - `notificationId`
  - `solicitudId`
  - `userId`
- Para incidentes, combinar la vista con logs de Functions usando esos IDs como llaves de busqueda.

## 14. LAB-PROD-012: Attempts granulares
- Se agrega subcoleccion por entrega:
  - `notificationDeliveries/{deliveryId}/attempts/{attemptId}`
- Cada intento guarda `attemptNumber`, `status`, `reason`, `triggeredBy` y error puntual.
- Los duplicados evitados ya no solo se ven en el estado agregado del delivery; tambien dejan intento dedicado.
- Retry manual deja traza explicita del resultado (`retried`, `failed` o `retry_not_required`).
