# Firestore Data Model - LAB Produccion Piloto

## 1. Objetivo

Definir el contrato de datos para la fase de Produccion Piloto de LAB en Firestore, antes de implementar Auth, reglas, servicios y pantallas productivas.

Este documento no implementa Firebase. Solo establece estructura, convenciones y decisiones para evitar improvisacion en siguientes tickets.

## 2. Principios de modelado

- Mantener alcance V1 controlado para 10-15 usuarios internos.
- Privilegiar lecturas rapidas para vistas operativas (desnormalizacion selectiva).
- Usar `uid`, `vin` y `sucursalId` como llaves estables de negocio.
- Separar estado de negocio de eventos de notificacion.
- Diseñar para trazabilidad de cambios y auditoria.
- Mantener compatibilidad conceptual con el MVP actual sin tocar `src/`.

## 3. Convenciones de IDs

| Entidad | Ruta | ID | Regla |
|---|---|---|---|
| Usuario | `usuarios/{uid}` | `uid` | Proviene de Firebase Auth |
| Sucursal | `sucursales/{sucursalId}` | `sucursalId` | Catalogo controlado por soporte |
| Inventario | `inventario/{vin}` | `vin` | VIN como identificador unico |
| Solicitud | `solicitudes/{solicitudId}` | `solicitudId` | `autoId` o prefijo negocio (`SOL-...`) |
| Comentario | `solicitudes/{solicitudId}/comentarios/{comentarioId}` | `comentarioId` | `autoId` |
| Historial | `solicitudes/{solicitudId}/historial/{eventoId}` | `eventoId` | `autoId` |
| Notificacion | `notificaciones/{notificacionId}` | `notificacionId` | `autoId` |
| Auditoria | `auditoria/{auditId}` | `auditId` | `autoId` |
| Import inventario | `importsInventario/{importId}` | `importId` | `autoId` |
| Config sistema | `systemConfig/{configId}` | `configId` | IDs fijos (`roles`, `estadosSolicitud`, `notificaciones`, `inventario`) |

## 4. Colecciones

### 4.1 `usuarios/{uid}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| uid | string | si | Igual al path ID |
| email | string | si | Debe terminar en `@zapata.com.mx` |
| nombre | string | si | Nombre visible |
| rol | string enum | si | `vendedor` \| `coordinador` \| `soporte` |
| sucursalId | string | si | Sucursal principal del usuario |
| activo | boolean | si | Si es `false`, acceso denegado |
| telefono | string | no | Contacto operativo |
| createdAt | timestamp | si | Alta de usuario |
| updatedAt | timestamp | si | Ultima actualizacion |
| lastLoginAt | timestamp | no | Ultimo login exitoso |

Nota: Auth valida identidad con Google; autorizacion real depende de este documento.

### 4.2 `sucursales/{sucursalId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| sucursalId | string | si | Igual al path ID |
| nombre | string | si | Nombre comercial |
| ciudad | string | no | Ciudad |
| estado | string | no | Estado (MX) |
| region | string | no | Region operativa |
| activa | boolean | si | Control de disponibilidad |
| coordinadorIds | string[] | no | UIDs coordinadores asignados |
| createdAt | timestamp | si | Alta |
| updatedAt | timestamp | si | Ultima actualizacion |

### 4.3 `inventario/{vin}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| vin | string | si | Igual al path ID |
| marca | string | si | Marca de unidad |
| modelo | string | si | Modelo de unidad |
| anio | number | no | Ano modelo |
| sucursalId | string | si | Sucursal duena |
| sucursalNombre | string | si | Denormalizado para UI |
| precio | number | no | Precio vigente |
| status | string | si | Ejemplo: `Disponible` |
| promocion | string | no | Etiqueta o codigo promo |
| fotos | string[] | no | URLs de imagenes |
| configuracion | string | no | Configuracion comercial |
| fuente | string enum | si | `csv` \| `sheets` \| `sap` \| `salesforce` |
| lastImportedAt | timestamp | si | Ultima importacion de origen |
| updatedAt | timestamp | si | Ultima actualizacion en Firestore |

Notas:

- VIN es el ID del documento.
- En V1, la fuente operativa es `csv`/`sheets`.
- SAP/Salesforce en vivo quedan fuera de alcance V1.

### 4.4 `solicitudes/{solicitudId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| solicitudId | string | si | Igual al path ID |
| unitVin | string | si | VIN solicitado |
| unitSnapshot | map | si | Snapshot de la unidad al crear la solicitud |
| vendedorId | string | si | UID creador |
| vendedorNombre | string | si | Denormalizado |
| vendedorEmail | string | si | Denormalizado |
| sucursalSolicitanteId | string | si | Sucursal del vendedor |
| sucursalDuenaId | string | si | Sucursal duena de la unidad |
| coordinadorSolicitanteIds | string[] | no | Coordinadores de sucursal solicitante |
| coordinadorDuenoIds | string[] | no | Coordinadores de sucursal duena |
| estado | string enum | si | `nueva` \| `en_negociacion` \| `aprobada` \| `rechazada` \| `cancelada` \| `cerrada` |
| comentarioInicial | string | no | Comentario inicial |
| prioridad | string enum | si | `normal` \| `alta` |
| createdAt | timestamp | si | Alta |
| updatedAt | timestamp | si | Ultimo cambio |
| closedAt | timestamp | no | Se llena al cerrar/cancelar/rechazar |
| lastActivityAt | timestamp | si | Ultima actividad (comentario/estado) |

Notas:

- `unitSnapshot` conserva datos clave para historico aunque cambie `inventario/{vin}`.
- La solicitud involucra ambas sucursales.
- No usar `notificada` como estado de negocio.

### 4.5 `notificaciones/{notificacionId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| notificacionId | string | si | Igual al path ID |
| userId | string | si | Destinatario |
| solicitudId | string | no | Relacion con solicitud |
| tipo | string | si | Tipo de evento |
| canal | string enum | si | `in_app` \| `email` \| `whatsapp` |
| titulo | string | si | Titulo visible |
| mensaje | string | si | Cuerpo de mensaje |
| leida | boolean | si | Estado lectura |
| enviada | boolean | si | Estado envio |
| error | string | no | Motivo de fallo |
| createdAt | timestamp | si | Alta |
| readAt | timestamp | no | Fecha de lectura |
| sentAt | timestamp | no | Fecha de envio |

Notas:

- `in_app` es obligatorio.
- `email` es respaldo simple.
- `whatsapp` se modela para futuro, no obligatorio en V1.

### 4.6 `auditoria/{auditId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| auditId | string | si | Igual al path ID |
| actorId | string | no | UID actor |
| actorEmail | string | no | Email actor |
| accion | string | si | Evento auditado |
| entidad | string | si | Ej: `solicitudes`, `usuarios` |
| entidadId | string | no | ID de la entidad |
| metadata | map | no | Contexto adicional |
| ip | string | no | IP origen (cuando aplique) |
| userAgent | string | no | Agente cliente |
| createdAt | timestamp | si | Fecha/hora evento |

Acciones minimas:

- `login_autorizado`
- `login_rechazado`
- `crear_solicitud`
- `comentar_solicitud`
- `cambiar_estado_solicitud`
- `aprobar_solicitud`
- `rechazar_solicitud`
- `cancelar_solicitud`
- `cerrar_solicitud`
- `descargar_pdf`
- `editar_usuario`
- `reprocesar_notificacion`

### 4.7 `importsInventario/{importId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| importId | string | si | Igual al path ID |
| fuente | string | si | `csv` o `sheets` en V1 |
| archivoNombre | string | no | Nombre de archivo/proceso |
| totalRegistros | number | si | Total leido |
| registrosCreados | number | si | Inserts |
| registrosActualizados | number | si | Updates |
| registrosConError | number | si | Errores |
| status | string enum | si | `pendiente` \| `procesando` \| `completado` \| `fallido` |
| errorResumen | string | no | Errores globales |
| startedAt | timestamp | no | Inicio proceso |
| finishedAt | timestamp | no | Fin proceso |
| createdBy | string | no | UID, servicio o scheduler |

### 4.8 `systemConfig/{configId}`

Documentos sugeridos:

- `roles`
- `estadosSolicitud`
- `notificaciones`
- `inventario`

Uso: concentrar configuraciones operativas sin cambiar codigo de UI en cada ajuste.

## 5. Subcolecciones

### 5.1 `solicitudes/{solicitudId}/comentarios/{comentarioId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| comentarioId | string | si | Igual al path ID |
| autorId | string | si | UID autor |
| autorNombre | string | si | Denormalizado |
| autorEmail | string | si | Denormalizado |
| autorRol | string enum | si | `vendedor` \| `coordinador` \| `soporte` |
| texto | string | si | Mensaje |
| createdAt | timestamp | si | Fecha comentario |

### 5.2 `solicitudes/{solicitudId}/historial/{eventoId}`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| eventoId | string | si | Igual al path ID |
| actorId | string | no | UID actor |
| actorEmail | string | no | Email actor |
| tipoEvento | string | si | Ej: `estado_cambiado`, `comentario_agregado` |
| estadoAnterior | string | no | Estado previo |
| estadoNuevo | string | no | Estado nuevo |
| detalle | string | no | Descripcion breve |
| createdAt | timestamp | si | Fecha evento |

## 6. Estados y enums

### 6.1 Roles

- `vendedor`
- `coordinador`
- `soporte`

### 6.2 Estados de solicitud

- `nueva`
- `en_negociacion`
- `aprobada`
- `rechazada`
- `cancelada`
- `cerrada`

### 6.3 Prioridad de solicitud

- `normal`
- `alta`

### 6.4 Canales de notificacion

- `in_app`
- `email`
- `whatsapp` (no obligatorio V1)

### 6.5 Estado de importacion de inventario

- `pendiente`
- `procesando`
- `completado`
- `fallido`

## 7. Ejemplos JSON

### 7.1 Usuario

```json
{
  "uid": "uid_123",
  "email": "vendedor1@zapata.com.mx",
  "nombre": "Vendedor Uno",
  "rol": "vendedor",
  "sucursalId": "MTY01",
  "activo": true,
  "telefono": "+52-81-5555-0000",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>",
  "lastLoginAt": "<timestamp>"
}
```

### 7.2 Inventario por VIN

```json
{
  "vin": "3HSCXAPR1GN123456",
  "marca": "International",
  "modelo": "ProStar",
  "anio": 2020,
  "sucursalId": "GDL02",
  "sucursalNombre": "Guadalajara Patio Norte",
  "precio": 1299000,
  "status": "Disponible",
  "promocion": "MAYO26",
  "fotos": ["https://cdn.example.com/vin1.jpg"],
  "configuracion": "6x4",
  "fuente": "csv",
  "lastImportedAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

### 7.3 Solicitud

```json
{
  "solicitudId": "SOL-20260528-0001",
  "unitVin": "3HSCXAPR1GN123456",
  "unitSnapshot": {
    "vin": "3HSCXAPR1GN123456",
    "marca": "International",
    "modelo": "ProStar",
    "anio": 2020,
    "precio": 1299000,
    "sucursalId": "GDL02",
    "sucursalNombre": "Guadalajara Patio Norte",
    "status": "Disponible"
  },
  "vendedorId": "uid_123",
  "vendedorNombre": "Vendedor Uno",
  "vendedorEmail": "vendedor1@zapata.com.mx",
  "sucursalSolicitanteId": "MTY01",
  "sucursalDuenaId": "GDL02",
  "coordinadorSolicitanteIds": ["uid_coord_mty"],
  "coordinadorDuenoIds": ["uid_coord_gdl"],
  "estado": "nueva",
  "comentarioInicial": "Cliente requiere entrega inmediata",
  "prioridad": "alta",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>",
  "closedAt": null,
  "lastActivityAt": "<timestamp>"
}
```

### 7.4 Notificacion

```json
{
  "notificacionId": "ntf_abc123",
  "userId": "uid_coord_gdl",
  "solicitudId": "SOL-20260528-0001",
  "tipo": "solicitud_creada",
  "canal": "in_app",
  "titulo": "Nueva solicitud recibida",
  "mensaje": "Revisa la solicitud SOL-20260528-0001",
  "leida": false,
  "enviada": true,
  "error": "",
  "createdAt": "<timestamp>",
  "readAt": null,
  "sentAt": "<timestamp>"
}
```

### 7.5 Registro de importacion

```json
{
  "importId": "imp_20260528_01",
  "fuente": "sheets",
  "archivoNombre": "inventario_nacional_2026-05-28.csv",
  "totalRegistros": 820,
  "registrosCreados": 120,
  "registrosActualizados": 680,
  "registrosConError": 20,
  "status": "completado",
  "errorResumen": "20 filas sin VIN",
  "startedAt": "<timestamp>",
  "finishedAt": "<timestamp>",
  "createdBy": "scheduler"
}
```

## 8. Relaciones entre colecciones

- `usuarios.sucursalId` -> `sucursales/{sucursalId}`
- `inventario.sucursalId` -> `sucursales/{sucursalId}`
- `solicitudes.unitVin` -> `inventario/{vin}`
- `solicitudes.vendedorId` -> `usuarios/{uid}`
- `notificaciones.userId` -> `usuarios/{uid}`
- `notificaciones.solicitudId` -> `solicitudes/{solicitudId}`
- `auditoria.actorId` -> `usuarios/{uid}` (opcional)

## 9. Decisiones de desnormalizacion

- Guardar `vendedorNombre` y `vendedorEmail` en solicitud para evitar joins en listas.
- Guardar `sucursalNombre` en inventario para filtros y UI rapida.
- Guardar `unitSnapshot` para conservar contexto historico.
- Guardar `autorNombre`/`autorEmail` en comentarios por trazabilidad.

Trade-off: mayor trabajo al sincronizar cambios de perfil/catalogos, a cambio de lecturas de bajo costo y baja latencia.

## 10. Riesgos del modelo

- Riesgo de inconsistencia entre datos denormalizados y fuente canonica.
- Riesgo de indices costosos en `solicitudes` y `notificaciones` al crecer volumen.
- Riesgo de consultas ambiguas si no se valida visibilidad por sucursal/rol.
- Riesgo de crecimiento de `auditoria` sin politica de retencion.

## 11. Preguntas abiertas

1. Como evitar doble solicitud activa para el mismo VIN sin bloquear casos legitimos.
2. Si `whatsapp` permanece como canal reservado o se elimina del enum en V1.
3. Si `solicitudId` usara `autoId` puro o formato legible (`SOL-YYYYMMDD-####`).
4. Si soporte podra reasignar `sucursalDuenaId` en solicitudes abiertas.
5. Politica de retencion para `auditoria` e `importsInventario`.
