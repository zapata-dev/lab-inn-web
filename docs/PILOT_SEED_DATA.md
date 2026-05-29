# Pilot Seed Data (LAB-PROD-021)

Guía operativa para sembrar los datos mínimos antes del QA end-to-end en ambiente dev/piloto.

---

## 1. Qué se siembra y en qué orden

| Paso | Qué | Dónde | Quién |
|------|-----|-------|-------|
| 1 | Sucursales | `sucursales/{sucursalId}` | Soporte vía Firestore Console |
| 2 | Primer usuario soporte | `usuarios/{uid}` | Soporte vía Firestore Console |
| 3 | Usuarios vendedores y coordinadores | `usuarios/{uid}` | Soporte vía Firestore Console |
| 4 | Asociar coordinadores a sucursales | `sucursales/{sucursalId}.coordinadorIds` | Soporte vía Firestore Console |
| 5 | Inventario inicial | `inventario/{vin}` | Import CSV vía `runInventoryImportNow` |

El inventario **no se carga a mano**. Viene del importador para garantizar consistencia de campos y trazabilidad.

---

## 2. Datos mínimos para QA

| Entidad | Mínimo |
|---------|--------|
| Sucursales | 2 (para poder probar solicitudes entre ellas) |
| Usuario soporte | 1 |
| Usuarios coordinadores | 1 por sucursal (2 total) |
| Usuarios vendedores | 2-3 por sucursal (4-6 total) |
| Unidades inventario | Depende del CSV; 10+ unidades distribuidas entre las 2 sucursales |

---

## 3. Plantillas

- **Sucursales** → [PILOT_BRANCHES_TEMPLATE.md](./PILOT_BRANCHES_TEMPLATE.md)
- **Usuarios** → [PILOT_USERS_TEMPLATE.md](./PILOT_USERS_TEMPLATE.md)

---

## 4. Inventario: vía import, no manual

### Paso a paso

1. Configurar `INVENTORY_CSV_URL` en Cloud Functions:

```bash
npx firebase-tools functions:secrets:set INVENTORY_CSV_URL
# Pegar la URL del Google Sheet cuando lo pida
```

2. Login como soporte en la app (`VITE_AUTH_MODE=firebase`).
3. Ir a `/soporte/inventario/imports`.
4. En "Ejecutar import manual", dejar URL vacía (usa la configurada en Functions) o pegar URL directa.
5. Click "Ejecutar import ahora" → confirmar.
6. Esperar resultado (10-60 segundos según tamaño del CSV).

### Validar

- `importsInventario/{importId}` con `status = "completado"` o `"completado_con_errores"`.
- `inventario/{vin}` con `importStatus = "active"` para las unidades del CSV.
- Banner de frescura en Inventario Nacional indica hora del último import.
- Card de último import muestra unidades, calidad y drift.

Si hay `registrosConError > 0`: abrir detalle del import y revisar `erroresPorTipo`. Las filas con error no bloquean el resto del import.

---

## 5. systemConfig (opcional para piloto)

Si el código lo requiere, crear documentos en `systemConfig/`:

```txt
systemConfig/roles
systemConfig/estadosSolicitud
systemConfig/notificaciones
systemConfig/inventario
```

Estos documentos son configuración de catálogos. Si no existe UI que los lea, se pueden diferir para LAB-PROD-022+.

---

## 6. Qué NO subir al repo

| Archivo | Por qué |
|---------|---------|
| `.firebaserc` real | Contiene projectId del proyecto Firebase |
| `.env.local` | Contiene API keys reales |
| `functions/.env` | Contiene URL privada de CSV/Sheets |
| Cualquier archivo con UIDs, emails o nombres reales | Datos personales / operativos |

Las plantillas de este ticket usan placeholders (`UID_REAL_AQUI`, etc.) para evitar filtraciones.

---

## 7. Checklist completo

Ver [PILOT_INITIAL_DATA_CHECKLIST.md](./PILOT_INITIAL_DATA_CHECKLIST.md).
