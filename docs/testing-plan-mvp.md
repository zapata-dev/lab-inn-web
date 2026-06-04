# Testing Plan MVP LAB

## Fuente de verdad

El estado actual del repo y `docs/LAB-ALCANCE-ACTUAL.md` mandan sobre cualquier blueprint viejo.

## Usuarios a probar

| Usuario | Rol | Alcance |
| --- | --- | --- |
| Admin LAB | admin | Global |
| Direccion | direccion | Global |
| Gerente | gerente | Sucursal |
| Ejecutivo | ejecutivo | Sucursal |
| BDC LAB | bdcLab | Global |
| BDC Sucursal | bdcSucursal | Sucursal |
| Vendedor | vendedor | Productivo |
| Coordinador | coordinador | Productivo |
| Soporte | soporte | Productivo |

## Flujos criticos actuales

1. Login y logout.
2. Acceso por rol y redireccion a `/unauthorized` cuando no hay autorizacion.
3. Navegacion principal y refresco de rutas actuales.
4. Inventario, promociones, catalogo de portadas y YouTube.
5. Perfil, usuarios y soporte de usuarios.
6. Validacion de rutas protegidas con sesion activa.
7. Validacion de rutas protegidas despues de refrescar.

## Smoke test base

Usar como referencia `docs/baseline/LAB-029-smoke-test-actual.md` para confirmar:

- `/login`
- `/`
- `/inicio`
- `/catalogo-portadas`
- `/inventario`
- `/promociones`
- `/herramientas`
- `/capacitacion`
- `/perfil`
- `/youtube`
- `/canal-youtube`
- `/salesforce`
- `/usuarios`
- `/soporte/usuarios`

## Fuera de alcance en este plan

- No crear roles nuevos.
- No crear modulos nuevos.
- No recuperar el blueprint viejo.
- No documentar cotizacion, dashboards futuros ni flujos que ya no formen parte del alcance actual.

## Evidencia

Para cada fallo capturar:

- URL exacta.
- Usuario o rol usado.
- Pantalla observada.
- Primer error rojo de consola.
- Requests relevantes de Network.
- Resultado esperado vs resultado real.

