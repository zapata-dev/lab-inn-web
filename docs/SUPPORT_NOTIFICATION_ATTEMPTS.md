# Soporte - Notification Attempts (LAB-PROD-013)

## 1. Objetivo
Dar a soporte una vista dedicada para revisar attempts granulares de entrega de notificaciones y acelerar diagnostico operativo.

## 2. Ruta interna
- `/soporte/notificaciones/attempts`

## 3. Quien puede entrar
- Solo rol `soporte`.
- `vendedor` y `coordinador` quedan bloqueados/redirigidos.

## 4. Que es un attempt
Registro granular por intento en:
- `notificationDeliveries/{deliveryId}/attempts/{attemptId}`

Describe que paso en cada ejecucion (entrega inicial, duplicado, error, retry).

## 5. Filtros disponibles
- `status`
- `reason`
- `triggeredBy`
- `deliveryId`
- `solicitudId`
- `userId`

## 6. Export CSV
La vista permite exportar los attempts filtrados con campos operativos (IDs, estado, reason, error y fecha).

## 7. Abrir delivery padre
Desde el detalle de attempt:
- Navega a `/soporte/notificaciones?deliveryId=<deliveryId>`

## 8. Abrir solicitud relacionada
Desde el detalle de attempt:
- Navega a `/solicitudes?solicitudId=<solicitudId>` cuando existe `solicitudId`.

## 9. Como interpretar status
- `pending`: intento registrado sin resultado final.
- `delivered`: entrega creada correctamente.
- `skipped_duplicate`: se detecto notificacion existente.
- `failed`: intento con error.
- `retried`: intento exitoso en flujo de retry.
- `retry_not_required`: retry solicitado cuando no aplicaba.

## 10. Como interpretar reason
Examples comunes:
- `initial_delivery`
- `notification_already_exists`
- `notification_created`
- `notification_create_failed`
- `manual_retry_success`
- `manual_retry_failed`
- `status_not_failed`

## 11. Que copiar para reportar incidente
- `attemptId`
- `deliveryId`
- `notificationId`
- `solicitudId`
- `userId`
- `status`
- `reason`
- `errorCode`
- `errorMessage`
- `createdAt`

## 12. Limitaciones
- No cambia backend ni fan-out.
- No crea indices nuevos en este ticket.
- Combinaciones de filtros pueden requerir indice compuesto en Firestore.
- No hay alertas automaticas.
- No hay DLQ avanzada.
