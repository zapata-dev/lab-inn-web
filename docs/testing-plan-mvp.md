# Testing Plan MVP LAB

## Fuente de verdad

El estado actual del repo y `docs/LAB-ALCANCE-ACTUAL.md` mandan sobre cualquier blueprint viejo.

## Smoke test canonico

El smoke test operativo actual vive en [`docs/SMOKE_TEST_OPERATIVO_ACTUAL.md`](docs/SMOKE_TEST_OPERATIVO_ACTUAL.md). Si este documento y el smoke test canónico difieren, manda el smoke test canónico.

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

## Fuera de alcance en este plan

- No crear roles nuevos.
- No crear modulos nuevos.
- No recuperar el blueprint viejo.
- No documentar cotizacion, dashboards futuros ni flujos que ya no formen parte del alcance actual.
- No duplicar manualmente el smoke test canónico.

## Evidencia

Para cada fallo capturar:

- URL exacta.
- Usuario o rol usado.
- Pantalla observada.
- Primer error rojo de consola.
- Requests relevantes de Network.
- Resultado esperado vs resultado real.

