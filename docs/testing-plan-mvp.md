# Testing Plan MVP LAB

## Usuarios a probar

| Usuario | Rol | Alcance |
|---------|-----|---------|
| Admin LAB | admin | Global |
| Dirección | direccion | Global |
| Gerente | gerente | Sucursal |
| Ejecutivo | ejecutivo | Sucursal |
| BDC LAB | bdcLab | Global |
| BDC Sucursal | bdcSucursal | Sucursal |

## Flujos críticos

1. **Login / cambio de usuario** — seleccionar usuario, verificar dashboard correcto por rol.
2. **Dashboard por rol** — KPIs y secciones visibles según alcance (global vs. sucursal).
3. **Inventario → detalle → agregar a cotización** — filtrar, abrir modal, iniciar cotización.
4. **Cotizador → confirmar cotización** — 3 pasos, modal de confirmación, folio generado.
5. **Salesforce → oportunidad → drawer → avanzar etapa** — tab tablero/leads/oportunidades, abrir drawer, seguimiento.
6. **Capacitación → marcar video → diagnóstico** — progreso guardado, diagnóstico 5 preguntas, barra al 100%.
7. **Soporte → tomar ticket → resolver ticket** — filtros, acciones, FAQ.
8. **Perfil Admin → snapshot storage → reset controlado** — ver KPIs, tabla usuarios, storage keys, doble-confirm reset.
9. **Demo guiada → 6 pasos** — botón Topbar, navegación auto, Salir y Finalizar.

## Registro de bugs

| ID | Usuario | Ruta | Paso | Esperado | Obtenido | Severidad | Estado |
|----|---------|------|------|----------|----------|-----------|--------|
| — | — | — | — | — | — | — | — |

**Severidades:** `blocker` / `high` / `medium` / `low`
