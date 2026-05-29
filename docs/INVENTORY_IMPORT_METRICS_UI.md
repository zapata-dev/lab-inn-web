# Inventory Import Metrics UI (LAB-PROD-017)

## 1. Objetivo

Conectar las metricas generadas por el importador de inventario (LAB-PROD-016) con la UI de Inventario Nacional para que soporte y usuarios internos puedan ver el estado operativo del inventario sin acceder a Firestore Console.

## 2. Coleccion leida

`importsInventario/{importId}` — solo lectura.

No se escribe en Firestore desde este ticket.

## 3. Metricas mostradas en Inventario Nacional

### InventoryFreshnessBanner

Ya existente, ahora recibe dos props adicionales:

- `missingUnitsCount` — muestra aviso de unidades ausentes si > 0.
- `lastFailedImportAt` — muestra timestamp del ultimo import fallido.
- `lastImportedAt` — ahora se prefiere el valor de `importsInventario` sobre el derivado de `inventario/`.

### InventoryImportSummaryCard

Componente nuevo que aparece solo en modo Firebase, entre el banner de frescura y los KPIs. Muestra:

- Estado del ultimo import (label + color por status).
- Tiempo relativo desde el ultimo import.
- Badge "con warnings" si `completedWithWarnings = true`.
- Grid de 4 metricas:
  - **Unidades** — `registrosUpserted` del ultimo import exitoso.
  - **Errores** — `registrosConError` (resaltado en amber si > 0).
  - **Ausentes** — `registrosAusentes` o `driftResumen.ausentes` (resaltado si > 0).
  - **Calidad** — `calidadResumen.promedioScore` en porcentaje.
- Boton "Ver historial" que abre el drawer.

### InventoryImportHistoryDrawer

Panel deslizante derecho con la lista de ultimos imports (max 10). Por cada import muestra:

- `importId` (monospace).
- Status con badge de color.
- Tiempo relativo y fecha/hora.
- Metricas rapidas: upsert, errores, ausentes, calidad, promociones.
- `errorResumen` si status = fallido.
- Seccion expandible (`<details>`) con:
  - `driftResumen`
  - `erroresPorTipo`
  - `warningsPorTipo`
  - `unidadesPorSucursal`

## 4. Como se calcula lastImportedAt

Prioridad:
1. `finishedAt` del ultimo import con `status = "completado"` o `"completado_con_errores"`.
2. Si no hay import exitoso, fallback a `lastImportedAt` derivado de los docs de `inventario/` (via `subscribeLiveInventory`).

## 5. Como se calcula missingUnitsCount

Se lee de `latestSuccessfulImport.registrosAusentes` o bien de `latestSuccessfulImport.driftResumen.ausentes`.

Si no hay import exitoso en el historial, `missingUnitsCount = 0` y no se muestra aviso de ausentes.

## 6. Como interpretar calidad

- `dataQualityScore` = `calidadResumen.promedioScore` del ultimo import exitoso.
- Score 90-100: calidad alta.
- Score 70-89: calidad media (revisar warnings).
- Score < 70: calidad baja (revisar CSV fuente).
- El score puede bajar por: marca o modelo vacios, precio invalido, sucursal ausente, ano fuera de rango, fotos mal formateadas.

## 7. Como interpretar completedWithWarnings

`completedWithWarnings = true` indica que el import proceso unidades pero alguna tenia campos incompletos o de baja calidad. El inventario se actualizo igualmente. Hay que revisar `warningsPorTipo` en el drawer.

## 8. Que ve el usuario en Inventario Nacional

En modo Firebase (VITE_AUTH_MODE=firebase):

1. **Banner de frescura** — indica si el inventario esta dentro del umbral de actualidad, si hay ausentes, y si hubo un import fallido.
2. **Card de ultimo import** — muestra status, tiempo, calidad y metricas clave en 4 celdas.
3. **Boton "Ver historial"** — abre el drawer lateral con lista de corridas.
4. **Drawer de historial** — lista de hasta 10 imports con detalles expandibles.

En modo demo (VITE_AUTH_MODE=demo):

- El banner de frescura se muestra normalmente (sin metricas de import).
- La card de ultimo import **no se muestra** (solo aparece en Firebase).
- El drawer no se abre porque el boton no esta visible.

## 9. Pruebas manuales

### Modo demo
```bash
VITE_AUTH_MODE=demo npm run dev
```
1. Confirmar que Inventario Nacional carga sin errores.
2. Confirmar que no hay card de ultimo import.
3. Confirmar que filtros, tabla, cards, detalle y PDF siguen funcionando.

### Modo Firebase con datos manuales

1. Crear en Firestore `importsInventario/import_test_ok`:
```json
{
  "importId": "import_test_ok",
  "status": "completado_con_errores",
  "startedAt": "<serverTimestamp>",
  "finishedAt": "<serverTimestamp>",
  "totalRegistros": 10,
  "registrosUpserted": 9,
  "registrosConError": 1,
  "registrosAusentes": 2,
  "completedWithWarnings": true,
  "calidadResumen": { "filasValidas": 9, "filasInvalidas": 1, "promedioScore": 88, "warnings": 3 },
  "driftResumen": { "nuevas": 2, "actualizadas": 7, "ausentes": 2, "errores": 1, "totalPrevio": 9, "totalActual": 9 }
}
```

2. Crear `importsInventario/import_test_failed`:
```json
{
  "importId": "import_test_failed",
  "status": "fallido",
  "startedAt": "<serverTimestamp anterior>",
  "errorResumen": "INVENTORY_IMPORT_FETCH_FAILED_404"
}
```

3. Abrir Inventario Nacional.
4. Verificar:
   - Banner muestra "2 unidades ausentes en ultimo import".
   - Banner muestra "Ultimo import fallido hace X min".
   - Card muestra status "Completado con errores" + badge "con warnings".
   - Card muestra 9 upsert, 1 error, 2 ausentes, calidad 88%.
5. Click "Ver historial".
6. Verificar lista de 2 imports.
7. Expandir detalles del primer import.
8. Cerrar drawer.
9. Confirmar que solicitudes, detalle de unidad, filtros y PDF siguen funcionando.

## 11. Vista de operacion interna para soporte (LAB-PROD-018)

Para operacion detallada de imports, soporte puede acceder a:

```
/soporte/inventario/imports
```

Esta vista incluye:
- Historial completo con filtro por status.
- Detalle expandido de cada corrida (todos los campos de `importsInventario`).
- Ejecucion de import manual via callable seguro.
- Copiar importId y link a Inventario Nacional.

Ver `docs/SUPPORT_INVENTORY_IMPORTS.md`.

## 10. Limitaciones

- Solo lectura de `importsInventario`. No permite editar ni relanzar imports desde la UI.
- No reemplaza Firebase Console para debugging tecnico profundo.
- No crea alertas externas (email, Slack, PagerDuty).
- No conecta SAP ni Salesforce.
- El historial muestra max 10 imports. Para ver mas, revisar Firebase Console.
- En modo demo no hay metricas reales de import.
- El drawer no es accesible via teclado (se cierra con click en overlay). Mejora pendiente.
