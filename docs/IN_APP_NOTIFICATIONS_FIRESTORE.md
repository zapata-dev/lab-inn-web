# Notificaciones In-App en Firestore (LAB-PROD-007)

## 1. Objetivo
Implementar notificaciones in-app para el flujo de solicitudes entre sucursales sin correo ni WhatsApp, consumidas desde frontend y generadas server-side.

## 2. Eventos que disparan notificaciones
- Creacion de solicitud.
- Nuevo comentario en solicitud.
- Cambio de estado de solicitud.

## 3. Modelo de notificacion
Coleccion: `notificaciones/{notificacionId}`

Campos usados:
- `notificacionId`
- `userId`
- `solicitudId`
- `tipo`
- `canal` (`in_app`)
- `titulo`
- `mensaje`
- `leida`
- `enviada`
- `error`
- `createdAt`
- `readAt`
- `sentAt`
- `metadata`

## 4. Reglas de destinatarios
- `solicitud_creada`: vendedor creador (confirmacion).
- `solicitud_recibida`: coordinadores involucrados (solicitante y duenio), sin duplicados.
- `comentario_nuevo`: participantes de la solicitud excepto actor.
- `estado_actualizado` o estado terminal (`aprobada`, `rechazada`, `cancelada`, `cerrada`): participantes excepto actor.

Participantes considerados:
- `vendedorId`
- `coordinadorSolicitanteIds[]`
- `coordinadorDuenoIds[]`

## 5. Como funciona el badge
- `NotificationBell` escucha en tiempo real notificaciones no leidas del usuario (`userId == auth.uid` y `leida == false`).
- Muestra conteo en Topbar cuando el usuario esta en modo Firebase.

## 6. Flujo de UI
- Click en campana abre dropdown.
- Dropdown muestra ultimas notificaciones (max 30).
- Click en una notificacion:
  1. intenta marcarla como leida.
  2. navega a `/solicitudes?solicitudId=<id>` si tiene solicitud.
- Boton "Marcar todas" marca no leidas del usuario actual.

## 7. Pruebas manuales
1. `npm run lint`
2. `npm run build`
3. Configurar `VITE_AUTH_MODE=firebase`.
4. Crear solicitud y validar notificaciones en Firestore.
5. Entrar como destinatario y validar badge.
6. Abrir dropdown y click en notificacion.
7. Validar `leida=true` y navegacion a `/solicitudes?solicitudId=...`.
8. Comentar/cambiar estado y validar nuevas notificaciones.
9. Usar "Marcar todas" y validar lote de lectura.
10. Cambiar a `VITE_AUTH_MODE=demo` y validar que no se rompa la app.

## 8. Limitaciones actuales
- No hay envio de correo.
- No hay WhatsApp.
- No hay push notifications.
- Fan-out depende de Cloud Functions y requiere despliegue/observabilidad en backend.
- No hay reintentos automaticos ni DLQ.

## 9. Riesgos de seguridad y rules
- En LAB-PROD-008 se ajustan rules para evitar `create` de notificaciones desde cliente normal.
- Si una Cloud Function falla, el evento queda en logs y puede requerir reproceso manual.
- El frontend sigue desacoplado: no debe intentar fan-out directo.

## 10. Fuera de alcance
- Email.
- WhatsApp.
- Push notifications.
- App Check.
- Auditoria avanzada de entregabilidad.

## 11. LAB-PROD-008: Fan-out server-side
- El frontend ya no crea notificaciones.
- La creacion de notificaciones ocurre en Cloud Functions por eventos de Firestore.
- `requestsService` ya no hace fan-out desde navegador.
- `notificationsService` queda para consumir listado/badge y marcar leidas.
- Si falla una function, el problema se analiza en logs server-side, no en consola del cliente.

## 12. LAB-PROD-009: Trazabilidad de entrega
- El frontend no consume `notificationDeliveries`.
- El frontend solo muestra `notificaciones` finales y permite marcar `leida/readAt`.
- Soporte investiga incidencias en `notificationDeliveries` y logs de Functions.
