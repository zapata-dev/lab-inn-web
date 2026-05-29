# QA Pilot Results Template (LAB-PROD-022)

Plantilla para registrar los resultados de cada ejecución del QA piloto.

Copiar este archivo con nombre `QA_PILOT_RESULTS_YYYYMMDD.md` para cada sesión. No commitear archivos con datos reales de usuarios ni evidencias con información sensible.

---

## Encabezado de sesión

```
Fecha:           _______________
Ambiente:        lab-comercial-dev
URL probada:     _______________
Commit/deploy:   _______________
Tester:          _______________
Duración:        _______________
```

---

## Usuarios utilizados

```
soporte:           _______________@zapata.com.mx
coordinador QRO:   _______________@zapata.com.mx
coordinador MTY:   _______________@zapata.com.mx
vendedor QRO 01:   _______________@zapata.com.mx
vendedor QRO 02:   _______________@zapata.com.mx
vendedor MTY 01:   _______________@zapata.com.mx
```

---

## Resumen de resultados

| Módulo | Total | ✓ Pasa | ✗ Falla | Bloqueado |
|--------|-------|--------|---------|-----------|
| AUTH | 5 | | | |
| INV | 7 | | | |
| REQ | 8 | | | |
| NOTIF | 6 | | | |
| SEC | 5 | | | |
| UX | 5 | | | |
| **Total** | **36** | | | |

---

## Estado por caso

Marcar cada caso con: `✓ Pasa` / `✗ Falla` / `Bloqueado` / `Omitido`

### AUTH
- [ ] AUTH-001 Login soporte válido
- [ ] AUTH-002 Login vendedor válido
- [ ] AUTH-003 Login coordinador válido
- [ ] AUTH-004 Usuario sin `usuarios/{uid}`
- [ ] AUTH-005 Correo externo bloqueado

### INV
- [ ] INV-001 Inventario carga desde Firestore
- [ ] INV-002 Freshness banner muestra último import
- [ ] INV-003 Import manual soporte
- [ ] INV-004 Import fallido visible en historial
- [ ] INV-005 Unidades ausentes reflejadas en métricas
- [ ] INV-006 Detalle de unidad
- [ ] INV-007 Export PDF

### REQ
- [ ] REQ-001 Vendedor crea solicitud
- [ ] REQ-002 Coordinador dueño ve solicitud
- [ ] REQ-003 Coordinador solicitante ve solicitud
- [ ] REQ-004 Coordinador comenta
- [ ] REQ-005 Coordinador cambia a en_negociacion
- [ ] REQ-006 Coordinador aprueba/rechaza
- [ ] REQ-007 Vendedor ve actualización
- [ ] REQ-008 Soporte ve todas las solicitudes

### NOTIF
- [ ] NOTIF-001 Nueva solicitud genera notificación
- [ ] NOTIF-002 Comentario genera notificación
- [ ] NOTIF-003 Cambio de estado genera notificación
- [ ] NOTIF-004 Marcar como leída
- [ ] NOTIF-005 Soporte revisa deliveries
- [ ] NOTIF-006 Soporte revisa attempts

### SEC
- [ ] SEC-001 Vendedor bloqueado en rutas soporte
- [ ] SEC-002 Coordinador bloqueado en rutas soporte
- [ ] SEC-003 Vendedor no ve solicitudes ajenas
- [ ] SEC-004 Coordinador no ve solicitudes fuera de su sucursal
- [ ] SEC-005 Usuario inactivo bloqueado

### UX
- [ ] UX-001 Sidebar con 5 categorías
- [ ] UX-002 Responsive móvil
- [ ] UX-003 Desktop sin desbordamientos
- [ ] UX-004 Modo demo no truena
- [ ] UX-005 Estado vacío entendible

---

## Bugs encontrados

| Bug ID | Caso | Severidad | Descripción corta | Estado |
|--------|------|-----------|-------------------|--------|
| | | | | |

Ver detalle completo en [QA_PILOT_BUG_LOG.md](./QA_PILOT_BUG_LOG.md).

---

## Bugs críticos abiertos

Listar cualquier bug Crítico que no esté cerrado antes de la decisión Go/No-Go:

```
1. 
2. 
```

Si esta lista está vacía → no hay bloqueo por críticos.

---

## Bugs altos abiertos

```
1. 
2. 
3. 
```

---

## Observaciones generales

```
(Notas libres sobre comportamiento de la app, latencia, UX, etc.)
```

---

## Decisión recomendada

Marcar una:

- [ ] **Go** — Todos los flujos críticos pasan. Sin bugs Críticos ni Altos sin workaround.
- [ ] **Go con restricciones** — Flujos principales pasan. Bugs Altos tienen workaround documentado. Máx. 3 bugs Altos abiertos.
- [ ] **No-Go** — Al menos un bug Crítico abierto, o flujo Nivel 1 falla.

**Justificación:**

```
(Explicar la decisión en 2-3 líneas)
```

**Firmado por:** _______________________

**Fecha:** _____________________________

---

## Próximos pasos

Si **Go**:
- Abrir acceso a usuarios piloto reales
- Monitorear logs de Functions primeras 24h
- Ejecutar LAB-PROD-023 si hay bugs pendientes

Si **Go con restricciones**:
- Documentar workarounds para bugs Altos en comunicación a usuarios piloto
- Abrir tickets fix para cada bug Alto (LAB-PROD-023+)

Si **No-Go**:
- Crear ticket LAB-PROD-023 con bugs Críticos/Altos
- Ejecutar QA de regresión después de fix
- No abrir acceso hasta segundo QA

---

## Evidencias

```
(Pegar capturas de pantalla, links a videos, o rutas a archivos de evidencia)
```
