# LAB-029 Ambientes y config

## Variables de entorno encontradas

### `.env.example`

- `VITE_BRAND_NAME`
- `VITE_DEMO_MODE`
- `VITE_VERSION`
- `VITE_AUTH_MODE`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ALLOWED_DOMAIN`
- `VITE_FIREBASE_FUNCTIONS_REGION`

## Configuraciones existentes

### `.firebaserc`

- Proyecto por defecto: `lab-inn-web-dev`

### `firebase.json`

- Hosting publico: `dist`
- Rewrite SPA: todo lo que no sea archivo real va a `index.html`
- `functions.source`: `functions`
- Reglas de Firestore: `firestore.rules`
- Headers de cache para HTML, assets y workers

### `render.yaml`

- Static site llamado `lab-inn-web`
- Build command: `npm install && npm run build`
- Output: `dist`
- Rewrite para SPA a `/index.html`

### `vercel.json`

- Rewrite unico de SPA hacia `/`

### `package.json`

- `dev`: `vite`
- `build`: `vite build`
- `preview`: `vite preview`
- `lint`: `eslint . --ext js,jsx,cjs --ignore-pattern dist --ignore-pattern node_modules`
- `format`: `prettier --write .`

### `functions/package.json`

- Runtime Node: `20`
- `lint`: `eslint .`
- `build`: mensaje de que no requiere build step para CommonJS functions

## Riesgos observados

- Hay tres destinos de deploy visibles en el repo: Firebase Hosting, Render y Vercel. Eso puede confundir sobre el host canonico.
- `VITE_AUTH_MODE` viene como `demo` en el ejemplo, asi que el modo demo es el punto de partida actual.
- Las variables Firebase del ejemplo estan vacias, por lo que el modo Firebase requiere configuracion real antes de usarlo.
- El build actual genera un chunk grande, asi que conviene vigilar el peso del bundle en tickets posteriores.
- No existe script de tests automatizados en el `package.json` raiz.
