# Firestore Indexes - LAB Produccion Piloto

## 1. Objetivo

Documentar los indices compuestos sugeridos para soportar consultas clave de LAB en Produccion Piloto con buena latencia y costo controlado.

Este documento no crea aun `firestore.indexes.json`.

## 2. Consultas que debe soportar LAB

### 2.1 Solicitudes

- Listar solicitudes por estado, ordenadas por ultima actualizacion.
- Listar solicitudes de un vendedor por fecha de creacion.
- Bandeja de coordinador por sucursal solicitante y estado.
- Bandeja de coordinador por sucursal duena y estado.
- Priorizar actividad reciente por sucursal solicitante o duena.

### 2.2 Inventario

- Filtro por sucursal y status.
- Filtro por marca y status.
- Filtro por promocion dentro de sucursal.
- Orden por `updatedAt` descendente.

### 2.3 Notificaciones

- No leidas por usuario con orden cronologico inverso.
- Historial de notificaciones por usuario.

### 2.4 Auditoria

- Trazabilidad por entidad + entidadId.
- Trazabilidad por actor.
- Seguimiento por accion.

### 2.5 Imports de inventario

- Cola por status y fecha.
- Historial por fuente y fecha.

## 3. Indices sugeridos

## 3.1 `solicitudes`

| Campos indexados | Orden recomendado | Consulta objetivo |
|---|---|---|
| `estado`, `updatedAt` | `estado ASC`, `updatedAt DESC` | Bandeja global por estado |
| `vendedorId`, `createdAt` | `vendedorId ASC`, `createdAt DESC` | Mis solicitudes del vendedor |
| `sucursalSolicitanteId`, `estado`, `updatedAt` | `sucursalSolicitanteId ASC`, `estado ASC`, `updatedAt DESC` | Coordinador (solicitante) por estado |
| `sucursalDuenaId`, `estado`, `updatedAt` | `sucursalDuenaId ASC`, `estado ASC`, `updatedAt DESC` | Coordinador (duena) por estado |
| `sucursalSolicitanteId`, `lastActivityAt` | `sucursalSolicitanteId ASC`, `lastActivityAt DESC` | Actividad reciente sucursal solicitante |
| `sucursalDuenaId`, `lastActivityAt` | `sucursalDuenaId ASC`, `lastActivityAt DESC` | Actividad reciente sucursal duena |

## 3.2 `inventario`

| Campos indexados | Orden recomendado | Consulta objetivo |
|---|---|---|
| `sucursalId`, `status` | `sucursalId ASC`, `status ASC` | Inventario por sucursal y disponibilidad |
| `marca`, `status` | `marca ASC`, `status ASC` | Inventario por marca |
| `promocion`, `sucursalId` | `promocion ASC`, `sucursalId ASC` | Campanas por sucursal |
| `updatedAt` | `updatedAt DESC` | Listado reciente |

## 3.3 `notificaciones`

| Campos indexados | Orden recomendado | Consulta objetivo |
|---|---|---|
| `userId`, `leida`, `createdAt` | `userId ASC`, `leida ASC`, `createdAt DESC` | Inbox no leidas por usuario |
| `userId`, `createdAt` | `userId ASC`, `createdAt DESC` | Historial de notificaciones |

## 3.4 `auditoria`

| Campos indexados | Orden recomendado | Consulta objetivo |
|---|---|---|
| `entidad`, `entidadId`, `createdAt` | `entidad ASC`, `entidadId ASC`, `createdAt DESC` | Timeline por entidad |
| `actorId`, `createdAt` | `actorId ASC`, `createdAt DESC` | Actividad por usuario |
| `accion`, `createdAt` | `accion ASC`, `createdAt DESC` | Monitoreo por tipo de accion |

## 3.5 `importsInventario`

| Campos indexados | Orden recomendado | Consulta objetivo |
|---|---|---|
| `status`, `createdAt` | `status ASC`, `createdAt DESC` | Seguimiento de procesos |
| `fuente`, `createdAt` | `fuente ASC`, `createdAt DESC` | Historial por origen |

## 4. Riesgos de costo/performance

- Muchos indices compuestos elevan costo de escritura por documento.
- Consultas con filtros no indexados pueden fallar en tiempo de ejecucion.
- `auditoria` e `importsInventario` pueden crecer rapido y degradar costo.
- Ordenes descendentes en multiples vistas aumentan presion de indexado.

Mitigaciones:

- Crear primero indices minimos del flujo critico (`solicitudes`, `notificaciones`).
- Revisar usage metrics tras 2 semanas de piloto.
- Definir retencion/archivado para `auditoria` e imports historicos.
- Evitar queries ad hoc fuera de backlog sin analisis de indice.

## 5. Indices a diferir

- `solicitudes` por `prioridad + estado + updatedAt` (hasta confirmar uso real).
- `inventario` por `modelo + anio + status` (activar si filtro avanzado se vuelve critico).
- `notificaciones` por `canal + enviada + createdAt` (util para soporte, no critico V1).
- `auditoria` por `actorEmail + accion + createdAt` (esperar volumen real).

## Nota operativa

Cuando inicie implementacion Firebase (ticket posterior), convertir este documento en `firestore.indexes.json` incremental para evitar crear indices innecesarios desde dia 1.

## Implementado en firestore.indexes.json

Desde `LAB-PROD-005`, los indices minimos definidos en este documento ya estan materializados en `firestore.indexes.json` para:

- `solicitudes`
- `inventario`
- `notificaciones`
- `auditoria`
- `importsInventario`

Proximo paso recomendado: revisar metricas reales de uso/costo despues de las primeras semanas del piloto y ajustar indices diferidos.

## LAB-PROD-019 — Índices para filtro server-side de imports y consultas de inventario ausente

**Fecha**: 2026-05-29

### Problema

La cabina soporte `/soporte/inventario/imports` (LAB-PROD-018) filtraba por status **client-side** sobre 100 documentos para evitar requerir un índice compuesto. Esto es suficiente para piloto inicial pero limita escalabilidad y precisión del límite de resultados.

### Índices agregados

**`importsInventario: status ASC + startedAt DESC`**
Requerido cuando `subscribeInventoryImports` recibe `filters.status`.
El campo correcto es `startedAt` (no `createdAt` que usa el índice previo).

**`inventario: importStatus ASC + updatedAt DESC`**
Consultas de unidades activas o ausentes ordenadas por última actualización.
Habilitado para tickets futuros de reporting de drift.

**`inventario: presentInLatestImport ASC + updatedAt DESC`**
Listar unidades que no llegaron en el último import por recencia.

**`inventario: sucursalId ASC + importStatus ASC`**
Reportes de unidades ausentes por sucursal.

**`inventario: sucursalId ASC + presentInLatestImport ASC`**
Presencia de inventario por sucursal en último import.

### Comportamiento antes del despliegue

Si los índices no están desplegados y soporte aplica filtro de status, Firestore responde `failed-precondition`. El servicio captura este error y muestra:

```
Falta índice Firestore para status + startedAt. Despliega firestore.indexes.json.
```

Sin filtro de status (vista "Todos"), la cabina carga normalmente.

### Cómo desplegar

```bash
npx firebase-tools deploy --only firestore:indexes
```

### Validación local

```bash
node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('indexes ok')"
```
