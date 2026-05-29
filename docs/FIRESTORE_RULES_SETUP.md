# Firestore Rules Setup - LAB-PROD-005

## 1. Objetivo

Versionar en el repo la configuracion inicial de seguridad de Firestore para Produccion Piloto: reglas y indices.

## 2. Archivos creados

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `.firebaserc.example`

## 3. Vincular proyecto Firebase

1. Copiar archivo de ejemplo:

```bash
cp .firebaserc.example .firebaserc
```

2. Editar `.firebaserc` y reemplazar `TU_PROJECT_ID_FIREBASE` por el projectId real.

Importante:

- No commitear `.firebaserc` real con datos sensibles del entorno.

## 4. Revisar reglas en Firebase Console

1. Firebase Console > Firestore Database > Rules.
2. Verificar que el contenido desplegado coincida con `firestore.rules`.
3. Usar Rules Playground para validar escenarios por rol.

## 5. Desplegar reglas e indices

Sin instalar dependencias globales, usando `npx`:

```bash
npx firebase-tools deploy --only firestore:rules
npx firebase-tools deploy --only firestore:indexes
```

Para el proceso completo de deploy incluyendo Functions y Hosting, ver [FIREBASE_DEPLOY_RUNBOOK.md](./FIREBASE_DEPLOY_RUNBOOK.md).

## 6. Bootstrap del primer usuario soporte

Como las reglas dependen de `usuarios/{uid}`, el primer soporte se da de alta manualmente:

1. Iniciar sesion una vez con Google para generar `uid` en Firebase Authentication.
2. Copiar `uid` desde Firebase Console > Authentication.
3. Crear documento `usuarios/{uid}` en Firestore manualmente.
4. Cargar campos minimos y setear:
   - `rol: "soporte"`
   - `activo: true`
5. Cerrar sesion e iniciar sesion otra vez.

## 7. Pruebas manuales recomendadas (Rules Playground)

- No autenticado leyendo `inventario/{vin}` -> deny.
- Autenticado sin `usuarios/{uid}` leyendo inventario -> deny.
- Vendedor activo leyendo inventario -> allow.
- Vendedor leyendo solicitud ajena -> deny.
- Coordinador leyendo solicitud fuera de su sucursal -> deny.
- Soporte leyendo `auditoria/{auditId}` -> allow.
- Cualquier rol borrando `auditoria/{auditId}` -> deny.

## 8. Que NO cubre este ticket

- UI de solicitudes.
- Cloud Functions.
- Reglas avanzadas de transicion de estados (V1.1).
- Multi-sucursal por usuario.
- Custom claims.

## 9. Reglas de notificaciones despues de Cloud Functions
- El cliente no debe crear documentos en `notificaciones`.
- Las notificaciones las crea Cloud Functions mediante Admin SDK (server-side).
- Las rules de Firestore siguen aplicando para cliente:
  - leer propias notificaciones (`userId == request.auth.uid`) o soporte.
  - marcar como leida (`leida`, `readAt`) solo en sus propias notificaciones.
- Este modelo evita abrir permisos de escritura global para fan-out.

## 10. Inventario masivo server-side (LAB-PROD-015)
- La importacion diaria de inventario se ejecuta desde Cloud Functions con Admin SDK.
- El cliente frontend no debe realizar escritura masiva de `inventario/{vin}`.
- `importsInventario/{importId}` sirve como bitacora operativa de cada corrida.
- Este enfoque evita abrir reglas de escritura amplia para usuarios cliente.
