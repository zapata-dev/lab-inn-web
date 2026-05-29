# Produccion Piloto LAB - Alcance GCP/Firebase

## 1. Objetivo

Definir el alcance operativo y tecnico de la primera salida de Produccion Piloto en GCP/Firebase sin reemplazar ni romper el MVP/demo existente.

## 2. Principios

- Separacion explicita entre MVP/demo y Produccion Piloto.
- Implementacion incremental por tickets, sin migracion de golpe.
- Seguridad primero: autenticacion y autorizacion reales.
- Trazabilidad de acciones criticas desde el dia 1 del piloto.
- Alcance controlado: integrar solo lo necesario para validar operacion interna.

## 3. Arquitectura propuesta

- Frontend: React 18 + Vite (existente).
- Hosting: Firebase Hosting.
- Auth: Firebase Authentication con Google.
- Datos operativos: Cloud Firestore.
- Logica de servidor: Cloud Functions.
- Jobs programados: Cloud Scheduler.
- Trazabilidad: Cloud Logging + coleccion `auditoria`.

## 4. Ambientes

- `lab-comercial-dev`: pruebas funcionales y validacion tecnica.
- `lab-comercial-prod`: piloto controlado con usuarios autorizados.
- Aislamiento de configuracion y datos entre ambientes.

## 5. Roles

- `vendedor`: consulta inventario nacional y crea solicitudes entre sucursales.
- `coordinador`: revisa y decide solicitudes relacionadas con su sucursal.
- `soporte`: vista global, correccion operativa y reproceso de notificaciones.

## 6. Modelo de datos inicial

Colecciones base en Firestore:

- `usuarios`: perfil, rol, sucursal, estado de autorizacion.
- `inventario`: unidades normalizadas; VIN como identificador principal.
- `solicitudes`: flujo entre sucursales con estados y trazabilidad.
- `comentariosSolicitud`: comentarios in-app vinculados a solicitud.
- `notificaciones`: eventos in-app por usuario y estado de entrega.
- `auditoria`: eventos criticos del sistema y operacion.

## 7. Reglas de permisos

- Solo pueden iniciar sesion correos `@zapata.com.mx`.
- El acceso funcional depende de existencia/estado en `usuarios`.
- `vendedor`: lectura de inventario y escritura de solicitudes/comentarios propios.
- `coordinador`: lectura/escritura de solicitudes de su sucursal.
- `soporte`: acceso transversal para soporte operativo.

## 8. Flujo de solicitud entre sucursales

1. Vendedor crea solicitud para una unidad por VIN.
2. Coordinador de sucursal destino recibe y revisa.
3. Coordinador cambia estado segun decision.
4. Usuarios involucrados reciben notificacion in-app.
5. Soporte interviene cuando hay inconsistencia o reproceso.

Estados permitidos:

- `nueva`
- `en_negociacion`
- `aprobada`
- `rechazada`
- `cancelada`
- `cerrada`

## 9. Notificaciones

- Canal obligatorio: notificacion in-app.
- Canal de respaldo: correo basico.
- Eventos minimos: alta solicitud, comentario, cambio de estado, aprobacion/rechazo.

## 10. Auditoria

Eventos criticos a registrar:

- login autorizado/no autorizado
- crear solicitud
- comentar
- cambiar estado
- aprobar/rechazar
- descargar PDF
- editar usuario
- reprocesar notificacion

Cada evento debe incluir actor, timestamp, entidad, accion y resultado.

## 11. Inventario

- Fuente inicial: CSV/Google Sheets.
- Actualizacion diaria con Cloud Scheduler.
- Normalizacion de campos para continuidad con UI actual.
- Registro de `lastUpdatedAt` y estado de sincronizacion.

## 12. Fuera de alcance

- SAP en vivo.
- Salesforce en vivo.
- Creacion automatica de oportunidades.
- Direccion dentro de la app.
- WhatsApp obligatorio.
- Reglas automaticas complejas de asignacion.
- Impersonacion de usuarios.
- Multi-sucursal por usuario.
- Tests automatizados.
- TypeScript.
- Redux/Zustand/MUI.
- Docker/monorepo.

## 13. Criterios de salida a piloto

- Login Google funcional con restriccion por dominio.
- Autorizacion por `usuarios` y rol en ambiente prod.
- Flujo completo de solicitud con estados definidos.
- Notificaciones in-app funcionales en eventos minimos.
- Inventario diario estable con evidencia de actualizacion.
- Auditoria minima de eventos criticos habilitada.

## 14. Riesgos principales

- Configuracion incompleta de reglas de Firestore.
- Dependencia del CSV/Sheets para calidad de inventario.
- Fallas de entrega de notificaciones/correos.
- Confusion organizacional entre alcance demo y piloto.

## 15. Proximos tickets sugeridos

- LAB-PROD-002: Diseno de modelo Firestore y claves de documentos.
- LAB-PROD-003: Login Google + restriccion `@zapata.com.mx`.
- LAB-PROD-004: Autorizacion por coleccion `usuarios` y roles.
- LAB-PROD-005: Motor de solicitudes entre sucursales.
- LAB-PROD-006: Notificaciones in-app + correo de respaldo.
- LAB-PROD-007: Scheduler de inventario diario desde CSV/Sheets.
- LAB-PROD-008: Bitacora de auditoria y consultas operativas.

## 17. Validación QA piloto (LAB-PROD-022)

Antes de abrir el piloto a usuarios reales, se ejecuta el plan de QA end-to-end:

| Documento | Propósito |
|-----------|-----------|
| [QA_PILOT_E2E_PLAN.md](./QA_PILOT_E2E_PLAN.md) | Plan completo: flujos, matriz por rol, criterios Go/No-Go |
| [QA_PILOT_TEST_CASES.md](./QA_PILOT_TEST_CASES.md) | 36 casos de prueba en AUTH, INV, REQ, NOTIF, SEC, UX |
| [QA_PILOT_RESULTS_TEMPLATE.md](./QA_PILOT_RESULTS_TEMPLATE.md) | Plantilla para registrar resultados y decisión Go/No-Go |
| [QA_PILOT_BUG_LOG.md](./QA_PILOT_BUG_LOG.md) | Registro de bugs con severidad, estado y ticket fix |

### Criterios de entrada a piloto

- Sin bugs Críticos abiertos.
- Flujos Nivel 1 (seguridad, login, inventario, solicitudes, notificaciones) pasan.
- Decisión documentada en `QA_PILOT_RESULTS_YYYYMMDD.md` con firma del tester.

## 16. Deploy real (LAB-PROD-020)

A partir de LAB-PROD-020, el proyecto tiene los artefactos de infraestructura listos para el primer deploy real:

- `firebase.json` — Hosting configurado para `dist/` con SPA rewrite, Functions y Firestore Rules/Indexes.
- `.firebaserc.example` — plantilla con alias `default` (dev) y `production` (prod).
- `.env.example` — variables frontend documentadas para modo `firebase`.
- `functions/.env.example` — variables backend documentadas.

### Documentos de operación

| Documento | Propósito |
|-----------|-----------|
| [FIREBASE_ENVIRONMENT_SETUP.md](./FIREBASE_ENVIRONMENT_SETUP.md) | Servicios a habilitar, variables, qué no commitear |
| [FIREBASE_DEPLOY_RUNBOOK.md](./FIREBASE_DEPLOY_RUNBOOK.md) | Pasos de deploy, rollback, smoke test, riesgos comunes |
| [PILOT_DEPLOY_CHECKLIST.md](./PILOT_DEPLOY_CHECKLIST.md) | Checklist Go/No-Go para entrada a piloto |

## Documentos tecnicos relacionados

- [FIRESTORE_DATA_MODEL.md](./FIRESTORE_DATA_MODEL.md)
- [FIRESTORE_SECURITY_MATRIX.md](./FIRESTORE_SECURITY_MATRIX.md)
- [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md)
- [FIREBASE_DEPLOY_RUNBOOK.md](./FIREBASE_DEPLOY_RUNBOOK.md)
- [PILOT_DEPLOY_CHECKLIST.md](./PILOT_DEPLOY_CHECKLIST.md)
