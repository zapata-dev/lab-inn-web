# Deploy Checklist MVP LAB — Render

## Pre-deploy

- [x] main limpio
- [ ] remote GitHub configurado (`git remote add origin <URL>`)
- [x] npm run lint OK
- [x] npm run build OK — 356.31 kB / 790ms
- [x] dist/ generado
- [ ] Render conectado al repo GitHub
- [ ] Auto-deploy activado para branch `main`

## Render Static Site (render.yaml)

```yaml
rootDir: lab-mvp
buildCommand: npm install && npm run build
staticPublishPath: dist
```

## React Router Rewrite (ya en render.yaml)

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

## Deploy

- [ ] `git push origin main`
- [ ] Render detecta push automáticamente
- [ ] Render build pasa (ver logs en Dashboard)
- [ ] URL pública responde

## Smoke test post-deploy

- [ ] `/login`
- [ ] `/inicio`
- [ ] `/inventario`
- [ ] `/herramientas`
- [ ] `/salesforce`
- [ ] `/capacitacion`
- [ ] `/perfil`
- [ ] Refrescar en rutas internas no da 404
- [ ] Demo guiada (botón en Topbar)
