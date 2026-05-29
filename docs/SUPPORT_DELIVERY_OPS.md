# Operacion Avanzada de Entregas (LAB-PROD-011)

## 1. Objetivo
Mejorar la operacion diaria de soporte en `/soporte/notificaciones` con herramientas de diagnostico rapido sin entrar directo a Firestore.

## 2. Ruta interna
- `/soporte/notificaciones`
- `/soporte/notificaciones/attempts`

Acceso exclusivo para rol `soporte`.

## 3. Que puede hacer soporte
- Aplicar filtros por `status`, `sourceType`, `solicitudId` y `userId`.
- Abrir detalle tecnico de cada entrega.
- Copiar IDs tecnicos (`deliveryId`, `notificationId`, `solicitudId`, `userId`).
- Ejecutar retry manual cuando `status = failed`.
- Exportar el resultado filtrado a CSV.
- Revisar historial granular real por intento cuando la entrega ya tiene `attempts`.

## 4. Como usar filtros
1. Seleccionar estado y/o tipo de evento.
2. Capturar `solicitudId` o `userId` cuando exista incidente puntual.
3. Revisar chips de filtros activos.
4. Usar `Limpiar filtros` para regresar a vista general.

## 5. Como exportar CSV
1. Aplicar filtros necesarios.
2. Presionar `Exportar CSV`.
3. Validar columnas operativas:
   - `deliveryId`
   - `notificationId`
   - `sourceType`
   - `solicitudId`
   - `userId`
   - `tipo`
   - `status`
   - `attemptCount`
   - `lastError`
   - `createdAt`
   - `updatedAt`
   - `deliveredAt`
   - `retriedAt`

## 6. Como interpretar `attemptCount` y `status`
- `attemptCount`: total de intentos registrados para esa entrega.
- `pending`: entrega registrada, aun sin resultado final.
- `delivered`: notificacion creada correctamente.
- `skipped_duplicate`: duplicado evitado por idempotencia.
- `failed`: fallo operativo, revisar `lastError`.
- `retried`: entrega recuperada tras retry manual.

## 7. Como usar retry manual
1. Abrir detalle de la entrega.
2. Confirmar `status = failed`.
3. Presionar `Reintentar entrega`.
4. Revisar respuesta de callable y refresco en lista.

## 8. Revision de logs de Cloud Functions
Para incidentes complejos, cruzar la vista de soporte con logs de Functions:

```bash
npx firebase-tools functions:log
```

Buscar por:
- `deliveryId`
- `notificationId`
- `solicitudId`
- `sourceType`

## 9. Que copiar al reportar incidente
- `deliveryId`
- `notificationId`
- `solicitudId`
- `userId`
- `status`
- `attemptCount`
- `lastError`
- timestamp `updatedAt`

## 10. Limitaciones actuales
- Sin DLQ avanzada.
- Sin alertas automaticas.
- Sin correo/WhatsApp.
- Entregas antiguas pueden no tener `attempts`; en esos casos la UI usa fallback derivado.
- Sin dashboard ejecutivo.
