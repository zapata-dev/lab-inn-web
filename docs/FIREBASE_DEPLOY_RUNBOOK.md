# Firebase Deploy Runbook (LAB-PROD-020)

Guía operativa para desplegar LAB en Firebase/GCP. Cubre dev y producción.

Ver [FIREBASE_ENVIRONMENT_SETUP.md](./FIREBASE_ENVIRONMENT_SETUP.md) para configurar variables y ambientes por primera vez.

---

## 1. Precondiciones

Antes del primer deploy confirmar:

- [ ] Node 20 instalado (`node --version`)
- [ ] `npx firebase-tools --version` disponible (no requiere instalación global)
- [ ] `.env.local` configurado con variables del proyecto objetivo
- [ ] `.firebaserc` local apuntando al proyecto correcto
- [ ] Firebase Authentication habilitado con Google Provider
- [ ] Firestore habilitado en modo producción
- [ ] Firebase Hosting habilitado
- [ ] Repositorio en rama limpia (`git status` sin cambios pendientes)

---

## 2. Login Firebase CLI

```bash
npx firebase-tools login
```

Abre navegador para autenticar con la cuenta GCP que tiene acceso al proyecto.

Para verificar la sesión activa:

```bash
npx firebase-tools login:list
```

---

## 3. Selección de proyecto

```bash
# Desarrollo
npx firebase-tools use default

# Producción
npx firebase-tools use production
```

Para verificar el proyecto activo:

```bash
npx firebase-tools use
```

**Siempre confirmar el proyecto antes de un deploy a producción.**

---

## 4. Build frontend

```bash
npm run lint
npm run build
```

El output queda en `dist/`. Firebase Hosting sirve desde ese directorio.

Si lint falla, NO continuar con el deploy.

---

## 5. Validar Cloud Functions

```bash
cd functions
npm install
npm run lint
node --check index.js
node --check inventoryImport.js
node --check inventoryMapper.js
node --check inventoryQuality.js
node --check inventoryDrift.js
node --check csvParser.js
cd ..
```

Si algún `--check` falla, NO desplegar Functions.

---

## 6. Deploy por partes (recomendado)

Desplegar en orden para detectar errores aislados:

### 6.1 Reglas Firestore

```bash
npx firebase-tools deploy --only firestore:rules
```

Verifica en Firebase Console > Firestore > Rules que el contenido coincide con `firestore.rules`.

### 6.2 Índices Firestore

```bash
npx firebase-tools deploy --only firestore:indexes
```

Los índices pueden tardar varios minutos en construirse después del deploy. Verificar en Firebase Console > Firestore > Indexes.

### 6.3 Cloud Functions

```bash
npx firebase-tools deploy --only functions
```

Verificar en Firebase Console > Functions que `scheduledInventoryImport` y `runInventoryImportNow` aparecen activas.

### 6.4 Hosting

```bash
npx firebase-tools deploy --only hosting
```

El comando imprime la URL del proyecto. Abrir y confirmar que la app carga.

---

## 7. Deploy completo

Cuando todos los pasos parciales han sido validados en dev, el deploy completo a producción es:

```bash
# Confirmar proyecto
npx firebase-tools use production

# Build
npm run lint && npm run build

# Deploy
npx firebase-tools deploy
```

---

## 8. Smoke test post-deploy

Abrir la URL de Hosting y verificar:

| Escenario | Resultado esperado |
|-----------|-------------------|
| Cargar URL raíz | App carga sin pantalla blanca |
| Login con correo `@zapata.com.mx` | Redirige a pantalla de autorización o home |
| Login con correo externo | Bloqueado con mensaje de dominio |
| Usuario sin documento `usuarios/{uid}` | Muestra pantalla "no autorizado" |
| Vendedor activo | Ve inventario, puede crear solicitudes |
| Soporte activo | Ve `/soporte/inventario/imports` |
| Ruta inexistente (`/xyz`) | Redirige a app (SPA fallback funciona) |
| Inventario Nacional | Muestra datos desde Firestore |
| Import manual (soporte) | Se ejecuta y queda en `importsInventario` |

---

## 9. Rollback

### Hosting

Desde Firebase Console > Hosting > Release history, hacer clic en "Rollback" en la versión anterior.

O vía CLI:

```bash
npx firebase-tools hosting:clone <RELEASE_ID>:lab-comercial-dev lab-comercial-dev
```

### Functions

Redeploy de la versión anterior del branch:

```bash
git checkout <commit-anterior>
cd functions && npm install
npx firebase-tools deploy --only functions
git checkout -
```

### Scheduler (importador diario)

Si el scheduler está causando problemas, pausarlo desde GCP Console > Cloud Scheduler > Pause job.

Reactivar cuando el problema esté resuelto:

```bash
# GCP Console > Cloud Scheduler > Resume
```

O simplemente redeploy de functions sin el scheduler activo (cambiar schedule en index.js temporalmente).

---

## 10. Riesgos comunes

| Síntoma | Causa probable | Fix |
|---------|---------------|-----|
| Login falla silenciosamente | Google Provider no habilitado en Authentication | Habilitar en Firebase Console |
| Login bloqueado con "dominio no autorizado" | `VITE_FIREBASE_ALLOWED_DOMAIN` incorrecto | Revisar `.env.local` y rebuild |
| App carga en `/` pero rutas directas dan 404 | Hosting rewrite no configurado | Verificar `firebase.json` hosting.rewrites |
| Firestore queries fallan con `failed-precondition` | Índices no desplegados o aún construyéndose | Esperar build de índices (~5-10 min) o redeploy |
| Functions deploy falla con "Node version mismatch" | Node local distinto a Node 20 | Usar `nvm use 20` o instalar Node 20 |
| `INVENTORY_CSV_URL_NOT_CONFIGURED` al ejecutar import | Variable no seteada en Functions | Configurar vía Firebase CLI secrets o `.env` en functions |
| Import falla con `INVENTORY_IMPORT_FETCH_FAILED_404` | URL del CSV no accesible | Verificar URL y permisos de acceso público |
| Usuarios pueden hacer login pero ven pantalla vacía | Documento `usuarios/{uid}` faltante | Crear manualmente en Firestore Console |

---

## 11. Bootstrap del primer usuario soporte (nuevo ambiente)

Cada vez que se crea un ambiente desde cero:

1. Iniciar sesión con Google una vez (genera `uid` en Authentication).
2. Copiar `uid` desde Firebase Console > Authentication > Users.
3. Crear `usuarios/{uid}` en Firestore manualmente:

```json
{
  "uid": "<uid>",
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre Apellido",
  "rol": "soporte",
  "activo": true,
  "sucursalId": "central",
  "createdAt": "<serverTimestamp>"
}
```

4. Cerrar sesión e iniciar sesión de nuevo en la app.

Ver [AUTHORIZATION_USERS_FIRESTORE.md](./AUTHORIZATION_USERS_FIRESTORE.md) para el esquema completo del documento `usuarios`.

---

## 12. Referencias

- [FIREBASE_ENVIRONMENT_SETUP.md](./FIREBASE_ENVIRONMENT_SETUP.md) — configuración de variables y ambientes
- [PILOT_DEPLOY_CHECKLIST.md](./PILOT_DEPLOY_CHECKLIST.md) — checklist operativo pre/post deploy
- [FIRESTORE_RULES_SETUP.md](./FIRESTORE_RULES_SETUP.md) — reglas de seguridad
- [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) — índices y cómo desplegarlos
- [SCHEDULED_INVENTORY_IMPORT.md](./SCHEDULED_INVENTORY_IMPORT.md) — variables y deploy del importador
