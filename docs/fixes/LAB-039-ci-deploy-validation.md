# LAB-039 - CI and deploy validation

## Resumen ejecutivo

Se agrego una validacion minima de CI para el repo y se alineo la documentacion de deploy con el flujo real: instalar dependencias con `npm ci`, correr lint y correr build antes de mergear o desplegar.

## CI existente

- No existia un workflow de GitHub Actions para CI al inicio del ticket.
- Se creo un workflow minimo nuevo en `.github/workflows/ci.yml`.

## Que se creo o modifico

### Creado

- `.github/workflows/ci.yml`
- `docs/fixes/LAB-039-ci-deploy-validation.md`

### Modificado

- `docs/deploy-checklist.md`

## Que valida el CI

- Instala dependencias con `npm ci`.
- Ejecuta `npm run lint`.
- Ejecuta `npm run build`.
- Corre en `pull_request` hacia `main`.
- Corre en `push` hacia `main`.

## Que NO valida todavia

- No ejecuta tests.
- No hace Lighthouse.
- No hace deploy automatico.
- No valida navegacion real en navegador.
- No valida headers con `curl -I`.
- No valida smoke tests manuales.

## Como interpretar fallos

- Si falla `npm ci`, revisar `package-lock.json` y consistencia de dependencias.
- Si falla `npm run lint`, revisar errores de sintaxis o warnings convertidos en fallos por configuracion futura.
- Si falla `npm run build`, revisar imports, rutas, configuracion de Vite o errores de compilacion.

## Validacion local

- `npm ci`: OK. En Windows, fue necesario cerrar procesos previos de `vite dev` y `vite preview` que bloqueaban `node_modules`.
- `npm run lint`: 11 warnings, 0 errors.
- `npm run build`: OK, con el warning habitual de Vite por chunk grande.

## Riesgos pendientes

- El repo sigue mostrando warnings de lint en soporte de usuarios, pero no bloquean el build actual.
- No hay pruebas automatizadas adicionales para validar la UI o el flujo de navegacion.
