# Firestore Rules Review Checklist - LAB-PROD-005

## Checklist de seguridad

- [ ] Usuarios no autenticados no leen nada operativo.
- [ ] Usuario autenticado sin `usuarios/{uid}` no lee datos operativos.
- [ ] Vendedor activo puede leer inventario nacional.
- [ ] Vendedor solo lee solicitudes donde `vendedorId == request.auth.uid`.
- [ ] Coordinador solo lee solicitudes donde participa su sucursal.
- [ ] Soporte puede leer todo el alcance operativo definido.
- [ ] Nadie puede borrar `auditoria` desde cliente.
- [ ] Nadie puede borrar `solicitudes` desde cliente.
- [ ] Notificaciones solo visibles por `userId` (o soporte).
- [ ] `usuarios/{uid}` solo editable por soporte.
- [ ] `importsInventario` solo accesible por soporte.
- [ ] Fallback deny-all activo al final de reglas.
- [ ] No existe `allow read, write: if true`.

## Checklist de configuracion

- [ ] `firebase.json` referencia `firestore.rules`.
- [ ] `firebase.json` referencia `firestore.indexes.json`.
- [ ] `firestore.indexes.json` es JSON valido.
- [ ] `.firebaserc.example` no contiene projectId real.
- [ ] `.firebaserc` real no se sube al repo.
