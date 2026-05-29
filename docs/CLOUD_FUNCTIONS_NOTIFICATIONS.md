# Cloud Functions de Notificaciones (LAB-PROD-008/009)

## 1. Objetivo
Mover y endurecer el fan-out de notificaciones al backend para que sea idempotente, trazable y operable por soporte.

## 2. Por que server-side
- El frontend no debe depender de permisos de escritura para fan-out.
- Admin SDK usa IAM y evita abrir reglas peligrosas al cliente.
- Los triggers ejecutan consistentemente sobre cambios reales en Firestore.

## 3. Funciones disponibles
- `onRequestCreated`
- `onRequestCommentCreated`
- `onRequestStatusUpdated`
- `retryNotificationDelivery` (callable, solo soporte)

## 4. Eventos que disparan
- `solicitudes/{solicitudId}` (create)
- `solicitudes/{solicitudId}/comentarios/{comentarioId}` (create)
- `solicitudes/{solicitudId}` (update con cambio de `estado`)

## 5. LAB-PROD-009: Idempotencia y trazabilidad
- IDs de entrega determinísticos (`deliveryId`).
- `notificationId` derivado de `deliveryId` (`notif_${deliveryId}`).
- Si se reejecuta el mismo evento, no se duplica notificación.
- Se registra estado por destinatario en `notificationDeliveries`:
  - `pending`
  - `delivered`
  - `skipped_duplicate`
  - `failed`
  - `retried`
- Errores quedan registrados en `lastError`.
- No hay reintentos automáticos infinitos.

## 6. Instalar dependencias

```bash
cd functions
npm install
```

## 7. Deploy

```bash
npx firebase-tools deploy --only functions
```

Para reglas e índices:

```bash
npx firebase-tools deploy --only firestore:rules
npx firebase-tools deploy --only firestore:indexes
```

## 8. Logs

```bash
npx firebase-tools functions:log
```

## 9. Pruebas manuales
1. Crear solicitud.
2. Confirmar `notificaciones` y `notificationDeliveries`.
3. Agregar comentario.
4. Confirmar entregas por destinatario.
5. Cambiar estado.
6. Confirmar entregas por destinatario.
7. Reintentar un `deliveryId` fallido con callable de soporte.
8. Confirmar `status = retried` o `skipped_duplicate`.

## 10. Riesgos conocidos
- Si falta `lastStatusChangedBy`, la exclusión de actor puede ser parcial en cambio de estado.
- No hay DLQ ni alertas automáticas.
- Sin canales externos (email/WhatsApp/push).

## 11. Fuera de alcance
- Email.
- WhatsApp.
- Push notifications.
- App Check.
- Dashboard operativo UI.
- DLQ avanzada.

## 12. Operacion desde UI de soporte
- Soporte puede monitorear `notificationDeliveries` desde `/soporte/notificaciones`.
- Retry manual disponible para `failed` usando callable `retryNotificationDelivery`.
- La UI no reemplaza observabilidad en logs; ambos deben usarse en incidentes.

## 13. LAB-PROD-012: Attempts granulares
- Cada entrega escribe historial granular en:
  - `notificationDeliveries/{deliveryId}/attempts/attempt_{n}`
- Se registra resultado por intento con `status` y `reason`.
- Retry manual tambien escribe attempt:
  - `retried` en exito
  - `retry_not_required` cuando no aplica retry
  - `failed` cuando el retry vuelve a fallar
