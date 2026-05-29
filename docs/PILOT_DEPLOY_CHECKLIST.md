# Pilot Deploy Checklist (LAB-PROD-020)

Checklist operativo para deploy a piloto. Completar en orden. No hacer deploy a producción si algún ítem de Pre-deploy falla.

Ver [FIREBASE_DEPLOY_RUNBOOK.md](./FIREBASE_DEPLOY_RUNBOOK.md) para el paso a paso detallado.

---

## Pre-deploy

### Código

- [ ] `npm run lint` — 0 errores
- [ ] `npm run build` — build exitoso, sin errores (el warning de chunk size es conocido y aceptable)
- [ ] `cd functions && npm install && npm run lint` — 0 errores
- [ ] `node --check functions/index.js` — sin errores de sintaxis
- [ ] `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('ok')"` — JSON válido

### Entorno

- [ ] `.env.local` existe y tiene `VITE_FIREBASE_PROJECT_ID` del proyecto objetivo
- [ ] `.env.local` tiene `VITE_AUTH_MODE=firebase`
- [ ] `.env.local` tiene `VITE_INVENTORY_SOURCE_MODE=firestore`
- [ ] `.firebaserc` local existe y apunta al proyecto correcto
- [ ] `npx firebase-tools use` muestra el proyecto esperado
- [ ] Sesión CLI activa (`npx firebase-tools login:list`)

### Firebase Console

- [ ] Firebase Authentication habilitado
- [ ] Google Provider habilitado y configurado
- [ ] Cloud Firestore creado (modo producción)
- [ ] Firebase Hosting habilitado
- [ ] Al menos un usuario soporte con `usuarios/{uid}` creado en Firestore
- [ ] `INVENTORY_CSV_URL` configurado en Functions (si se va a usar el importador)

---

## Deploy

Ejecutar en orden:

- [ ] `npx firebase-tools deploy --only firestore:rules` — sin errores
- [ ] `npx firebase-tools deploy --only firestore:indexes` — sin errores
- [ ] `npx firebase-tools deploy --only functions` — sin errores
- [ ] `npx firebase-tools deploy --only hosting` — sin errores, URL impresa

---

## Post-deploy: Smoke Test

### Acceso y autenticación

- [ ] Abrir URL de Hosting — app carga sin pantalla blanca
- [ ] Login con correo `@zapata.com.mx` — entra correctamente
- [ ] Login con correo externo — bloqueado con mensaje claro
- [ ] Usuario sin `usuarios/{uid}` — muestra pantalla "no autorizado"
- [ ] Ruta directa (ej. `/inventario`) en tab nuevo — SPA carga correctamente (no 404)

### Vendedor

- [ ] Login como vendedor activo
- [ ] Inventario Nacional carga con datos desde Firestore
- [ ] Puede buscar y filtrar unidades
- [ ] Puede abrir detalle de unidad
- [ ] Export PDF de unidad funciona
- [ ] Puede crear solicitud entre sucursales
- [ ] No puede acceder a `/soporte/*` (redirige a unauthorized)

### Soporte

- [ ] Login como soporte activo
- [ ] Puede acceder a `/soporte/inventario/imports`
- [ ] Historial de imports carga (o muestra vacío si no hay imports)
- [ ] Filtro por status "completado" funciona sin error de índice
- [ ] Panel de import manual visible
- [ ] Ejecutar import manual — aparece resultado con importId
- [ ] Puede copiar importId al portapapeles
- [ ] Puede acceder a vistas de deliveries y notificaciones de soporte

### Inventario Nacional

- [ ] Banner de frescura visible
- [ ] Card de último import visible (si hay imports en Firestore)
- [ ] Historial de imports abre drawer con corridas
- [ ] Filtros de inventario funcionan
- [ ] Sidebar muestra 5 categorías correctas

### Notificaciones

- [ ] Al crear solicitud se genera notificación para los involucrados
- [ ] Notificaciones llegan en tiempo real (badge en campana)
- [ ] Marcar como leída funciona

---

## Go/No-Go piloto

### Criterios para aprobar (Go)

- [ ] Login Google funcional con restricción `@zapata.com.mx`
- [ ] Vendedor puede ver inventario real y crear solicitudes
- [ ] Coordinador puede ver y responder solicitudes de su sucursal
- [ ] Notificaciones in-app llegan en los eventos mínimos (nueva solicitud, cambio de estado)
- [ ] Inventario se actualiza diariamente (o vía import manual)
- [ ] Soporte puede ejecutar import manual y revisar historial
- [ ] Ningún usuario puede leer ni escribir datos fuera de su rol
- [ ] Logs de Functions sin errores críticos en las primeras 24h

### Criterios para detener piloto (No-Go)

- Fuga de datos entre roles (vendedor ve solicitudes ajenas, etc.)
- Login de correos externos exitoso
- Import masivo corrompe inventario existente
- Notificaciones llegan a usuarios incorrectos
- Crash no recuperable en el flujo principal de solicitudes
- Firestore rules desplegadas con errores de compilación

---

## Notas operativas

- Los índices Firestore pueden tardar hasta 10 minutos en construirse. Si las vistas de soporte fallan con `failed-precondition` inmediatamente después del deploy, esperar y recargar.
- El primer import diario ocurre según el schedule configurado (`every day 05:00 America/Mexico_City`). Para verificar antes, ejecutar import manual desde `/soporte/inventario/imports`.
- El warning de chunk size en el build (`> 500 kB`) es preexistente y no afecta funcionalidad.

---

## Después del deploy: QA end-to-end

Una vez completado el smoke test post-deploy, ejecutar el QA completo antes de abrir acceso a usuarios piloto reales:

- Plan: [QA_PILOT_E2E_PLAN.md](./QA_PILOT_E2E_PLAN.md)
- Casos: [QA_PILOT_TEST_CASES.md](./QA_PILOT_TEST_CASES.md)
- Registrar resultados en: [QA_PILOT_RESULTS_TEMPLATE.md](./QA_PILOT_RESULTS_TEMPLATE.md)

El piloto no debe abrirse a usuarios reales hasta que la decisión del QA sea **Go** o **Go con restricciones** documentadas.

---

## Referencias

- [FIREBASE_DEPLOY_RUNBOOK.md](./FIREBASE_DEPLOY_RUNBOOK.md)
- [FIREBASE_ENVIRONMENT_SETUP.md](./FIREBASE_ENVIRONMENT_SETUP.md)
- [FIRESTORE_RULES_SETUP.md](./FIRESTORE_RULES_SETUP.md)
- [SUPPORT_INVENTORY_IMPORTS.md](./SUPPORT_INVENTORY_IMPORTS.md)
- [QA_PILOT_E2E_PLAN.md](./QA_PILOT_E2E_PLAN.md)
- [QA_PILOT_TEST_CASES.md](./QA_PILOT_TEST_CASES.md)
