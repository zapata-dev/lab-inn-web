# Requests Flow Firestore - LAB-PROD-006

## 1. Objetivo

Implementar el flujo base de solicitudes entre sucursales con Firestore, alineado a Auth, autorizacion por `usuarios/{uid}` y `firestore.rules` existentes.

## 2. Flujo implementado

1. Usuario autorizado abre detalle de unidad.
2. Desde el modal usa "Solicitar unidad".
3. Se crea `solicitudes/{solicitudId}` con estado inicial `nueva`.
4. Se crea historial inicial en `solicitudes/{solicitudId}/historial/{eventoId}`.
5. Usuario consulta `/solicitudes`.
6. Puede abrir detalle, comentar y cambiar estado segun permisos.

## 3. Colecciones usadas

- `solicitudes/{solicitudId}`
- `solicitudes/{solicitudId}/comentarios/{comentarioId}`
- `solicitudes/{solicitudId}/historial/{eventoId}`

## 4. Permisos por rol (frontend)

- `vendedor`
  - Crea solicitud.
  - Ve solo sus solicitudes.
  - Comenta en sus solicitudes.
  - Solo puede cancelar si estado actual es `nueva` o `en_negociacion`.
- `coordinador`
  - Ve solicitudes donde participa su sucursal.
  - Comenta.
  - Puede mover estado cuando su sucursal participa.
- `soporte`
  - Ve todas las solicitudes.
  - Comenta.
  - Puede mover cualquier transicion valida.

Nota: permisos finales siempre los valida Firestore Rules.

## 5. Estados y transiciones

Estados:

- `nueva`
- `en_negociacion`
- `aprobada`
- `rechazada`
- `cancelada`
- `cerrada`

Transiciones V1:

- `nueva` -> `en_negociacion`, `cancelada`
- `en_negociacion` -> `aprobada`, `rechazada`, `cancelada`
- `aprobada` -> `cerrada`
- `rechazada` -> `cerrada`
- `cancelada` -> `cerrada`
- `cerrada` -> ninguna

## 6. Como crear solicitud desde unidad

1. Ir a `/inventario`.
2. Abrir detalle de unidad.
3. Click en "Solicitar unidad".
4. Capturar comentario inicial y prioridad (`normal`/`alta`).
5. Confirmar creacion.

## 7. Como listar solicitudes por rol

- Vendedor: query por `vendedorId == user.uid`.
- Coordinador: dos subscriptions por sucursal (`sucursalSolicitanteId` y `sucursalDuenaId`) y merge local por `solicitudId`.
- Soporte: listado global ordenado por `updatedAt` con limite operativo.

## 8. Pruebas manuales

1. `npm run lint`
2. `npm run build`
3. Configurar `VITE_AUTH_MODE=firebase`.
4. Login como vendedor autorizado.
5. Crear solicitud desde detalle de unidad.
6. Confirmar en Firestore:
   - `solicitudes/{id}` existe
   - historial inicial existe
   - estado inicial `nueva`
   - `unitSnapshot` presente
7. Ir a `/solicitudes` y validar visibilidad por rol.
8. Comentar solicitud.
9. Cambiar estado con coordinador/soporte.
10. Verificar que se agrega historial de estado.
11. Cambiar `VITE_AUTH_MODE=demo` y confirmar que no truena la app.

## 9. Fuera de alcance

- Notificaciones in-app/correo.
- Cloud Functions.
- Emails o WhatsApp.
- SAP/Salesforce.
- Bloqueo automatico de unidad.
- Reglas de transicion mas finas V1.1.
- Resolver colision de dos solicitudes simultaneas para misma unidad.
