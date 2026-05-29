# Pilot Branches Template (LAB-PROD-021)

Plantillas para crear las sucursales piloto en `sucursales/{sucursalId}`.

Crear en **Firestore Console > sucursales > Add document**. El ID del documento debe ser el mismo que `sucursalId`.

---

## Sucursal 1 — Querétaro

**Documento:** `sucursales/suc-qro`

```json
{
  "sucursalId": "suc-qro",
  "nombre": "Querétaro",
  "ciudad": "Querétaro",
  "estado": "Querétaro",
  "region": "Bajío",
  "activa": true,
  "coordinadorIds": [],
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

---

## Sucursal 2 — Monterrey

**Documento:** `sucursales/suc-mty`

```json
{
  "sucursalId": "suc-mty",
  "nombre": "Monterrey",
  "ciudad": "Monterrey",
  "estado": "Nuevo León",
  "region": "Norte",
  "activa": true,
  "coordinadorIds": [],
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

---

## Sucursal 3 (opcional) — Ciudad de México

**Documento:** `sucursales/suc-cdmx`

```json
{
  "sucursalId": "suc-cdmx",
  "nombre": "Ciudad de México",
  "ciudad": "Ciudad de México",
  "estado": "CDMX",
  "region": "Centro",
  "activa": true,
  "coordinadorIds": [],
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

---

## Cómo agregar coordinadorIds después de crear usuarios

Una vez creados los usuarios coordinadores:

1. Abrir el documento `sucursales/{sucursalId}` en Firestore Console.
2. Editar el campo `coordinadorIds`.
3. Agregar el `uid` del coordinador asignado a esa sucursal.

Ejemplo para `suc-qro` con un coordinador:

```json
{
  "coordinadorIds": ["UID_COORDINADOR_QRO_AQUI"]
}
```

`coordinadorIds` es un array. Si hay más de un coordinador por sucursal, agregar todos sus UIDs.

---

## Notas

- El `sucursalId` debe coincidir exactamente con el campo `sucursalId` en los documentos `usuarios/{uid}` de los usuarios de esa sucursal.
- Las unidades de inventario importadas tendrán `sucursalId` según el campo en el CSV. Confirmar que los valores del CSV coincidan con los IDs creados aquí.
- Para renombrar una sucursal, actualizar `nombre` en `sucursales/{sucursalId}` **y** el campo `sucursalNombre` desnormalizado en todos los `usuarios/{uid}` de esa sucursal. La desnormalización es intencional para lecturas rápidas.
