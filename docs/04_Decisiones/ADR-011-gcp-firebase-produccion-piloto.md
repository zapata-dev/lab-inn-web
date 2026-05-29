# ADR-011 - GCP/Firebase para Produccion Piloto

- Estado: Propuesto
- Fecha: 2026-05-28

## Contexto

LAB nacio como MVP simulado para validar flujos comerciales con velocidad: sin backend real, sin base de datos real y con persistencia en `localStorage`. Ese alcance sigue vigente para demo.

A partir de la Fase Produccion 0, se abre una ruta formal para Piloto Productivo con usuarios reales internos de Corporacion Zapata. Esta fase requiere autenticacion real, autorizacion por rol, trazabilidad y operacion multiusuario.

## Decision

Para Produccion Piloto, LAB usara GCP con Firebase como capa principal:

- Firebase Hosting para servir el frontend Vite.
- Firebase Authentication con Google.
- Restriccion de acceso a usuarios `@zapata.com.mx`.
- Autorizacion real mediante coleccion `usuarios` en Firestore.
- Cloud Firestore como base de datos operativa.
- Cloud Functions para eventos, notificaciones y automatizaciones.
- Cloud Scheduler para actualizacion diaria de inventario desde CSV/Sheets.
- Cloud Logging + coleccion `auditoria` para trazabilidad.
- Proyecto GCP/Firebase separado para piloto, idealmente con ambientes `lab-comercial-dev` y `lab-comercial-prod`.

Esta decision no implementa Firebase en este ticket; solo define el contrato tecnico para los tickets siguientes.

## Alternativas consideradas

1. Mantener MVP simulado (frontend + CSV + localStorage)

No cumple requisitos de operacion real multiusuario, auditoria ni control de permisos por rol.

2. Backend custom en Cloud Run + Cloud SQL

Es viable, pero incrementa complejidad y tiempo de arranque para un primer piloto interno.

3. GCP con Firebase (opcion elegida)

Permite avanzar rapido con autenticacion, reglas de acceso, datos operativos y automatizaciones sin romper el MVP actual.

## Consecuencias positivas

- Habilita login real con Google para usuarios internos.
- Permite autorizacion por rol (`vendedor`, `coordinador`, `soporte`).
- Introduce base de datos compartida y trazabilidad de acciones.
- Reduce tiempo de salida a piloto respecto a backend custom.
- Mantiene alineacion con servicios administrados de GCP.

## Consecuencias negativas

- Incrementa dependencia de Firebase para primera salida productiva.
- Exige diseno cuidadoso de reglas de seguridad en Firestore.
- Agrega carga operativa inicial de ambientes y observabilidad.
- Introduce coexistencia temporal de dos alcances (MVP demo y Piloto Productivo).

## Riesgos y mitigaciones

- Riesgo: acceso no autorizado por mala configuracion de reglas.
  Mitigacion: definir y validar reglas por rol antes de habilitar usuarios.
- Riesgo: inventario desactualizado por falla de scheduler.
  Mitigacion: registrar `lastUpdatedAt`, alertar si supera ventana esperada y habilitar reproceso manual.
- Riesgo: ruido operativo por notificaciones fallidas.
  Mitigacion: bitacora de eventos y reproceso desde soporte.
- Riesgo: confusion de alcance entre demo y produccion.
  Mitigacion: separar explicitamente backlog MVP y backlog Produccion Piloto.

## Impacto sobre ADRs anteriores

- ADR-001 (Sin backend en MVP): se mantiene para MVP/demo y queda superado solo en la fase Produccion Piloto.
- ADR-003 (localStorage como persistencia): se mantiene para MVP/demo y Produccion Piloto usara Firestore.
- ADR-005 (Vercel para hosting): se mantiene para MVP/demo y Produccion Piloto usara Firebase Hosting.
- ADR-006 (5 categorias en sidebar): no cambia.

## Cuando revisar

- Al concluir la salida a piloto con al menos 3 sucursales activas.
- Si se requiere actualizacion de inventario intradia.
- Si se aprueba integracion real con SAP o Salesforce para una siguiente fase.
- Si cambian requisitos de seguridad, compliance o auditoria.
