# Migracion de Hosting: Render -> Firebase Hosting

## Objetivo
Documentar migracion controlada para servir LAB desde Firebase Hosting cuando se decida.

## Alcance
- Hosting frontend SPA
- Mantener auth/roles actuales
- Sin Functions en este ticket

## Prerrequisitos
- Proyecto Firebase dev listo
- Web app creada
- Variables reales validadas
- Build local en verde (`lint` y `build`)

## Configuracion esperada de `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## Flujo sugerido
1. Build local:
```bash
npm run lint
npm run build
```

2. Seleccionar proyecto:
```bash
npx firebase-tools use <PROJECT_ID_DEV>
```

3. Deploy hosting:
```bash
npx firebase-tools deploy --only hosting
```

## Validaciones post-deploy
- `/login` carga correctamente.
- Login externo bloquea.
- Usuario autorizado entra.
- `/unauthorized` funciona.
- Modo demo sigue operativo con `VITE_AUTH_MODE=demo`.

## Rollback
- Si falla Firebase Hosting, mantener Render como origen primario.
- Revertir DNS/canonical target solo cuando exista estrategia formal de corte.

## Pendientes antes de corte final
- Dominio futuro definido
- TLS y redirect policy
- Monitoreo de errores frontend