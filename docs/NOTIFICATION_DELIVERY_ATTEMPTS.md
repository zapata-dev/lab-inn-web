# Notification Delivery Attempts (LAB-PROD-012)

## 1. Objetivo
Registrar historial granular por cada intento de entrega de notificacion en:

- `notificationDeliveries/{deliveryId}/attempts/{attemptId}`

## 2. Por que no basta `attemptCount`
`attemptCount` y `lastError` resumen estado final, pero no explican cada paso del flujo. Con attempts se audita:

- intento inicial
- duplicado evitado
- error puntual
- retry manual
- retry exitoso
- retry no requerido

## 3. Modelo de subcoleccion `attempts`
Campos principales:

- `attemptId`
- `deliveryId`
- `notificationId`
- `sourceType`
- `sourcePath`
- `solicitudId`
- `userId`
- `tipo`
- `status`
- `reason`
- `attemptNumber`
- `triggeredBy`
- `triggeredByUid`
- `errorCode`
- `errorMessage`
- `createdAt`
- `metadata`

## 4. Estados de attempt
- `pending`
- `delivered`
- `skipped_duplicate`
- `failed`
- `retried`
- `retry_not_required`

## 5. Reasons usados
- `initial_delivery`
- `notification_already_exists`
- `notification_created`
- `notification_create_failed`
- `manual_retry`
- `manual_retry_success`
- `manual_retry_failed`
- `status_not_failed`

## 6. Como se genera `attemptNumber`
- Se calcula desde `notificationDeliveries.attemptCount + 1`.
- El intento se guarda como `attempt_{attemptNumber}`.
- Cada intento incrementa contador una sola vez para evitar doble conteo.

## 7. Como leer historial desde soporte
1. Abrir `/soporte/notificaciones`.
2. Seleccionar delivery.
3. Revisar seccion **Historial de intentos**.
4. Si la entrega es antigua y no tiene attempts, la UI muestra fallback derivado.

## 8. Como investigar un fallo
1. Confirmar `status = failed` y `lastError`.
2. Abrir attempts y revisar `errorCode`, `errorMessage`, `triggeredBy`, `reason`.
3. Ejecutar retry manual desde soporte si aplica.
4. Confirmar nuevo `attempt_{n}` y status final (`retried` o `skipped_duplicate`).

## 9. Relacion con retry manual
- El callable `retryNotificationDelivery` agrega intento nuevo.
- Si la entrega no esta en `failed`, se registra `retry_not_required`.
- Si retry recupera la entrega, se registra `retried`.

## 10. Limitaciones
- No hay DLQ avanzada.
- No hay alertas automaticas.
- No hay correlacion con sistemas externos.

## 11. Fuera de alcance
- DLQ avanzada
- alertas automaticas
- correo
- WhatsApp
- dashboard ejecutivo

## 12. LAB-PROD-013: Vista soporte de attempts
- Se agrega ruta operativa dedicada:
  - `/soporte/notificaciones/attempts`
- La vista consulta attempts via `collectionGroup`.
- Permite filtros por `status`, `reason`, `triggeredBy`, `deliveryId`, `solicitudId`, `userId`.
- Incluye export CSV, detalle tecnico y navegacion al delivery padre o solicitud relacionada.
