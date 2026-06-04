# Deploy Checklist MVP LAB

## Fuente de verdad

Antes de desplegar, revisar `docs/LAB-ALCANCE-ACTUAL.md` y el baseline de estado actual.

## Pre-deploy

- [ ] `main` limpio.
- [ ] `npm run lint` OK.
- [ ] `npm run build` OK.
- [ ] Produccion no usa `VITE_AUTH_MODE=demo`.
- [ ] Produccion no usa `VITE_DEMO_MODE=true`.
- [ ] Las variables de auth estan configuradas antes del deploy.
- [ ] El login no muestra detalles tecnicos al usuario final.
- [ ] `docs/SMOKE_TEST_OPERATIVO_ACTUAL.md` ejecutado y registrado.
- [ ] Ninguna ruta principal falla en el smoke test operativo actual.
- [ ] `dist/` generado.
- [ ] Remote configurado y branch listo para publicar.

## Checklist de despliegue

- [ ] El proveedor de hosting elegido sigue siendo el destino activo del repo.
- [ ] Las variables de entorno del entorno objetivo coinciden con el README y con la config del proyecto.
- [ ] No se modificaron `src/` ni reglas de acceso como parte de este ticket.

## Smoke test post-deploy

- [ ] Repetir el smoke test operativo actual antes de cerrar el deploy.
- [ ] `/login`
- [ ] `/`
- [ ] `/inicio`
- [ ] `/catalogo-portadas`
- [ ] `/inventario`
- [ ] `/promociones`
- [ ] `/herramientas`
- [ ] `/capacitacion`
- [ ] `/perfil`
- [ ] `/youtube`
- [ ] `/canal-youtube`
- [ ] `/salesforce`
- [ ] `/usuarios`
- [ ] `/soporte/usuarios` solo permite rol `soporte`
- [ ] Refrescar rutas protegidas no da 404.
- [ ] Cerrar sesion vuelve a `/login`.
- [ ] Si una ruta principal falla, no desplegar hasta corregirla.

## Criterio de cierre

El deploy se considera listo cuando lint y build pasan, el sitio responde en el host elegido y el smoke test anterior no encuentra 404 ni loops de autenticacion.

Si aparece `AUTH-CONFIG`, revisar variables de entorno antes de intentar publicar otra vez.

