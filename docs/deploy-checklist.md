# Deploy Checklist MVP LAB

## Pre-deploy

- [x] main limpio
- [x] npm run lint OK
- [x] npm run build OK — 356.31 kB / 825ms
- [x] dist/ generado
- [x] React Router rewrite configurado (vercel.json)
- [x] No variables env requeridas

## Hosting (Vercel — opción recomendada)

- [ ] Subir repo a GitHub
- [ ] Conectar repo en vercel.com → New Project
- [ ] Framework Preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] URL pública generada y verificada

## Post-deploy smoke test

- [ ] Login (`/login`)
- [ ] Dashboard (`/inicio`)
- [ ] Inventario (`/inventario`)
- [ ] Cotizador (`/herramientas`)
- [ ] Salesforce (`/salesforce`)
- [ ] Capacitación (`/capacitacion`)
- [ ] Soporte (`/capacitacion?tab=soporte` o similar)
- [ ] Perfil / Admin (`/perfil`)
- [ ] Demo guiada (botón en Topbar)
