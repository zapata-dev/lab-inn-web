# GCP + Firebase Setup LAB

## Objetivo
Dejar lista la infraestructura dev para login real con Firebase Auth + Firestore en LAB, sin tocar modulos funcionales.

## Parametros confirmados
- Nombre de proyecto: `LAB INN Web`
- Project ID objetivo dev: `lab-inn-web-dev`
- Produccion: pendiente futura (`lab-inn-web-prod` solo documentado)
- Dominio actual: `lab-inn-web.onrender.com`
- Dominio futuro: pendiente
- Region preferida general: `us-central1`
- Firestore: `nam5` o `us-central` (priorizar `us-central1` si hay duda)
- Correo soporte exacto: pendiente de confirmacion

## Restricciones de este ticket
No tocar:
- Inventario
- Functions
- Sidebar
- Modulos comerciales
- Salesforce
- Capacitacion
- PDFs
- Firestore rules/indexes

## Estado actual
- Codigo auth/roles ya implementado en frontend.
- Proyecto dev y app web ya creados en Firebase.
- Hosting objetivo activo: Firebase Hosting (`lab-inn-web-dev`).
- Render queda en estado deprecado para este flujo.

## Comandos de referencia (no ejecutar sin aprobacion)
1. Verificar CLI:
```bash
npx firebase-tools --version
```

2. Login:
```bash
npx firebase-tools login
```

3. Crear proyecto dev (si no existe y con billing/permisos):
```bash
npx firebase-tools projects:create lab-inn-web-dev
```

4. Crear app web:
```bash
npx firebase-tools apps:create WEB "LAB Web" --project lab-inn-web-dev
```

5. Obtener SDK config:
```bash
npx firebase-tools apps:sdkconfig WEB <APP_ID> --project lab-inn-web-dev
```

## Decisiones abiertas
- Si `lab-inn-web-dev` ya esta ocupado globalmente, definir variante con Diego antes de crear (ejemplo: `lab-inn-web-dev-xx`).
- Si hay organizacion/folder disponibles, mostrar opciones y pedir confirmacion antes de elegir.
- Confirmar correo de soporte exacto `@zapata.com.mx` antes de configurarlo.

## Pendiente para produccion
- Crear proyecto prod
- Estrategia de promotion dev -> prod
- Endurecimiento IAM por rol
- Checklist de go-live prod
