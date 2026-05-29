# Firebase Environment Setup (LAB-PROD-020)

## 1. Ambientes recomendados

| Alias Firebase CLI | Proyecto Firebase | Uso |
|--------------------|-------------------|-----|
| `default` | `lab-comercial-dev` | Pruebas funcionales, validación técnica, QA |
| `production` | `lab-comercial-prod` | Piloto controlado con usuarios autorizados |

Los dos proyectos deben ser proyectos Firebase separados en GCP para aislar datos y configuración completamente.

---

## 2. Servicios a habilitar en Firebase Console

Habilitarlos en **cada proyecto** antes del primer deploy:

| Servicio | Ruta en Firebase Console |
|----------|--------------------------|
| Firebase Authentication | Authentication > Sign-in method |
| Google Provider | Authentication > Sign-in method > Google > Enable |
| Cloud Firestore | Firestore Database > Create database |
| Cloud Functions | Functions (se habilita al primer deploy) |
| Cloud Scheduler | GCP Console > Cloud Scheduler (habilitado automáticamente con Functions v2) |
| Firebase Hosting | Hosting > Get started |

**Restricción de dominio:**
En Authentication > Settings > Authorized domains, confirmar que solo `zapata.com.mx` está autorizado (o configurar restricción en app vía `VITE_FIREBASE_ALLOWED_DOMAIN`).

---

## 3. Variables frontend (`.env.local`)

Estas variables se leen en build time por Vite. **No se incluyen en el bundle de producción de forma legible**, pero sí quedan accesibles en el JS final. No deben contener secretos críticos.

```bash
# Copiar desde Firebase Console > Project Settings > Your apps > Web app
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=lab-comercial-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lab-comercial-dev
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Región donde están desplegadas las Cloud Functions
VITE_FIREBASE_FUNCTIONS_REGION=us-central1

# Solo correos @zapata.com.mx pueden iniciar sesión
VITE_FIREBASE_ALLOWED_DOMAIN=zapata.com.mx

# Modos de operación
VITE_AUTH_MODE=firebase
VITE_INVENTORY_SOURCE_MODE=firestore
VITE_INVENTORY_STALE_HOURS=24
```

Para producción, cambiar `VITE_FIREBASE_*` al proyecto `lab-comercial-prod`.

---

## 4. Variables Cloud Functions (secrets)

Las Functions leen sus variables de entorno desde **Firebase/GCP Secret Manager** o archivo `.env` local en `functions/`.

Para desarrollo local:

```bash
# functions/.env  (no commitear)
INVENTORY_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv
INVENTORY_IMPORT_SCHEDULE=every day 05:00
INVENTORY_IMPORT_TIME_ZONE=America/Mexico_City
INVENTORY_IMPORT_SOURCE=csv
```

Para producción, usar Firebase CLI secrets:

```bash
npx firebase-tools functions:secrets:set INVENTORY_CSV_URL
```

O configurar desde Firebase Console > Functions > (función) > Variables y secretos.

`INVENTORY_CSV_URL` contiene la URL del Sheet con el inventario. Es información sensible — no commitear.

---

## 5. Cómo crear `.env.local` para desarrollo

```bash
# En la raíz del repo
cp .env.example .env.local
```

Editar `.env.local` con los valores reales del proyecto Firebase dev.

`.env.local` está en `.gitignore` — nunca se commitea.

---

## 6. Cómo crear `.firebaserc` local

```bash
cp .firebaserc.example .firebaserc
```

Editar `.firebaserc` y reemplazar:
- `TU_PROJECT_ID_FIREBASE_DEV` → ID real del proyecto dev (ej. `lab-comercial-dev`)
- `TU_PROJECT_ID_FIREBASE_PROD` → ID real del proyecto prod (ej. `lab-comercial-prod`)

`.firebaserc` está en `.gitignore` — nunca se commitea.

Para verificar el proyecto activo:

```bash
npx firebase-tools use
```

Para cambiar entre ambientes:

```bash
npx firebase-tools use default       # → lab-comercial-dev
npx firebase-tools use production    # → lab-comercial-prod
```

---

## 7. Qué NO subir al repo

| Archivo | Razón |
|---------|-------|
| `.env.local` | Contiene credenciales Firebase reales |
| `.env.production` | Ídem |
| `.firebaserc` | Contiene projectId real del proyecto |
| `functions/.env` | Contiene `INVENTORY_CSV_URL` privada |
| `functions/.secret.local` | Secretos locales de emulador |

Confirmar que todos están en `.gitignore` antes del primer commit al repositorio.

---

## 8. Validación de dominio @zapata.com.mx

La app valida el dominio del correo autenticado antes de dar acceso:

1. Firebase Authentication verifica que el correo sea `@zapata.com.mx` (vía regla en `firestore.rules` y validación en cliente).
2. Si el correo no pertenece al dominio, el login queda bloqueado.
3. Incluso si el correo es válido, el usuario debe existir en `usuarios/{uid}` con `activo: true` para acceder a funciones protegidas.

Para habilitar usuarios en un proyecto nuevo:
1. El usuario inicia sesión con Google una vez.
2. Soporte crea `usuarios/{uid}` manualmente en Firestore Console con `rol`, `activo: true`, `sucursalId`, etc.
3. El usuario recarga la app y ya tiene acceso según su rol.

Ver [AUTHORIZATION_USERS_FIRESTORE.md](./AUTHORIZATION_USERS_FIRESTORE.md) para detalle de campos del documento `usuarios`.
