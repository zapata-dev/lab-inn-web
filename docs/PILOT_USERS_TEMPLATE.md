# Pilot Users Template (LAB-PROD-021)

Plantillas para crear usuarios piloto en `usuarios/{uid}`.

El `uid` proviene de Firebase Authentication. Instrucciones para obtenerlo al final de este documento.

---

## Cómo obtener el UID de un usuario

1. El usuario inicia sesión con Google en la app una vez (aunque sea redirigido a "no autorizado").
2. Abrir **Firebase Console > Authentication > Users**.
3. Buscar el correo del usuario.
4. Copiar el **User UID** de la columna correspondiente.
5. Usar ese UID como ID del documento en `usuarios/{uid}`.

---

## Usuario Soporte

**Documento:** `usuarios/UID_SOPORTE_AQUI`

```json
{
  "uid": "UID_SOPORTE_AQUI",
  "email": "soporte@zapata.com.mx",
  "nombre": "Nombre Soporte",
  "rol": "soporte",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Querétaro",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

El soporte puede pertenecer a cualquier sucursal — su rol le da acceso transversal. `sucursalId` es requerido por el esquema pero no restringe acceso para este rol.

---

## Coordinadores

### Coordinador — Querétaro

**Documento:** `usuarios/UID_COORD_QRO_AQUI`

```json
{
  "uid": "UID_COORD_QRO_AQUI",
  "email": "coord.qro@zapata.com.mx",
  "nombre": "Coordinador Querétaro",
  "rol": "coordinador",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Querétaro",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

### Coordinador — Monterrey

**Documento:** `usuarios/UID_COORD_MTY_AQUI`

```json
{
  "uid": "UID_COORD_MTY_AQUI",
  "email": "coord.mty@zapata.com.mx",
  "nombre": "Coordinador Monterrey",
  "rol": "coordinador",
  "sucursalId": "suc-mty",
  "sucursalNombre": "Monterrey",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

Después de crear cada coordinador, agregar su `uid` al array `coordinadorIds` de la sucursal correspondiente. Ver [PILOT_BRANCHES_TEMPLATE.md](./PILOT_BRANCHES_TEMPLATE.md).

---

## Vendedores

### Vendedor 1 — Querétaro

**Documento:** `usuarios/UID_VEND_QRO_01_AQUI`

```json
{
  "uid": "UID_VEND_QRO_01_AQUI",
  "email": "vendedor1.qro@zapata.com.mx",
  "nombre": "Vendedor 1 Querétaro",
  "rol": "vendedor",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Querétaro",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

### Vendedor 2 — Querétaro

**Documento:** `usuarios/UID_VEND_QRO_02_AQUI`

```json
{
  "uid": "UID_VEND_QRO_02_AQUI",
  "email": "vendedor2.qro@zapata.com.mx",
  "nombre": "Vendedor 2 Querétaro",
  "rol": "vendedor",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Querétaro",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

### Vendedor 1 — Monterrey

**Documento:** `usuarios/UID_VEND_MTY_01_AQUI`

```json
{
  "uid": "UID_VEND_MTY_01_AQUI",
  "email": "vendedor1.mty@zapata.com.mx",
  "nombre": "Vendedor 1 Monterrey",
  "rol": "vendedor",
  "sucursalId": "suc-mty",
  "sucursalNombre": "Monterrey",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

### Vendedor 2 — Monterrey

**Documento:** `usuarios/UID_VEND_MTY_02_AQUI`

```json
{
  "uid": "UID_VEND_MTY_02_AQUI",
  "email": "vendedor2.mty@zapata.com.mx",
  "nombre": "Vendedor 2 Monterrey",
  "rol": "vendedor",
  "sucursalId": "suc-mty",
  "sucursalNombre": "Monterrey",
  "activo": true,
  "telefono": "",
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

---

## Cómo crear usuario soporte por primera vez (bootstrap)

Este flujo es para el primer soporte en un ambiente nuevo, cuando nadie puede entrar todavía:

1. El futuro soporte inicia sesión con Google en la app.
2. La app lo redirige a `/unauthorized` (esperado — no existe `usuarios/{uid}` aún).
3. Alguien con acceso a Firestore Console obtiene el UID:
   - Firebase Console > Authentication > Users > buscar el correo > copiar UID.
4. Crear `usuarios/{uid}` con los campos del template de soporte arriba.
5. El usuario recarga la app o cierra e inicia sesión de nuevo.
6. Ahora tiene acceso completo con rol `soporte`.

---

## Notas

- `sucursalNombre` es desnormalización intencional para lecturas rápidas en la UI (topbar, solicitudes). Si el nombre de una sucursal cambia, actualizar también el campo en todos los usuarios de esa sucursal.
- `activo: false` bloquea al usuario sin borrar su historial de solicitudes/acciones.
- No existe "superadmin" — `soporte` es el rol más amplio del piloto.
- Para usuarios adicionales durante el piloto, repetir el mismo proceso: login → UID → crear documento en `usuarios/{uid}`.
