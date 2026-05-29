# Inventory Import Hardening (LAB-PROD-016)

## 1. Objetivo

Endurecer el importador diario de inventario para que sea operable en piloto: validacion de calidad por fila, deteccion de unidades ausentes sin borrarlas, metricas de drift por corrida y runbook de operacion.

## 2. Que problema resuelve

El importador de LAB-PROD-015 solo validaba presencia de VIN. Esta version:

- Detecta errores estructurales (VIN ausente, VIN demasiado corto).
- Genera advertencias por calidad (marca, modelo, precio, sucursal, ano, status, fotos).
- Detecta unidades que existian en el inventario previo pero no llegaron en el CSV.
- Marca esas unidades como `missing_from_latest_import` sin borrarlas.
- Registra metricas de drift y calidad en `importsInventario/{importId}`.

## 3. Campos nuevos en `inventario/{vin}`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `importId` | string | ID del import que escribio o actualizo este documento |
| `importStatus` | string | `"active"` o `"missing_from_latest_import"` |
| `presentInLatestImport` | boolean | true si vino en el ultimo import |
| `lastSeenImportId` | string | ID del ultimo import donde llego este VIN |
| `lastSeenAt` | timestamp | Timestamp del ultimo import donde llego |
| `missingSinceImportId` | string \| null | ID del primer import donde ya no llego |
| `missingSinceAt` | timestamp \| null | Fecha de primera ausencia |
| `dataQualityScore` | number | Puntaje de calidad 0-100 |
| `dataQualityWarnings` | string[] | Lista de tipos de warning detectados |

### Reglas de actualizacion

**Unidad presente en CSV:**
- `importStatus = "active"`
- `presentInLatestImport = true`
- `lastSeenImportId = importId`
- `lastSeenAt = serverTimestamp`
- `missingSinceImportId = null`
- `missingSinceAt = null`

**Unidad ausente en CSV (existia antes):**
- NO se borra.
- `importStatus = "missing_from_latest_import"`
- `presentInLatestImport = false`
- `missingSinceImportId` y `missingSinceAt` se asignan solo la primera vez que aparece como ausente.

## 4. Campos nuevos en `importsInventario/{importId}`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `registrosAusentes` | number | Unidades que no llegaron en este import |
| `totalInventarioPrevio` | number | Documentos en `inventario/` antes del import |
| `totalCsvActual` | number | Filas validas del CSV de esta corrida |
| `driftResumen` | object | Resumen de cambios (ver abajo) |
| `calidadResumen` | object | Resumen de calidad de datos |
| `erroresPorTipo` | object | Conteo de errores por tipo |
| `warningsPorTipo` | object | Conteo de warnings por tipo |
| `unidadesPorSucursal` | object | Conteo de unidades validas por sucursalId |
| `promocionesActivas` | number | Unidades con `promocion = true` |
| `completedWithWarnings` | boolean | true si hubo warnings aunque no errores fatales |

### Forma de driftResumen

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

### Forma de calidadResumen

```json
{
  "filasValidas": 255,
  "filasInvalidas": 3,
  "promedioScore": 87,
  "warnings": 14
}
```

## 5. Como se calcula calidad

Cada fila del CSV pasa por `validateInventoryUnit` en `functions/inventoryQuality.js`.

**Errores (excluyen la fila del import):**

| Tipo | Descripcion |
|------|-------------|
| `vin_missing` | VIN vacio o ausente |
| `vin_too_short` | VIN con menos de 5 caracteres |

**Warnings (no bloquean el import):**

| Tipo | Penalizacion en score | Descripcion |
|------|-----------------------|-------------|
| `marca_missing` | -15 | Marca vacia |
| `modelo_missing` | -15 | Modelo vacio |
| `precio_invalido` | -10 | Precio nulo o <= 0 |
| `sucursal_missing` | -10 | sucursalId vacio |
| `anio_invalido` | -5 | Ano fuera de rango razonable (< 1980 o > ano actual + 2) |
| `status_missing` | -5 | Status vacio |
| `fotos_invalidas` | -5 | URLs de fotos que no inician con `http` |

El `dataQualityScore` empieza en 100 y descuenta por cada warning. Minimo 0.

## 6. Como se calcula drift

1. Al inicio de cada corrida se lee el snapshot completo de `inventario/` en memoria (Map por VIN).
2. Se compara con los VINs del CSV de esta corrida:
   - **nuevas**: VIN en CSV pero no en snapshot previo.
   - **actualizadas**: VIN en CSV y en snapshot previo.
   - **ausentes**: VIN en snapshot previo pero no en CSV.

## 7. Como se manejan unidades ausentes

1. Se identifican los VINs ausentes del drift.
2. Si el import tuvo al menos una unidad valida (para evitar marcar todo como ausente por CSV vacio), se aplican updates merge a cada unidad ausente.
3. El update solo cambia los campos de estado de import, no toca datos de la unidad (marca, modelo, precio, etc.).
4. Si la unidad ya estaba marcada como `missing_from_latest_import`, se respeta el `missingSinceImportId` y `missingSinceAt` originales.

## 8. Por que no se borran unidades

En V1 piloto:
- El CSV/Sheets puede tener errores transitorios (unidades que no aparecen por error de exportacion).
- Borrar una unidad que tiene solicitudes activas o historial rompe trazabilidad.
- El modelo de datos no tiene cascada configurada para borrado.
- La integracion con SAP/Salesforce (futura) sera la fuente canonica de altas/bajas definitivas.

Las unidades ausentes se marcan y se pueden auditar. Para dar de baja definitivamente, actualizar manualmente o esperar el conector SAP/Salesforce.

## 9. Como investigar errores

1. Abrir `importsInventario/{importId}` en Firestore.
2. Revisar `status` (`completado`, `completado_con_errores`, `fallido`).
3. Revisar `erroresPorTipo` para identificar el tipo de falla mas frecuente.
4. Revisar `errorResumen` para un resumen de las primeras 10 filas con error.
5. Para errores de fetch o crash general, revisar Functions Logs:

```bash
npx firebase-tools functions:log
```

## 10. Como interpretar warnings

Los warnings no bloquean el import pero indican calidad baja de datos:

- `calidadResumen.promedioScore < 70`: el inventario tiene muchos campos vacios. Revisar el CSV fuente.
- `warningsPorTipo.precio_invalido > 0`: unidades con precio vacio o cero. Validar con el area que genera el CSV.
- `warningsPorTipo.sucursal_missing > 0`: unidades sin sucursal asignada. Pueden aparecer en "sin_sucursal" en reportes.

Un import con warnings reporta `completedWithWarnings = true` y `status = completado`.

## 11. Pruebas manuales

### Verificar sintaxis

```bash
cd functions
node --check inventoryQuality.js
node --check inventoryDrift.js
node --check inventoryImport.js
node --check inventoryMapper.js
node --check csvParser.js
node --check index.js
```

### CSV valido (3 VINs con datos completos)

1. Configurar `INVENTORY_CSV_URL` con URL del CSV de prueba.
2. Llamar `runInventoryImportNow` como usuario soporte.
3. Verificar en `inventario/{vin}`: campos `importStatus=active`, `presentInLatestImport=true`, `dataQualityScore`.
4. Verificar en `importsInventario/{importId}`: `calidadResumen`, `driftResumen`, `status=completado`.

### CSV con warnings (precio vacio)

1. Usar CSV con al menos una fila sin precio.
2. Confirmar que el import se completa.
3. Confirmar `warningsPorTipo.precio_invalido >= 1` en `importsInventario`.
4. Confirmar `completedWithWarnings = true`.

### CSV con error (fila sin VIN)

1. Usar CSV con una fila sin VIN.
2. Confirmar que esa fila no se importa.
3. Confirmar `erroresPorTipo.vin_missing >= 1` en `importsInventario`.
4. Confirmar `status = completado_con_errores`.
5. Confirmar que las demas filas validas si se importaron.

### Deteccion de ausentes

1. Import 1: CSV con VIN A, VIN B, VIN C.
2. Import 2: CSV con solo VIN A, VIN B.
3. Verificar VIN C en Firestore:
   - `importStatus = "missing_from_latest_import"`
   - `presentInLatestImport = false`
   - `missingSinceImportId` = ID del import 2
   - Documento NO fue borrado.
4. Si se corre un Import 3 con VIN A, VIN B (sin VIN C de nuevo):
   - `missingSinceImportId` de VIN C NO cambia (se preserva el primer import donde fue ausente).

## 14. Cabina de soporte para revisar calidad y drift (LAB-PROD-018)

Soporte puede revisar metricas de calidad y drift directamente desde la UI:

1. Ir a `/soporte/inventario/imports`.
2. En la lista, ver columnas: upserted, errores, ausentes, calidad.
3. Abrir detalle de una corrida para ver `calidadResumen`, `driftResumen`, `erroresPorTipo`, `warningsPorTipo`, `unidadesPorSucursal`.
4. Filtrar por `completado_con_errores` para encontrar corridas con datos de baja calidad.

## 13. Consumo visual en Inventario Nacional (LAB-PROD-017)

Las metricas de calidad y drift generadas por este hardening ya se consumen visualmente desde Inventario Nacional:

- `calidadResumen.promedioScore` se muestra en la card de ultimo import como "Calidad X%".
- `registrosAusentes` / `driftResumen.ausentes` se pasan al banner de frescura como `missingUnitsCount`.
- `erroresPorTipo`, `warningsPorTipo`, `driftResumen` y `unidadesPorSucursal` son visibles en el drawer de historial de imports.
- `completedWithWarnings` muestra el badge "con warnings" en la card.

Ver guia operativa de la UI en `docs/INVENTORY_IMPORT_METRICS_UI.md`.

## 12. Limitaciones

- No integra SAP ni Salesforce.
- No borra unidades ausentes de forma definitiva.
- El snapshot de inventario es una lectura completa de la coleccion. Si crece mucho (mas de ~5000 docs) se debera optimizar con paginacion o indices.
- El parser CSV es simple; no cubre el 100% del RFC 4180.
- No hay alertas externas (email, Slack) en esta version.
- `sourceHash` no implementado; no se detecta si el CSV no cambio respecto al import anterior.
