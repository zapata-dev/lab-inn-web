# Soporte - Importaciones de Inventario (LAB-PROD-018)

## 1. Objetivo

Dar a soporte una cabina interna para operar el importador de inventario sin acceder a Firebase Console ni Cloud Functions Logs directamente.

## 2. Ruta interna

```
/soporte/inventario/imports
```

Accesible navegando directamente. No aparece en Sidebar.

## 3. Quien puede entrar

Solo usuarios con `rol = soporte` y `activo = true`.

- Vendedores, coordinadores, gerentes: redirigen a `/unauthorized`.
- En modo demo: muestra mensaje de "solo Firebase".

## 4. Que hace el panel

### Panel de ejecucion manual

- Campo opcional para URL de CSV personalizada.
- Si se deja vacio, usa `INVENTORY_CSV_URL` configurado en Cloud Functions.
- Antes de ejecutar pide confirmacion via dialog nativo.
- Llama al callable `runInventoryImportNow` en Cloud Functions.
- No escribe directamente en Firestore.
- Muestra resultado: importId, status, upserted, errores, ausentes, calidad.

### Historial de imports

- Lista de ultimas corridas desde `importsInventario`, ordenado por `startedAt` desc.
- Filtros: status (completado, con errores, fallido, procesando), limite de resultados.
- El filtro por status se aplica server-side via índice compuesto `status + startedAt DESC`.
- Boton "Detalle" por cada corrida.

### Detalle de corrida

- Panel lateral derecho con todos los campos del import.
- Boton "Copiar ID" para copiar el importId al portapapeles.
- Link "Abrir Inventario Nacional" para ver el resultado en la app.

## 5. Como ejecutar import manual

1. Ir a `/soporte/inventario/imports`.
2. En "Ejecutar import manual", dejar URL vacia (usa configuracion de Functions) o pegar URL de CSV.
3. Click "Ejecutar import ahora".
4. Confirmar el dialog.
5. Esperar resultado (puede tardar varios segundos).
6. Ver resultado: importId, status, metricas.
7. La lista de historial se actualiza automaticamente.

### Si el callable falla

Causas comunes:

- `INVENTORY_CSV_URL_NOT_CONFIGURED`: la variable de entorno no esta en Cloud Functions.
- `INVENTORY_IMPORT_FETCH_FAILED_XXX`: la URL no esta disponible o requiere autenticacion.
- `functions/permission-denied`: el usuario no tiene rol soporte.
- `functions/unauthenticated`: no esta autenticado.

## 6. Como interpretar status de import

| Status | Significado |
|--------|-------------|
| `procesando` | Import en curso |
| `completado` | Todas las filas fueron importadas sin errores |
| `completado_con_errores` | Algunas filas fallaron (VIN ausente, etc.) pero hubo validas |
| `fallido` | Error fatal (no se pudo descargar CSV, crash de la funcion) |

## 7. Como interpretar calidad y drift

- `calidadResumen.promedioScore`: puntaje 0-100. Bajo 70 indica datos pobres en CSV.
- `driftResumen.ausentes`: unidades que estaban en inventario pero no llegaron en este import.
- `registrosAusentes > 0`: unidades marcadas como `missing_from_latest_import` (no borradas).
- `warningsPorTipo`: muestra cuales campos tienen datos vacios o invalidos.

Ver `docs/INVENTORY_IMPORT_HARDENING.md` para detalle completo de calidad y drift.

## 8. Como investigar errores

1. Filtrar historial por status `fallido`.
2. Abrir detalle del import.
3. Revisar `errorResumen` en el detalle.
4. Para errores de campos por fila, revisar `erroresPorTipo`.
5. Para fallos profundos, revisar Functions Logs:

```bash
npx firebase-tools functions:log
```

O en Firebase Console: Functions > Logs > filtrar por `scheduledInventoryImport` o `runInventoryImportNow`.

## 9. Que queda fuera de esta vista

- No integra SAP ni Salesforce.
- No edita documentos de inventario manualmente.
- No borra inventario ni imports.
- No crea alertas externas (email, Slack).
- No muestra logs granulares de Functions (usar Firebase Console para eso).
- No tiene paginacion de historial (max 100 corridas visibles).
- El filtro por status requiere que `firestore.indexes.json` esté desplegado. Sin despliegue, el filtro muestra error claro con instrucciones.

## 10. Pruebas manuales

```bash
npm run lint
npm run build
```

En Firebase:

1. Login como soporte.
2. Ir a `/soporte/inventario/imports`.
3. Ver historial.
4. Filtrar por `fallido`.
5. Abrir detalle de una corrida.
6. Click "Copiar ID", verificar portapapeles.
7. Click "Abrir Inventario Nacional".
8. Volver y ejecutar import manual sin sourceUrl.
9. Confirmar dialog.
10. Ver resultado.
11. Login como vendedor/coordinador y confirmar redireccion a `/unauthorized`.
12. Confirmar Sidebar sigue con 5 categorias.
