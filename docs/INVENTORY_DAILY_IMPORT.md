# Inventory Daily Import (LAB-PROD-014)

## 1. Objetivo
Preparar la base productiva para operar inventario diario desde CSV/Sheets hacia Firestore y consumirlo en la app en modo Firebase.

## 2. Por que CSV/Sheets antes de SAP/Salesforce
- Permite operar piloto rapido con datos reales.
- Reduce complejidad de integraciones en Fase 3.
- Mantiene trazabilidad en `importsInventario` desde dia cero.

## 3. Modelo `inventario/{vin}`
VIN es ID canónico de documento.

Campos minimos recomendados:
- `vin`
- `marca`
- `modelo`
- `anio`
- `sucursalId`
- `sucursalNombre`
- `precio`
- `status`
- `promocion`
- `fotos`
- `configuracion`
- `fuente`
- `lastImportedAt`
- `updatedAt`

## 4. Modelo `importsInventario/{importId}`
Campos sugeridos:
- `importId`
- `fuente`
- `archivoNombre`
- `totalRegistros`
- `registrosCreados`
- `registrosActualizados`
- `registrosConError`
- `status`
- `errorResumen`
- `startedAt`
- `finishedAt`
- `createdBy`

## 5. Campos obligatorios
- Obligatorio: `vin`.
- Deseable: `marca`, `modelo`, `sucursalId` y/o `sucursalNombre`, `status`, `precio`.

## 6. Mapeo de columnas soportadas
`inventoryMapper` soporta alias espanol/ingles, por ejemplo:
- VIN: `vin`, `VIN`, `serie`, `Serie`
- Marca: `marca`, `brand`
- Modelo: `modelo`, `model`
- Año: `anio`, `año`, `year`
- Sucursal ID: `sucursalId`, `branchId`, `sucursal`
- Sucursal nombre: `sucursalNombre`, `branchName`
- Precio: `precio`, `price`
- Status: `status`, `estado`
- Promocion: `promocion`, `promotion`
- Fotos: `fotos`, `images`

## 7. Como cargar datos manualmente para piloto
1. Generar CSV/Sheets con VIN por fila.
2. Cargar/actualizar docs manualmente en Firestore `inventario/{vin}`.
3. (Opcional) registrar corrida en `importsInventario/{importId}`.
4. Abrir Inventario Nacional en modo Firebase y validar lectura.

## 8. Como validar freshness
- La UI usa `InventoryFreshnessBanner`.
- Umbral configurable con:
  - `VITE_INVENTORY_STALE_HOURS` (default 24).
- Si supera el umbral, muestra alerta de inventario desactualizado.

## 9. Queda para ticket posterior
- Cloud Function importadora (server-side).
- Cloud Scheduler diario.
- Validacion avanzada de columnas y calidad de datos.
- Integracion SAP/Salesforce en vivo.
- Soft-lock de unidad por colision comercial.

## 10. Pruebas manuales
1. `npm run lint`
2. `npm run build`
3. `VITE_AUTH_MODE=demo` y validar flujo actual.
4. `VITE_AUTH_MODE=firebase`.
5. Crear 2-3 docs en `inventario/{vin}`.
6. Abrir Inventario Nacional y validar:
   - unidades visibles
   - freshness banner
   - cards/tabla/filtros
   - apertura de detalle
   - solicitud de unidad

## 11. LAB-PROD-015: Importador server-side diario
- El frontend queda como consumidor de `inventario/{vin}` en modo Firebase.
- La escritura diaria de inventario se mueve a Cloud Functions:
  - `scheduledInventoryImport` (programada)
  - `runInventoryImportNow` (manual, solo soporte)
- Cada corrida deja bitacora en `importsInventario/{importId}`.
- Ver guia operativa en:
  - `docs/SCHEDULED_INVENTORY_IMPORT.md`

## 13. LAB-PROD-017: Metricas visibles en Inventario Nacional

A partir de LAB-PROD-017, el inventario nacional muestra el estado operativo del importador directamente en la UI:

- `InventoryImportSummaryCard` — card con ultimo import, calidad y metricas clave (solo modo Firebase).
- `InventoryImportHistoryDrawer` — drawer lateral con historial de ultimas 10 corridas.
- `InventoryFreshnessBanner` — ahora recibe `missingUnitsCount` y `lastFailedImportAt` desde `importsInventario`.
- El servicio `inventoryImportMetricsService.js` se suscribe en tiempo real a `importsInventario`.
- Ver guia completa en `docs/INVENTORY_IMPORT_METRICS_UI.md`.

## 12. LAB-PROD-016: Campos de ausentes y calidad

A partir de LAB-PROD-016, el modelo `inventario/{vin}` incluye campos adicionales:

### Estado de import por unidad

- `importStatus`: `"active"` si llego en el ultimo import, `"missing_from_latest_import"` si no llego.
- `presentInLatestImport`: boolean.
- `lastSeenImportId` / `lastSeenAt`: ultimo import donde llego.
- `missingSinceImportId` / `missingSinceAt`: primer import donde no llego (no cambia en ausencias consecutivas).

### Calidad de datos por unidad

- `dataQualityScore`: puntaje 0-100.
- `dataQualityWarnings`: lista de tipos de warning (`["precio_invalido", "sucursal_missing"]`).

### No-delete de unidades ausentes

Las unidades que no llegan en un import **no se borran**. Solo se marcan. Motivos:

- El CSV puede tener errores transitorios.
- Las unidades pueden tener solicitudes o historial activo.
- La baja definitiva queda para la integracion SAP/Salesforce.

### Lectura de freshness y calidad en UI

El componente `InventoryFreshnessBanner` acepta props opcionales:

- `missingUnitsCount` — muestra aviso de unidades ausentes si > 0.
- `lastFailedImportAt` — muestra info del ultimo import fallido.

El wiring desde `InventarioNacional` queda pendiente para un ticket posterior.

Ver runbook completo en `docs/INVENTORY_IMPORT_HARDENING.md`.
