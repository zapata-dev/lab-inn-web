# QA Pilot E2E Plan (LAB-PROD-022)

Plan de pruebas end-to-end para el piloto LAB. El objetivo es validar si la app está lista para usuarios reales de Corporación Zapata antes de abrir el acceso.

---

## 1. Objetivo

Verificar que los flujos críticos de la app funcionan correctamente en ambiente Firebase real con usuarios, sucursales e inventario sembrados (LAB-PROD-021), sin asumir que "pasó en demo = funciona en Firebase".

---

## 2. Alcance

| Módulo | Qué se prueba |
|--------|---------------|
| Autenticación | Login Google, restricción de dominio, bloqueo por rol/usuario inexistente |
| Inventario | Carga desde Firestore, freshness banner, import manual, detalle de unidad, PDF |
| Solicitudes | Crear, ver por rol, comentar, cambiar estado |
| Notificaciones | Generación, recepción en tiempo real, marcado como leída |
| Soporte | Vista imports, deliveries, attempts |
| Seguridad | Aislamiento por rol, rutas protegidas, usuario inactivo |
| UX básica | Sidebar, responsive, estados vacíos, SPA rewrite |

---

## 3. Fuera de alcance

- SAP / Salesforce
- Correo / WhatsApp / Push notifications externas
- Tests automatizados (E2E con Playwright/Cypress)
- Auditoría avanzada
- Multi-sucursal por usuario
- Panel admin de usuarios
- Reportes históricos avanzados

---

## 4. Ambiente a probar

| Campo | Valor |
|-------|-------|
| Proyecto Firebase | `lab-comercial-dev` |
| URL | URL de Firebase Hosting del proyecto dev |
| Auth mode | `firebase` (VITE_AUTH_MODE=firebase) |
| Inventory mode | `firestore` |
| Datos | Sembrados según LAB-PROD-021 |

**No probar en modo demo.** El modo demo se valida por separado (UX-004 confirma que no truena, pero no es el objeto principal de este QA).

---

## 5. Usuarios requeridos

| Rol | Sucursal | Mínimo |
|-----|----------|--------|
| soporte | cualquiera | 1 |
| coordinador | suc-qro | 1 |
| coordinador | suc-mty | 1 |
| vendedor | suc-qro | 2 |
| vendedor | suc-mty | 2 |
| usuario sin `usuarios/{uid}` | — | 1 (para SEC) |
| correo externo | — | 1 (para SEC) |

Ver plantillas en [PILOT_USERS_TEMPLATE.md](./PILOT_USERS_TEMPLATE.md).

---

## 6. Datos requeridos

| Dato | Mínimo | Cómo obtener |
|------|--------|--------------|
| Sucursales en Firestore | 2 (suc-qro, suc-mty) | [PILOT_BRANCHES_TEMPLATE.md](./PILOT_BRANCHES_TEMPLATE.md) |
| Usuarios en Firestore | 7 (1 soporte + 2 coord + 4 vend) | [PILOT_USERS_TEMPLATE.md](./PILOT_USERS_TEMPLATE.md) |
| Inventario importado | ≥10 unidades entre las 2 sucursales | Import desde CSV vía soporte |
| Al menos 1 unidad en suc-qro | 1 VIN | Para crear solicitud en QA |
| Al menos 1 unidad en suc-mty | 1 VIN | Para solicitud entre sucursales |

---

## 7. Flujos críticos

### Nivel 1 — Bloqueantes (falla = No-Go inmediato)

1. Login correo externo → debe ser bloqueado
2. Vendedor accede a ruta `/soporte/*` → debe redirigir a `/unauthorized`
3. Vendedor ve solicitudes de otro vendedor → no debe verlas
4. Import masivo con CSV correcto → no debe corromper inventario existente
5. Refrescar ruta directa (ej. `/inventario`) → app carga, no 404

### Nivel 2 — Flujos principales (falla = No-Go con excepción documentada)

6. Login vendedor válido → accede a Inventario Nacional
7. Inventario Nacional muestra unidades desde Firestore
8. Vendedor crea solicitud para unidad de otra sucursal
9. Coordinador de la sucursal destino ve la solicitud
10. Coordinador cambia estado → vendedor recibe notificación in-app
11. Soporte ejecuta import manual → resultado visible en `/soporte/inventario/imports`
12. Export PDF de unidad → descarga sin error

### Nivel 3 — Complementarios (falla = bug, puede ir a piloto con workaround)

13. Banner de freshness muestra hora correcta del último import
14. Card de último import muestra métricas correctas
15. Sidebar muestra 5 categorías sin errores
16. Soporte puede revisar deliveries y attempts
17. Notificación de comentario llega al destinatario
18. Modo demo no truena al cambiar VITE_AUTH_MODE=demo

---

## 8. Matriz de flujos por rol

| Flujo | Vendedor | Coordinador | Soporte |
|-------|----------|-------------|---------|
| Ver inventario nacional | ✓ | ✓ | ✓ |
| Filtrar inventario | ✓ | ✓ | ✓ |
| Ver detalle de unidad | ✓ | ✓ | ✓ |
| Export PDF | ✓ | ✓ | ✓ |
| Crear solicitud | ✓ | — | — |
| Ver solicitudes propias | ✓ | — | — |
| Ver solicitudes su sucursal | — | ✓ | — |
| Ver todas las solicitudes | — | — | ✓ |
| Comentar solicitud | ✓ | ✓ | ✓ |
| Cambiar estado solicitud | — | ✓ | ✓ |
| Ver notificaciones propias | ✓ | ✓ | ✓ |
| Ejecutar import manual | — | — | ✓ |
| Ver historial de imports | — | — | ✓ |
| Ver deliveries/attempts | — | — | ✓ |
| Acceder a `/soporte/*` | ✗ (blocked) | ✗ (blocked) | ✓ |

---

## 9. Criterios de severidad

| Nivel | Definición | Impacto en piloto |
|-------|------------|------------------|
| **Crítico** | Fuga de datos, acceso no autorizado, corrupción de datos, login externo exitoso | **No-Go inmediato** |
| **Alto** | Flujo principal roto sin workaround (crear solicitud, notificación no llega) | No-Go salvo excepción |
| **Medio** | Flujo principal funciona pero con fricción; workaround disponible | Go con restricción documentada |
| **Bajo** | Visual, copy, mejora de UX, estado vacío confuso | Go con backlog |

---

## 10. Criterios Go/No-Go

### Go (puede abrir piloto)

- [ ] Ningún bug Crítico abierto
- [ ] Todos los flujos Nivel 1 pasan
- [ ] Todos los flujos Nivel 2 pasan (o tienen excepción documentada con workaround)
- [ ] Ningún correo externo puede completar login
- [ ] Ningún vendedor puede ver datos de otra sucursal
- [ ] Import manual funciona al menos una vez sin corrupción
- [ ] PDF funciona

### Go con restricción

- Hasta 3 bugs Alto con workaround documentado
- Modo responsive con issues menores conocidos
- Banner/card de imports no muestra métricas pero inventario carga correctamente

### No-Go

- Cualquier bug Crítico abierto
- Login externo exitoso en cualquier escenario
- Vendedor ve solicitudes o inventario de otra sucursal sin autorización
- Import corrompe inventario existente
- Coordinador puede aprobar solicitudes de sucursales no asignadas

---

## 11. Evidencias requeridas

Por cada bug Crítico o Alto:
- Captura de pantalla o video
- URL donde ocurrió
- Pasos exactos para reproducir
- Navegador y dispositivo

Por el QA completo:
- Fecha de ejecución
- Tester
- Lista de casos ejecutados con resultado (✓ / ✗ / Bloqueado)
- Decisión Go/No-Go firmada

Usar plantilla en [QA_PILOT_RESULTS_TEMPLATE.md](./QA_PILOT_RESULTS_TEMPLATE.md).

---

## 12. Orden de ejecución

Ejecutar los módulos en este orden para que los datos de uno alimenten el siguiente:

```
1. SEC (bloqueantes) → confirmar aislamiento de seguridad antes de probar flujos
2. AUTH            → validar que todos los roles entran correctamente
3. INV             → confirmar inventario disponible para solicitudes
4. REQ             → flujo principal de solicitudes (depende de inventario)
5. NOTIF           → validar que las notificaciones de REQ llegaron
6. UX              → smoke test final de interfaz
```

---

## 13. Riesgos conocidos

| Riesgo | Mitigación |
|--------|-----------|
| Índices Firestore recién desplegados tardando en construirse | Esperar 10 min antes del QA y verificar en Firebase Console > Firestore > Indexes |
| `INVENTORY_CSV_URL` no configurada | Verificar en Cloud Functions antes del QA; ejecutar import de prueba |
| Notificaciones por correo pueden no llegar en dev | En V1 piloto, el canal crítico es in-app. Correo es backup. |
| Usuarios sin documentos `usuarios/{uid}` en Firestore | Seguir PILOT_INITIAL_DATA_CHECKLIST.md antes del QA |
| Warning de chunk size confundido con error | Es preexistente y no afecta funcionalidad |

---

## Referencias

- [QA_PILOT_TEST_CASES.md](./QA_PILOT_TEST_CASES.md)
- [QA_PILOT_RESULTS_TEMPLATE.md](./QA_PILOT_RESULTS_TEMPLATE.md)
- [QA_PILOT_BUG_LOG.md](./QA_PILOT_BUG_LOG.md)
- [PILOT_INITIAL_DATA_CHECKLIST.md](./PILOT_INITIAL_DATA_CHECKLIST.md)
- [PILOT_DEPLOY_CHECKLIST.md](./PILOT_DEPLOY_CHECKLIST.md)
