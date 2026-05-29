# Soporte - Entregas de Notificaciones (LAB-PROD-010)

## 1. Objetivo
Dar a soporte una vista operativa para revisar entregas de notificaciones (`notificationDeliveries`) y ejecutar retry manual cuando aplique.

## 2. Ruta interna
- `/soporte/notificaciones`

No aparece en Sidebar. Es acceso interno por URL directa.

## 3. Quien puede entrar
- Solo usuarios con rol `soporte`.
- `vendedor` y `coordinador` quedan redirigidos a `/unauthorized`.

## 4. Coleccion usada
- `notificationDeliveries/{deliveryId}`

## 5. Filtros disponibles
- `status`
- `sourceType`
- `solicitudId`
- `userId`

## 6. Accion de retry
- Disponible solo si `status === failed`.
- Ejecuta callable `retryNotificationDelivery`.
- Muestra resultado del callable en el detalle.

## 7. Como interpretar status
- `pending`: entrega registrada, en proceso.
- `delivered`: entrega generada correctamente.
- `skipped_duplicate`: ya existia notificacion con mismo ID determinístico.
- `failed`: fallo en entrega, revisar `lastError`.
- `retried`: reintento manual exitoso por soporte.

## 8. Como probar
1. `npm run lint`
2. `npm run build`
3. Login como soporte (modo Firebase).
4. Abrir `/soporte/notificaciones`.
5. Probar filtros por estado/source/solicitud/user.
6. Abrir detalle.
7. Ejecutar retry en un `failed`.
8. Confirmar actualización de status en la lista.
9. Login como vendedor/coordinador y confirmar bloqueo.

## 9. Limitaciones
- No reemplaza logs de Cloud Functions.
- Si faltan índices para combinaciones de filtros, Firestore puede exigir índice compuesto.
- No hay edición ni borrado desde UI.

## 10. Fuera de alcance
- Dashboard ejecutivo.
- Alertas automáticas.
- Correo.
- WhatsApp.
- DLQ avanzada.
- Push notifications.
- Borrado de entregas.

## 11. LAB-PROD-011: Operacion avanzada
- Export de entregas filtradas a CSV desde la misma vista.
- Copia rapida de IDs tecnicos (`deliveryId`, `notificationId`, `solicitudId`, `userId`).
- Historial derivado por timestamps (`createdAt`, `deliveredAt`, `retriedAt`, `updatedAt`).
- Acciones operativas para abrir solicitud y ejecutar retry cuando `status = failed`.

## 12. LAB-PROD-013: Navegacion a attempts granulares
- Desde `/soporte/notificaciones` se puede abrir la vista:
  - `/soporte/notificaciones/attempts`
- Permite analizar cada intento individual para diagnostico fino por `reason` y `triggeredBy`.
