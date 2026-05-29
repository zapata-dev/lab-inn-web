# Scheduled Inventory Import (LAB-PROD-015)

## 1. Objetivo
Implementar importacion server-side diaria de inventario desde CSV/Sheets hacia Firestore usando Cloud Functions v2.

## 2. Arquitectura
- Trigger programado: `scheduledInventoryImport` (`onSchedule`).
- Trigger manual: `runInventoryImportNow` (callable, solo soporte).
- Parser server-side: `functions/csvParser.js`.
- Mapper server-side: `functions/inventoryMapper.js`.
- Importador: `functions/inventoryImport.js`.

## 3. Variables de entorno
Configurar en entorno de Functions:

- `INVENTORY_CSV_URL=`
- `INVENTORY_IMPORT_SCHEDULE=every day 05:00`
- `INVENTORY_IMPORT_TIME_ZONE=America/Mexico_City`
- `INVENTORY_IMPORT_SOURCE=csv`

Archivo de referencia en repo: `functions/.env.example`.

## 4. Formato esperado del CSV
- Primera fila con encabezados.
- Filas con datos de unidades.
- Alias soportados en mapper para espanol/ingles.

## 5. Campos obligatorios
- Obligatorio por fila: `vin` (o alias equivalente).
- Si falta VIN, la fila se registra como error y no bloquea toda la corrida.

## 6. Alias soportados
Principales alias soportados:
- VIN: `vin`, `VIN`, `serie`, `Serie`
- Marca: `marca`, `brand`
- Modelo: `modelo`, `model`
- Ano: `anio`, `año`, `year`
- Sucursal ID: `sucursalId`, `branchId`, `sucursal`
- Sucursal nombre: `sucursalNombre`, `branchName`
- Precio: `precio`, `price`
- Status: `status`, `estado`
- Promocion: `promocion`, `promotion`
- Fotos: `fotos`, `images`

## 7. Ejecucion diaria
`schedule` por default:
- `every day 05:00`
- `America/Mexico_City`

La funcion lee `INVENTORY_CSV_URL` y ejecuta upserts en `inventario/{vin}`.

## 8. Ejecucion manual (soporte)
Callable:
- `runInventoryImportNow`

Requisitos:
- Usuario autenticado.
- `usuarios/{uid}` con `rol = soporte` y `activo = true`.

Payload opcional:
- `sourceUrl` para correr una URL puntual.

## 9. Trazabilidad en Firestore
Bitacora por corrida:
- `importsInventario/{importId}`

Campos clave:
- `status`
- `totalRegistros`
- `registrosCreados`
- `registrosActualizados`
- `registrosUpserted`
- `registrosConError`
- `errorResumen`
- `startedAt`
- `finishedAt`

## 10. Revision de errores
- Revisar `importsInventario/{importId}.errorResumen`.
- Revisar logs de Functions:
```bash
npx firebase-tools functions:log
```

## 11. Limitaciones
- No integra SAP/Salesforce en este ticket.
- No borra unidades ausentes en CSV (solo upsert).
- Parser CSV es simple (cubre casos comunes de comillas y comas, no 100% RFC estricto).
- `registrosCreados`/`registrosActualizados` se calculan con lectura previa por lote (puede crecer en costo en inventarios grandes).

## 12. Pruebas manuales
1. `npm run lint`
2. `npm run build`
3. `cd functions && npm install`
4. `npm run lint`
5. `node --check index.js`
6. `node --check inventoryImport.js`
7. `node --check inventoryMapper.js`
8. `node --check csvParser.js`
9. Deploy opcional: `npx firebase-tools deploy --only functions`
10. Ejecutar callable `runInventoryImportNow` como soporte.
11. Verificar `inventario/{vin}` y `importsInventario/{importId}`.

## 13. Rollback
Si una corrida falla:
- Corregir URL/CSV.
- Reintentar con callable manual.
- Mantener datos previos; no se borran documentos de inventario existentes.

## 17. LAB-PROD-020: Deploy real de Functions e Inventario

### Variables requeridas para el importador

Antes del deploy, configurar en Functions:

```bash
# Opción A: archivo functions/.env (solo para dev local, no commitear)
INVENTORY_CSV_URL=https://...

# Opción B: Firebase CLI secrets (recomendado para producción)
npx firebase-tools functions:secrets:set INVENTORY_CSV_URL
```

Variables opcionales (tienen defaults en el código):

```bash
INVENTORY_IMPORT_SCHEDULE=every day 05:00
INVENTORY_IMPORT_TIME_ZONE=America/Mexico_City
INVENTORY_IMPORT_SOURCE=csv
```

### Comandos de deploy

```bash
# Solo functions
npx firebase-tools deploy --only functions

# Deploy completo (rules + indexes + functions + hosting)
npx firebase-tools deploy
```

### Verificar tras deploy

1. Firebase Console > Functions — confirmar que `scheduledInventoryImport` y `runInventoryImportNow` están activos.
2. GCP Console > Cloud Scheduler — confirmar que el job tiene el schedule correcto.
3. Ejecutar import manual desde `/soporte/inventario/imports` para verificar que `INVENTORY_CSV_URL` está configurada.

Ver runbook completo en [FIREBASE_DEPLOY_RUNBOOK.md](./FIREBASE_DEPLOY_RUNBOOK.md).

## 16. LAB-PROD-019: Índices Firestore para imports e inventario ausente

A partir de LAB-PROD-019, las consultas de la cabina soporte y las futuras consultas de inventario ausente están respaldadas por índices compuestos en `firestore.indexes.json`.

### Índices en `importsInventario`

- `status ASC + startedAt DESC` — activa filtro server-side en `/soporte/inventario/imports`.

### Índices en `inventario`

- `importStatus ASC + updatedAt DESC` — consultas de unidades activas o ausentes.
- `presentInLatestImport ASC + updatedAt DESC` — unidades por presencia en último import.
- `sucursalId ASC + importStatus ASC` — ausentes por sucursal.
- `sucursalId ASC + presentInLatestImport ASC` — presencia por sucursal.

### Cómo desplegar

```bash
npx firebase-tools deploy --only firestore:indexes
```

Si los índices no están desplegados, el filtro por status en `/soporte/inventario/imports` muestra:

```
Falta índice Firestore para status + startedAt. Despliega firestore.indexes.json.
```

Ver `docs/FIRESTORE_INDEXES.md` para detalle completo de todos los índices del proyecto.

## 15. LAB-PROD-018: Vista soporte para import manual

A partir de LAB-PROD-018, soporte puede operar imports desde la UI interna:

- Ruta: `/soporte/inventario/imports` (solo rol `soporte`).
- Ejecutar `runInventoryImportNow` con URL opcional desde panel UI.
- Ver historial de corridas con filtro por status.
- Ver detalle completo de cada corrida.
- Copiar importId y abrir Inventario Nacional desde el detalle.
- No escribe directo en Firestore; usa el callable seguro.
- Ver guia en `docs/SUPPORT_INVENTORY_IMPORTS.md`.

## 14. LAB-PROD-016: Hardening de calidad y drift

A partir de LAB-PROD-016, el importador incluye:

### Validacion avanzada por fila

- Errores (excluyen fila): VIN ausente, VIN < 5 caracteres.
- Warnings (no bloquean): marca, modelo, precio, sucursal, ano, status, fotos.
- Un import con warnings reporta `status = completado` y `completedWithWarnings = true`.

### Campos extendidos en `importsInventario/{importId}`

- `registrosAusentes` — unidades que no llegaron en este import.
- `driftResumen` — nuevas, actualizadas, ausentes, errores, totalPrevio, totalActual.
- `calidadResumen` — filasValidas, filasInvalidas, promedioScore, warnings.
- `erroresPorTipo` — conteo de errores por tipo.
- `warningsPorTipo` — conteo de warnings por tipo.
- `unidadesPorSucursal` — distribucion de unidades validas por sucursal.
- `promocionesActivas` — unidades con promocion activa.
- `completedWithWarnings` — boolean.

### Deteccion de ausentes sin borrado

- Unidades que existian en `inventario/` pero no llegaron en el CSV quedan con `importStatus = "missing_from_latest_import"`.
- No se borran. Ver `docs/INVENTORY_IMPORT_HARDENING.md` para runbook completo.

### Nuevos modulos

- `functions/inventoryQuality.js` — validacion y scoring de calidad.
- `functions/inventoryDrift.js` — snapshot, drift y marcado de ausentes.
