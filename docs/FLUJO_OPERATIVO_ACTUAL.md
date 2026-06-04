# Flujo Operativo Actual LAB

## Principios

- El estado actual del repo manda.
- Un ticket por rama.
- Cambios pequenos.
- No mezclar limpieza, seguridad y features.
- No usar el blueprint viejo como backlog.
- No desarrollar modulos nuevos sin ticket aprobado.

## Tipos de rama

- `fix/LAB-XXX-descripcion`
- `docs/LAB-XXX-descripcion`
- `chore/LAB-XXX-descripcion`

## Inicio de ticket

```bash
git checkout main
git pull origin main
git status
npm run lint
npm run build
git checkout -b tipo/LAB-XXX-descripcion
```

## Durante el ticket

- No tocar archivos fuera del alcance.
- No instalar librerias.
- No modificar roles o rutas si el ticket no lo pide.
- Documentar limitaciones.
- Si aparece un worktree sucio inesperado, detenerse.

## Cierre de ticket

```bash
npm run lint
npm run build
git status
git diff --stat
git add ...
git commit -m "tipo: descripcion"
git push -u origin rama
```

## Merge a main

```bash
git checkout main
git pull origin main
git merge --no-ff rama -m "merge: integrate LAB-XXX descripcion"
npm run lint
npm run build
git push origin main
```

## CI minimo

GitHub Actions valida:

- `npm ci`
- `npm run lint`
- `npm run build`

## Deploy manual

Referenciar [docs/deploy-checklist.md](docs/deploy-checklist.md).

## Smoke test

Referenciar [docs/SMOKE_TEST_OPERATIVO_ACTUAL.md](docs/SMOKE_TEST_OPERATIVO_ACTUAL.md).

## Rollback basico

### Si el cambio aun no se ha mergeado

- No mergear.
- Corregir en la rama.
- O abandonar la rama.

### Si el cambio ya se mergeo pero no se desplego

```bash
git checkout main
git pull origin main
git revert -m 1 HASH_DEL_MERGE
npm run lint
npm run build
git push origin main
```

### Si el cambio ya se desplego

- Revertir el merge.
- Validar lint y build.
- Desplegar de nuevo.
- Correr smoke test.
- Registrar incidente en docs o changelog.

## Que no hacer

- `git reset --hard` en `main` sin autorizacion.
- `git push --force` a `main`.
- `git stash pop` sin revisar.
- Mezclar tickets.
- Borrar ramas o stash sin confirmacion.

