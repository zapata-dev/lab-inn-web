# LAB Functions

Cloud Functions para eventos de Firestore en LAB.

## Incluido en LAB-PROD-009

- `onRequestCreated`: notifica al crear `solicitudes/{solicitudId}`.
- `onRequestCommentCreated`: notifica al crear `solicitudes/{solicitudId}/comentarios/{comentarioId}`.
- `onRequestStatusUpdated`: notifica cuando cambia `estado` en `solicitudes/{solicitudId}`.
- `retryNotificationDelivery` (callable): retry manual de entregas fallidas, solo soporte.
- `scheduledInventoryImport`: importa inventario desde CSV con `onSchedule`.
- `runInventoryImportNow` (callable): ejecuta import manual de inventario, solo soporte.

## Instalar dependencias

```bash
cd functions
npm install
```

## Deploy

```bash
npx firebase-tools deploy --only functions
```

## Variables de entorno (inventario)

Definir en el entorno de Functions (no en repo con secretos):

- `INVENTORY_CSV_URL`
- `INVENTORY_IMPORT_SCHEDULE` (default `every day 05:00`)
- `INVENTORY_IMPORT_TIME_ZONE` (default `America/Mexico_City`)
- `INVENTORY_IMPORT_SOURCE` (default `csv`)

Referencia local de ejemplo: `functions/.env.example`.

## Logs

```bash
npx firebase-tools functions:log
```

En Firebase Console: Functions > Logs.

## Verificar delivery records

Coleccion:

- `notificationDeliveries/{deliveryId}`
- `notificationDeliveries/{deliveryId}/attempts/{attemptId}`

Estados clave:

- `delivered`
- `skipped_duplicate`
- `failed`
- `retried`

Attempt statuses:

- `delivered`
- `skipped_duplicate`
- `failed`
- `retried`
- `retry_not_required`

## Probar idempotencia

1. Generar evento de solicitud/comentario/estado.
2. Revisar `notificationDeliveries` por `sourceType` y `solicitudId`.
3. Verificar que repetir el mismo evento no cree `notificaciones` duplicadas.
4. Confirmar `status = skipped_duplicate` en reejecucion.

## Revisar attempts granulares

1. Abrir un `deliveryId` en Firestore.
2. Validar subcoleccion:
   - `notificationDeliveries/{deliveryId}/attempts/attempt_1`
3. Verificar que cada nuevo intento crea `attempt_{n}` con `reason` y `status`.

## Revisar drift de inventario (LAB-PROD-016)

Despues de cada corrida, revisar `importsInventario/{importId}.driftResumen`:

```json
{
  "nuevas": 10,
  "actualizadas": 245,
  "ausentes": 4,
  "errores": 3,
  "totalPrevio": 249,
  "totalActual": 255
}
```

## Revisar errores por tipo

Campo `importsInventario/{importId}.erroresPorTipo`:

```json
{ "vin_missing": 2, "vin_too_short": 1 }
```

Tipos de error actuales: `vin_missing`, `vin_too_short`, `validation_failed`, `normalize_failed`.

## Revisar warnings por tipo

Campo `importsInventario/{importId}.warningsPorTipo`:

```json
{ "precio_invalido": 5, "sucursal_missing": 2, "marca_missing": 1 }
```

Tipos de warning: `marca_missing`, `modelo_missing`, `precio_invalido`, `sucursal_missing`, `anio_invalido`, `status_missing`, `fotos_invalidas`.

## Revisar unidades ausentes

Unidades que estaban en `inventario/` pero no vinieron en el CSV quedan con:

- `importStatus = "missing_from_latest_import"`
- `presentInLatestImport = false`
- `missingSinceImportId` / `missingSinceAt` (fecha de primera ausencia)

Consultar en Firestore:
```
inventario donde importStatus == "missing_from_latest_import"
```

Las unidades ausentes **no se borran**. Para darlas de baja, actualizar manualmente su `importStatus` o esperar integracion con SAP/Salesforce.

## Notas

- Implementado en JavaScript (Node 20).
- Usa Admin SDK (`firebase-admin`), no depende de Firestore Rules para escrituras server-side.
- El frontend solo consume notificaciones y marca leidas.
- El import de inventario escribe server-side en `inventario/{vin}` y deja bitacora en `importsInventario/{importId}`.
