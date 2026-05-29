# QA Pilot Test Cases (LAB-PROD-022)

Casos de prueba para el QA end-to-end del piloto LAB.

**Estado posibles:** `Pendiente` / `✓ Pasa` / `✗ Falla` / `Bloqueado`

Registrar resultados en [QA_PILOT_RESULTS_TEMPLATE.md](./QA_PILOT_RESULTS_TEMPLATE.md). Abrir bugs en [QA_PILOT_BUG_LOG.md](./QA_PILOT_BUG_LOG.md).

---

## AUTH — Autenticación y Autorización

| ID | Rol | Precondición | Pasos | Resultado esperado | Severidad si falla | Estado | Evidencia |
|----|-----|-------------|-------|-------------------|-------------------|--------|-----------|
| AUTH-001 | soporte | `usuarios/{uid}` con `rol=soporte, activo=true` | 1. Abrir app. 2. Login con cuenta soporte `@zapata.com.mx`. | Entra a la app, ve menú completo, puede acceder a `/soporte/inventario/imports`. | Alto | Pendiente | |
| AUTH-002 | vendedor | `usuarios/{uid}` con `rol=vendedor, activo=true` | 1. Login con cuenta vendedor `@zapata.com.mx`. | Entra a la app, ve Inventario Nacional. | Alto | Pendiente | |
| AUTH-003 | coordinador | `usuarios/{uid}` con `rol=coordinador, activo=true` | 1. Login con cuenta coordinador `@zapata.com.mx`. | Entra a la app, ve inventario y bandeja de solicitudes. | Alto | Pendiente | |
| AUTH-004 | — | Cuenta Google `@zapata.com.mx` sin documento en `usuarios/{uid}` | 1. Login con cuenta del dominio sin documento en Firestore. | Redirige a `/unauthorized` con mensaje claro. | Alto | Pendiente | |
| AUTH-005 | — | Cuenta Google con dominio externo (no `@zapata.com.mx`) | 1. Intentar login con cuenta externa. | Login bloqueado antes de llegar a la app. | **Crítico** | Pendiente | |

---

## INV — Inventario

| ID | Rol | Precondición | Pasos | Resultado esperado | Severidad si falla | Estado | Evidencia |
|----|-----|-------------|-------|-------------------|-------------------|--------|-----------|
| INV-001 | vendedor | Inventario importado con al menos 10 unidades | 1. Login. 2. Abrir Inventario Nacional. | Lista de unidades carga desde Firestore. KPIs muestran conteos reales. | Alto | Pendiente | |
| INV-002 | vendedor | Import exitoso previo | 1. Abrir Inventario Nacional. | Banner de freshness muestra hora del último import. | Medio | Pendiente | |
| INV-003 | soporte | Functions desplegadas, `INVENTORY_CSV_URL` configurada | 1. Ir a `/soporte/inventario/imports`. 2. Ejecutar import manual sin sourceUrl. 3. Confirmar dialog. | Resultado muestra importId, status completado/completado_con_errores, upserted > 0. | Alto | Pendiente | |
| INV-004 | soporte | Import previo con status `fallido` en Firestore | 1. Ir a `/soporte/inventario/imports`. 2. Filtrar por "fallido". | Import fallido aparece en lista. Detalle muestra `errorResumen`. | Medio | Pendiente | |
| INV-005 | soporte | Import con unidades ausentes (CSV que no incluye todas las unidades previas) | 1. Ejecutar import con CSV parcial. 2. Abrir detalle del import. | `registrosAusentes > 0`. Card en Inventario Nacional muestra conteo de ausentes. Unidades NO borradas en Firestore. | Medio | Pendiente | |
| INV-006 | vendedor | Inventario con al menos 1 unidad | 1. Click en una unidad del inventario. | Drawer/modal de detalle abre con campos: marca, modelo, VIN, precio, sucursal, fotos. | Medio | Pendiente | |
| INV-007 | vendedor | Unidad con datos completos | 1. Abrir detalle de unidad. 2. Click "Export PDF". | PDF descarga o abre en nueva pestaña sin error. | Medio | Pendiente | |

---

## REQ — Solicitudes

| ID | Rol | Precondición | Pasos | Resultado esperado | Severidad si falla | Estado | Evidencia |
|----|-----|-------------|-------|-------------------|-------------------|--------|-----------|
| REQ-001 | vendedor (suc-qro) | Unidad disponible en `suc-mty` | 1. Login como vendedor QRO. 2. Buscar unidad de MTY. 3. Crear solicitud para esa unidad. | Solicitud creada con `estado=nueva`. Aparece en historial del vendedor. | Alto | Pendiente | |
| REQ-002 | coordinador (suc-mty) | Solicitud creada en REQ-001 | 1. Login como coordinador MTY (sucursal dueña de la unidad). | Ve la solicitud de REQ-001 en su bandeja. | Alto | Pendiente | |
| REQ-003 | coordinador (suc-qro) | Solicitud creada en REQ-001 | 1. Login como coordinador QRO (sucursal solicitante). | Ve la solicitud de REQ-001 en su bandeja. | Alto | Pendiente | |
| REQ-004 | coordinador (suc-mty) | Solicitud en `estado=nueva` | 1. Abrir solicitud de REQ-001. 2. Agregar comentario. | Comentario aparece en el hilo. Timestamp correcto. | Medio | Pendiente | |
| REQ-005 | coordinador (suc-mty) | Solicitud en `estado=nueva` | 1. Cambiar estado a `en_negociacion`. | Estado se actualiza. Cambio visible para vendedor y ambos coordinadores. | Alto | Pendiente | |
| REQ-006 | coordinador (suc-mty) | Solicitud en `estado=en_negociacion` | 1. Cambiar estado a `aprobada` o `rechazada`. | Estado final aplicado. Solicitud no puede retroceder a estado anterior según reglas. | Alto | Pendiente | |
| REQ-007 | vendedor (suc-qro) | Estado de solicitud cambió en REQ-005 o REQ-006 | 1. Login como vendedor creador. 2. Abrir la solicitud. | Ve el estado actualizado. | Alto | Pendiente | |
| REQ-008 | soporte | Solicitudes creadas | 1. Login como soporte. 2. Abrir Solicitudes o vista de soporte. | Ve todas las solicitudes del sistema, sin filtro por sucursal. | Alto | Pendiente | |

---

## NOTIF — Notificaciones

| ID | Rol | Precondición | Pasos | Resultado esperado | Severidad si falla | Estado | Evidencia |
|----|-----|-------------|-------|-------------------|-------------------|--------|-----------|
| NOTIF-001 | vendedor (suc-qro) | Solicitud creada en REQ-001 | 1. Permanecer logueado como vendedor QRO mientras coordinador recibe la solicitud. | Badge de notificaciones se actualiza. Notificación de "nueva solicitud" aparece. | Alto | Pendiente | |
| NOTIF-002 | vendedor (suc-qro) | Coordinador hizo comentario en REQ-004 | 1. Revisar notificaciones del vendedor. | Notificación de comentario recibida. | Medio | Pendiente | |
| NOTIF-003 | vendedor (suc-qro) | Estado cambió en REQ-005 o REQ-006 | 1. Revisar notificaciones del vendedor. | Notificación de cambio de estado recibida. | Alto | Pendiente | |
| NOTIF-004 | vendedor (suc-qro) | Al menos 1 notificación no leída | 1. Click en notificación. | Notificación marcada como leída. Badge disminuye. | Medio | Pendiente | |
| NOTIF-005 | soporte | Notificaciones enviadas de REQ-001..REQ-006 | 1. Login como soporte. 2. Ir a vista de soporte de deliveries. | Lista de entregas visible con status y destinatario. | Medio | Pendiente | |
| NOTIF-006 | soporte | Deliveries con intentos | 1. En vista de deliveries, abrir detalle de una entrega. | Attempts visibles con timestamps y status. | Bajo | Pendiente | |

---

## SEC — Seguridad

| ID | Rol | Precondición | Pasos | Resultado esperado | Severidad si falla | Estado | Evidencia |
|----|-----|-------------|-------|-------------------|-------------------|--------|-----------|
| SEC-001 | vendedor | Login exitoso | 1. Intentar navegar directamente a `/soporte/inventario/imports`. | Redirige a `/unauthorized`. No muestra datos de soporte. | **Crítico** | Pendiente | |
| SEC-002 | coordinador | Login exitoso | 1. Intentar navegar a `/soporte/inventario/imports`. | Redirige a `/unauthorized`. | **Crítico** | Pendiente | |
| SEC-003 | vendedor (suc-qro) | Solicitudes de otros vendedores existen | 1. Login como vendedor QRO. 2. Revisar lista de solicitudes. | Solo ve sus propias solicitudes, no las de vendedores de MTY ni de otros vendedores de QRO. | **Crítico** | Pendiente | |
| SEC-004 | coordinador (suc-qro) | Solicitudes de suc-mty existen | 1. Login como coordinador QRO. 2. Revisar bandeja. | Solo ve solicitudes que involucran su sucursal (solicitante o dueña). No ve solicitudes entre otras sucursales. | **Crítico** | Pendiente | |
| SEC-005 | vendedor con `activo=false` | Cambiar `activo=false` en `usuarios/{uid}` del vendedor | 1. Login o recargar app como ese vendedor. | Redirige a `/unauthorized` con mensaje de usuario inactivo. | Alto | Pendiente | |

---

## UX — Experiencia de usuario

| ID | Rol | Precondición | Pasos | Resultado esperado | Severidad si falla | Estado | Evidencia |
|----|-----|-------------|-------|-------------------|-------------------|--------|-----------|
| UX-001 | cualquiera | Login exitoso | 1. Observar el sidebar/menú principal. | Sidebar muestra exactamente 5 categorías según el rol. No hay categorías extra ni duplicadas. | Medio | Pendiente | |
| UX-002 | vendedor | Acceso con dispositivo móvil (o viewport < 768px) | 1. Abrir la app en mobile. 2. Navegar a Inventario Nacional. 3. Abrir detalle de unidad. | App es usable. Tabla/lista de inventario scrolleable. Sin elementos cortados que bloqueen acciones. | Medio | Pendiente | |
| UX-003 | vendedor | Acceso en desktop (≥ 1280px) | 1. Abrir app en desktop. 2. Navegar por los módulos principales. | Layout correcto. Sin desbordamientos obvios. | Bajo | Pendiente | |
| UX-004 | cualquiera | `VITE_AUTH_MODE=demo` en local | 1. Correr app en modo demo. 2. Navegar a Inventario Nacional. | App carga sin errores de consola críticos. Datos de demo visibles. Sin pantalla blanca. | Medio | Pendiente | |
| UX-005 | vendedor | Inventario vacío o búsqueda sin resultados | 1. Buscar un término que no exista en inventario. | Estado vacío con mensaje entendible ("Sin resultados"). No pantalla en blanco. | Bajo | Pendiente | |

---

## Resumen de casos

| Módulo | Total casos | Críticos | Altos | Medios | Bajos |
|--------|-------------|----------|-------|--------|-------|
| AUTH | 5 | 1 | 3 | 0 | 0 |
| INV | 7 | 0 | 2 | 5 | 0 |
| REQ | 8 | 0 | 6 | 1 | 0 |
| NOTIF | 6 | 0 | 2 | 3 | 1 |
| SEC | 5 | 4 | 1 | 0 | 0 |
| UX | 5 | 0 | 0 | 3 | 2 |
| **Total** | **36** | **5** | **14** | **12** | **3** |
