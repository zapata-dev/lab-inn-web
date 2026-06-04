# LAB-038 - Security Headers Hosting

## Resumen ejecutivo

Agregué headers básicos de seguridad al hosting activo del proyecto sin cambiar proveedor, rutas, roles ni reglas de acceso.

## Hosting activo detectado

- Firebase Hosting es el hosting activo documentado.
- Render aparece como histórico/deprecado en la documentación de auth y hosting.
- Vercel queda como archivo de configuración paralelo, pero no fue tocado.

## Headers agregados

En `firebase.json` agregué un bloque global de headers para todas las rutas:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy-Report-Only`

## CSP

La CSP quedó en `Report-Only` y no en modo enforce para evitar romper login, Firebase Auth, assets o cargas actuales mientras se observa el comportamiento real en producción.

## Qué no se tocó

- No se cambió proveedor de hosting.
- No se eliminaron las configuraciones de Render ni Vercel.
- No se tocaron rutas.
- No se tocaron roles.
- No se tocó `AuthContext`.
- No se tocaron Firestore Rules.
- No se instaló ninguna librería.
- No se alteró la caché existente de `index.html`, assets o service workers.

## Validación

- `npm run lint`: 11 warnings, 0 errors.
- `npm run build`: OK, con el warning habitual de Vite por chunks grandes.
- `firebase.json` parsea correctamente con Node.

## Validación Firebase CLI

- `npx.cmd firebase-tools --version`: `15.19.1`
- Intento de preview deploy:
  - Comando: `npx.cmd firebase-tools hosting:channel:deploy lab-038-preview --expires 1d --only hosting`
  - Resultado: falló porque la CLI no detectó `site` o `target` de Hosting en `firebase.json`

## Cómo validar post-deploy

Ejecutar:

```bash
curl -I https://TU-DOMINIO-ACTIVO
```

Y confirmar que estén presentes:

- `X-Content-Type-Options`
- `Referrer-Policy`
- `X-Frame-Options`
- `Permissions-Policy`
- `Content-Security-Policy-Report-Only`

## Riesgos pendientes

- La CSP en `Report-Only` no bloquea todavía comportamientos inseguros; solo permite observarlos.
- La validación de preview deploy quedó limitada por la detección de `site/target` en la CLI.
- Sigue habiendo warnings de lint ajenos al ticket en soporte de usuarios.

