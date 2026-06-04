# Deploy Checklist MVP LAB

## Fuente de verdad

Antes de desplegar, revisar `docs/LAB-ALCANCE-ACTUAL.md` y el baseline de estado actual.

## Pre-deploy

- [ ] `main` limpio.
- [ ] `npm run lint` OK.
- [ ] `npm run build` OK.
- [ ] `dist/` generado.
- [ ] Remote configurado y branch listo para publicar.

## Checklist de despliegue

- [ ] El proveedor de hosting elegido sigue siendo el destino activo del repo.
- [ ] Las variables de entorno del entorno objetivo coinciden con el README y con la config del proyecto.
- [ ] No se modificaron `src/` ni reglas de acceso como parte de este ticket.

## Smoke test post-deploy

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
- [ ] `/soporte/usuarios`
- [ ] Refrescar rutas protegidas no da 404.
- [ ] Cerrar sesion vuelve a `/login`.

## Criterio de cierre

El deploy se considera listo cuando lint y build pasan, el sitio responde en el host elegido y el smoke test anterior no encuentra 404 ni loops de autenticacion.

